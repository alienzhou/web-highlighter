import '@src/util/dataset.polyfill';
import EventEmitter from '@src/util/event.emitter';
import HighlightRange from '@src/model/range';
import HighlightSource from '@src/model/source';
import uuid from '@src/util/uuid';
import Hook from '@src/util/hook';
import event from '@src/util/interaction';
import Cache from '@src/data/cache';
import Painter from '@src/painter';
import {DEFAULT_OPTIONS} from '@src/util/const';
import {
    ERROR,
    DomNode,
    DomMeta,
    HookMap,
    EventType,
    HighlighterOptions
} from './types';
import {
    addClass,
    removeClass,
    isHighlightWrapNode,
    getHighlightById,
    getHighlightsByRoot,
    getHighlightId,
    addEventListener,
    removeEventListener
} from '@src/util/dom';

export default class Highlighter extends EventEmitter {
    static event = EventType;

    private _hoverId: string;
    options: HighlighterOptions;
    hooks: HookMap;
    painter: Painter;
    cache: Cache;

    constructor(options: HighlighterOptions) {
        super();
        this.options = DEFAULT_OPTIONS;
        this.hooks = this._getHooks(); // initialize hooks
        this.setOption(options);
        this.cache = new Cache(); // initialize cache
        const $root = this.options.$root;
        addEventListener($root, event.PointerOver, this._handleHighlightHover); // initialize event listener
        addEventListener($root, event.PointerTap, this._handleHighlightClick); // initialize event listener
    }

    private _getHooks = () => ({
        Render: {
            UUID: new Hook('Render.UUID'),
            SelectedNodes: new Hook('Render.SelectedNodes'),
            WrapNode: new Hook('Render.WrapNode')
        },
        Serialize: {
            RecordInfo: new Hook('Serialize.RecordInfo')
        },
        Remove: {
            UpdateNodes: new Hook('Remove.UpdateNodes')
        }
    });

    private _highlighFromHRange = (range: HighlightRange): HighlightSource => {
        const source: HighlightSource = range.serialize(this.options.$root, this.hooks);
        const $wraps = this.painter.highlightRange(range);
        if ($wraps.length === 0) {
            console.warn(ERROR.DOM_SELECTION_EMPTY);
            return null;
        }
        this.cache.save(source);
        this.emit(EventType.CREATE, {sources: [source], type: 'from-input'}, this);
        return source;
    }

    private _highlighFromHSource(sources: HighlightSource[] | HighlightSource = []) {
        const renderedSources: Array<HighlightSource> = this.painter.highlightSource(sources);;
        this.emit(EventType.CREATE, {sources: renderedSources, type: 'from-store'}, this);
        this.cache.save(sources);
    }

    private _handleSelection = (e?: Event) => {
        const range = HighlightRange.fromSelection(this.hooks.Render.UUID);
        if (range) {
            this._highlighFromHRange(range);
            HighlightRange.removeDomRange();
        }
    }

    private _handleHighlightHover = e => {
        const $target = e.target as HTMLElement;
        if (!isHighlightWrapNode($target)) {
            this._hoverId && this.emit(EventType.HOVER_OUT, {id: this._hoverId}, this, e);
            this._hoverId = null;
            return;
        }

        const id = getHighlightId($target);
        // prevent trigger in the same highlight range
        if (this._hoverId === id) {
            return;
        }

        // hover another highlight range, need to trigger previous highlight hover out event
        if (this._hoverId) {
            this.emit(EventType.HOVER_OUT, {id: this._hoverId}, this, e);
        }
        this._hoverId = id;
        this.emit(EventType.HOVER, {id: this._hoverId}, this, e);
    }

    private _handleHighlightClick = (e): void => {
        const $target = e.target as HTMLElement;
        if (isHighlightWrapNode($target)) {
            const id = getHighlightId($target);
            this.emit(EventType.CLICK, {id}, this, e);
        }
    }

    run = () => addEventListener(this.options.$root, event.PointerEnd, this._handleSelection);
    stop = () => removeEventListener(this.options.$root, event.PointerEnd, this._handleSelection);

    addClass = (className: string, id?: string) => this.getDoms(id).forEach($n => addClass($n, className));
    removeClass = (className: string, id?: string) => this.getDoms(id).forEach($n => removeClass($n, className));

    getIdByDom = ($node: HTMLElement): string => getHighlightId($node);
    getDoms = (id?: string): Array<HTMLElement> => id
        ? getHighlightById(this.options.$root, id, this.options.wrapTag)
        : getHighlightsByRoot(this.options.$root, this.options.wrapTag);

    dispose = () => {
        const $root = this.options.$root;
        removeEventListener($root, event.PointerOver, this._handleHighlightHover);
        removeEventListener($root, event.PointerEnd, this._handleSelection);
        removeEventListener($root, event.PointerTap, this._handleHighlightClick);
        this.removeAll();
    }

    setOption = (options: HighlighterOptions) => {
        this.options = {
            ...this.options,
            ...options
        };
        this.painter = new Painter({
            $root: this.options.$root,
            wrapTag: this.options.wrapTag,
            className: this.options.style.className,
            exceptSelectors: this.options.exceptSelectors
        }, this.hooks);
    }

    fromRange = (range: Range): HighlightSource => {
        const start: DomNode = {
            $node: range.startContainer,
            offset: range.startOffset
        };
        const end: DomNode = {
            $node: range.endContainer,
            offset: range.endOffset
        }

        const text = range.toString();
        let id = this.hooks.Render.UUID.call(start, end, text);
        id = id !== undefined && id !== null ? id : uuid();
        const hRange = new HighlightRange(start, end, text, id);
        if (!hRange) {
            console.warn(ERROR.RANGE_INVALID);
            return null;
        }
        return this._highlighFromHRange(hRange);
    }

    fromStore = (start: DomMeta, end: DomMeta, text, id): HighlightSource => {
        try {
            const hs = new HighlightSource(start, end, text, id);
            this._highlighFromHSource(hs);
            return hs;
        }
        catch (err) {
            console.error(err, id, text, start, end);
            return null;
        }
    }

    remove(id: string) {
        if (!id) {
            return;
        }
        this.painter.removeHighlight(id);
        this.cache.remove(id);
        this.emit(EventType.REMOVE, {ids: [id]}, this);
    }

    removeAll() {
        this.painter.removeAllHighlight();
        const ids = this.cache.removeAll();
        this.emit(EventType.REMOVE, {ids: ids}, this);
    }
}
