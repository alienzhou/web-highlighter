import * as EventEmitter from 'eventemitter3';
import {EventType, HighlighterOptions, ERROR} from './types';
import {DEFAULT_OPTIONS, CAMEL_DATASET_IDENTIFIER} from './util/const';
import HighlightRange from './model/range';
import HighlightSource from './model/source';
import Cache from './data/cache';
import Paint from './paint';
import Store from './addons/store/local.store';

const schemeValidate = obj => {
    if (!obj.startMeta) {
        return false;
    }
    if (!obj.endMeta) {
        return false;
    }
    if (!obj.text) {
        return false;
    }
    if (!obj.id) {
        return false;
    }
    return true;
};

export default class Highlighter extends EventEmitter {
    static event = EventType;
    static LocalStore = Store;
    static buildFromJSON(obj: HighlightSource) {
        if (schemeValidate(obj)) {
            return null;
        }

        const source = new HighlightSource(
            obj.startMeta,
            obj.endMeta,
            obj.text,
            obj.id
        );
        return source;
    }

    options: HighlighterOptions;
    paint: Paint;
    cache: Cache;
    _hoverId: string;

    constructor(options: HighlighterOptions) {
        super();
        this.options = {
            ...DEFAULT_OPTIONS,
            ...options
        };
        this.paint = new Paint({
            $root: this.options.$root,
            highlightClassName: this.options.style.highlightClassName
        });
        this.cache = new Cache(this.options.useLocalStore);
    }

    private _handleSelection = (e: Event) => {
        const range = HighlightRange.fromSelection();
        if (!range) {
            return;
        }
        const source: HighlightSource = range.freeze();
        this.paint.highlightRange(range);
        this.cache.save(source);
        this.emit(EventType.CREATE, [source]);
        HighlightRange.removeDomRange();
    }

    run = () => this.options.$root.addEventListener('mouseup', this._handleSelection);
    stop = () => this.options.$root.removeEventListener('mouseup', this._handleSelection);

    init(sources: HighlightSource[] = []) {
        sources.forEach(s => {
            if (s instanceof HighlightSource) {
                this.paint.highlightSource(s);
                return;
            }
            console.error(ERROR.SOURCE_TYPE_ERROR);
        });
        this.cache.save(sources);
        this.emit(EventType.INIT, sources);

        this.options.$root.addEventListener('mouseover', e => {
            const $target = e.target as HTMLElement;
            const id = $target.dataset ? $target.dataset[CAMEL_DATASET_IDENTIFIER] : undefined;
            // 未 hover 到 highlight 上
            if (!id) {
                // 离开 highlight
                if (this._hoverId) {
                    this.emit(EventType.HOVER_OUT, this._hoverId);
                }

                this._hoverId = null;
                return;
            }
            // 同一个 highlight 上不重复触发
            if (this._hoverId === id) {
                return;
            }
            this._hoverId = id;
            this.emit(EventType.HOVER, this._hoverId);
        });
    }

    render(sources: HighlightSource[] | HighlightSource) {
        const list = Array.isArray(sources)
            ? sources as HighlightSource[]
            : [sources as HighlightSource];

        list.forEach(s => this.paint.highlightSource(s));

        this.emit(EventType.CREATE, sources);
        return this;
    }

    remove(id: string) {
        if (!id) {
            return;
        }
        this.paint.removeHighlight(id);
        this.cache.remove(id);

        this.emit(EventType.REMOVE, [id]);
    }

    removeAll() {
        this.paint.removeAllHighlight();
        const ids = this.cache.removeAll();

        this.emit(EventType.REMOVE, ids);
    }
}
