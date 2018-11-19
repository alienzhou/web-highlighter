// cSpell:ignore camelcase
import * as EventEmitter from 'eventemitter3';
import {
    EventType,
    HighlighterOptions
} from './model/types';
import {
    DEFAULT_OPTIONS,
    CAMEL_DATASET_IDENTIFIER
} from './util/const';
import Highlight from './model/highlight';
import {Store} from './model/types';
import Paint from './paint';
import store from './data';

export default class Highlighter extends EventEmitter {
    static event = EventType;

    options: HighlighterOptions;
    paint: Paint;
    store: Store<Highlight>;
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
        this.store = store;
    }

    private _handleSelection = (e: Event) => {
        const highlight = this.paint.highlightSelection();
        if (!highlight) {
            return;
        }
        this.store.save(highlight);

        this.emit(EventType.CREATE, [highlight]);
    }

    run = () => this.options.$root.addEventListener('mouseup', this._handleSelection);
    stop = () => this.options.$root.removeEventListener('mouseup', this._handleSelection);

    async init() {
        const highlights = await this.store.getAll();
        highlights.forEach(h => this.paint.renderHighlight(h));
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

        this.emit(EventType.INIT, highlights);
    }

    render(highlights: Highlight[] | Highlight) {
        const list = Array.isArray(Highlight)
            ? highlights as Highlight[]
            : [highlights as Highlight];

        list.forEach(h => this.paint.renderHighlight(h));

        this.emit(EventType.CREATE, highlights);
        return this;
    }

    remove(id: string) {
        if (!id) {
            return;
        }
        this.paint.removeHighlight(id);
        this.store.remove(id);

        this.emit(EventType.REMOVE, id);
    }

    removeAll() {
        this.paint.removeAllHighlight();
        this.store.removeAll();

        this.emit(EventType.REMOVE);
    }
}

export const event = EventType;