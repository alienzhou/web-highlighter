import type {
    DomNode,
    DomMeta,
    HookMap,
    HighlighterOptions,
    FromRangeOptions,
    SelectionMode,
    DiagnosticSnapshot,
    DiagnosticOptions,
} from '@src/types';
import EventEmitter from '@src/util/event.emitter';
import HighlightRange from '@src/model/range';
import { getDomMeta } from '@src/model/range/dom';
import HighlightSource from '@src/model/source';
import uuid from '@src/util/uuid';
import Hook from '@src/util/hook';
import getInteraction from '@src/util/interaction';
import Cache from '@src/data/cache';
import Painter from '@src/painter';
import { eventEmitter, getDefaultOptions, INTERNAL_ERROR_EVENT } from '@src/util/const';
import { ERROR, EventType, CreateFrom } from '@src/types';
import {
    addClass,
    removeClass,
    isHighlightWrapNode,
    getHighlightById,
    getExtraHighlightId,
    getHighlightsByRoot,
    getHighlightId,
    getHighlightWrapNode,
    isInsideRoot,
    addEventListener,
    removeEventListener,
} from '@src/util/dom';

interface EventHandlerMap {
    [key: string]: (...args: any[]) => void;
    [EventType.CLICK]: (data: { id: string }, h: Highlighter, e: MouseEvent | TouchEvent) => void;
    [EventType.HOVER]: (data: { id: string }, h: Highlighter, e: MouseEvent | TouchEvent) => void;
    [EventType.HOVER_OUT]: (data: { id: string }, h: Highlighter, e: MouseEvent | TouchEvent) => void;
    [EventType.CREATE]: (data: { sources: HighlightSource[]; type: CreateFrom }, h: Highlighter) => void;
    [EventType.REMOVE]: (data: { ids: string[] }, h: Highlighter) => void;
}

export default class Highlighter extends EventEmitter<EventHandlerMap> {
    static event = EventType;

    static isHighlightWrapNode = isHighlightWrapNode;

    hooks: HookMap;

    painter: Painter;

    cache: Cache;

    private _hoverId: string;

    private _isRunning = false;

    private _isDisposed = false;

    private readonly _diagnosticErrors: Array<{
        type: ERROR;
        message?: string;
        sourceId?: string;
    }> = [];

    private options: HighlighterOptions;

    private readonly event = getInteraction();

    constructor(options?: HighlighterOptions) {
        super();
        this.options = getDefaultOptions();
        // initialize hooks
        this.hooks = this._getHooks();
        this.setOption(options);
        // initialize cache
        this.cache = new Cache();

        const $root = this.options.$root;

        // initialize event listener
        addEventListener($root, this.event.PointerOver, this._handleHighlightHover);
        // initialize event listener
        addEventListener($root, this.event.PointerTap, this._handleHighlightClick);
        eventEmitter.on(INTERNAL_ERROR_EVENT, this._handleError);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    static isHighlightSource = (d: any) => !!d.__isHighlightSource;

    run = () => {
        this._isRunning = true;
        addEventListener(this.options.$root, this.event.PointerEnd, this._handleSelection);
    };

    stop = () => {
        this._isRunning = false;
        removeEventListener(this.options.$root, this.event.PointerEnd, this._handleSelection);
    };

    addClass = (className: string, id?: string) => {
        this.getDoms(id).forEach($n => {
            addClass($n, className);
        });
    };

    removeClass = (className: string, id?: string) => {
        this.getDoms(id).forEach($n => {
            removeClass($n, className);
        });
    };

    getIdByDom = ($node: HTMLElement): string => getHighlightId($node, this.options.$root);

    getExtraIdByDom = ($node: HTMLElement): string[] => getExtraHighlightId($node, this.options.$root);

    getDoms = (id?: string): HTMLElement[] =>
        id
            ? getHighlightById(this.options.$root, id, this.options.wrapTag)
            : getHighlightsByRoot(this.options.$root, this.options.wrapTag);

    getSourceByDom = ($node: HTMLElement): HighlightSource => {
        const $wrap = getHighlightWrapNode($node, this.options.$root);
        const $text = $wrap && ($wrap.firstChild as Text);

        if (!$text || $text.nodeType !== 3) {
            return null;
        }

        const start = getDomMeta($text, 0, this.options.$root);
        const end = getDomMeta($text, $text.length, this.options.$root);

        return new HighlightSource(start, end, $text.textContent, getHighlightId($wrap, this.options.$root));
    };

    /**
     * Capture a reproducible runtime snapshot for a bug report.
     * Default mode is safe: it excludes root HTML and HighlightSource text.
     * Pass `{dom: 'redacted'}` for a text-free structure, or explicitly opt in
     * to `{dom: 'full', sources: 'full'}` only after reviewing sensitive data.
     */
    getDiagnostics = (options: DiagnosticOptions = {}): DiagnosticSnapshot => {
        const { dom = 'none', sources: sourceMode = 'metadata', maxDomLength = 20000 } = options;
        const selection = window.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        const $root = this.options.$root;
        const rootElement = $root instanceof Document ? $root.documentElement : $root;
        const sources = this.cache.getAll();
        const snapshot: DiagnosticSnapshot = {
            libraryVersion: '0.7.4',
            timestamp: new Date().toISOString(),
            lifecycle: {
                isRunning: this._isRunning,
                isDisposed: this._isDisposed,
            },
            runtime: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                viewport:
                    typeof window.innerWidth === 'number'
                        ? {
                              width: window.innerWidth,
                              height: window.innerHeight,
                          }
                        : undefined,
                capabilities: {
                    selection: typeof window.getSelection === 'function',
                    range: typeof document.createRange === 'function',
                    touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
                },
            },
            configuration: {
                root: {
                    nodeName: rootElement?.nodeName || '#document',
                    id: rootElement?.id || null,
                    className: rootElement?.className || null,
                },
                wrapTag: this.options.wrapTag,
                exceptSelectors: this.options.exceptSelectors,
                verbose: this.options.verbose,
            },
            selection: {
                rangeCount: selection?.rangeCount || 0,
                isCollapsed: selection?.isCollapsed || false,
                textLength: selection?.toString().length || 0,
                ...(range
                    ? {
                          start: {
                              nodeType: range.startContainer.nodeType,
                              nodeName: range.startContainer.nodeName,
                              offset: range.startOffset,
                          },
                          end: {
                              nodeType: range.endContainer.nodeType,
                              nodeName: range.endContainer.nodeName,
                              offset: range.endOffset,
                          },
                      }
                    : {}),
            },
            highlights: {
                wrapperCount: this.getDoms().length,
                sourceCount: sources.length,
                sources: sources.map(source => ({
                    id: source.id,
                    textLength: source.text.length,
                    startMeta: source.startMeta,
                    endMeta: source.endMeta,
                })),
            },
            errors: [...this._diagnosticErrors],
        };

        if (dom !== 'none' && rootElement) {
            const originalHtml = rootElement.outerHTML;
            const html = dom === 'redacted' ? this._redactHtml(rootElement) : originalHtml;

            snapshot.document = {
                mode: dom,
                html: html.slice(0, Math.max(0, maxDomLength)),
                originalLength: html.length,
                truncated: html.length > maxDomLength,
            };
        }

        if (sourceMode === 'full') {
            snapshot.fullSources = sources.map(source => ({
                startMeta: source.startMeta,
                endMeta: source.endMeta,
                text: source.text,
                id: source.id,
                ...(typeof source.extra === 'undefined' ? {} : { extra: source.extra }),
            }));
        }

        return snapshot;
    };

    dispose = () => {
        this._isDisposed = true;
        this.stop();

        const $root = this.options.$root;

        removeEventListener($root, this.event.PointerOver, this._handleHighlightHover);
        removeEventListener($root, this.event.PointerTap, this._handleHighlightClick);
        this.removeAll();
    };

    setOption = (options?: HighlighterOptions) => {
        this.options = {
            ...this.options,
            ...options,
        };
        this.painter = new Painter(
            {
                $root: this.options.$root,
                wrapTag: this.options.wrapTag,
                className: this.options.style.className,
                exceptSelectors: this.options.exceptSelectors,
            },
            this.hooks,
        );
    };

    fromRange = (range: Range, options?: FromRangeOptions): HighlightSource => {
        const start: DomNode = {
            $node: range.startContainer,
            offset: range.startOffset,
        };
        const end: DomNode = {
            $node: range.endContainer,
            offset: range.endOffset,
        };

        const text = range.toString();
        let id = this.hooks.Render.UUID.call(start, end, text);

        id = typeof id !== 'undefined' && id !== null ? id : uuid();

        const hRange = new HighlightRange(start, end, text, id);

        if (!hRange.isValid()) {
            eventEmitter.emit(INTERNAL_ERROR_EVENT, {
                type: ERROR.RANGE_INVALID,
            });

            return null;
        }

        return this._highlightFromHRange(hRange, options?.selection ?? 'keep');
    };

    fromStore = (start: DomMeta, end: DomMeta, text: string, id: string, extra?: unknown): HighlightSource => {
        const hs = new HighlightSource(start, end, text, id, extra);

        try {
            this._highlightFromHSource(hs);

            return hs;
        } catch (err: unknown) {
            eventEmitter.emit(INTERNAL_ERROR_EVENT, {
                type: ERROR.HIGHLIGHT_SOURCE_RECREATE,
                error: err,
                detail: hs,
            });

            return null;
        }
    };

    remove(id: string) {
        if (!id) {
            return;
        }

        const doseExist = this.painter.removeHighlight(id);

        this.cache.remove(id);

        // only emit REMOVE event when highlight exist
        if (doseExist) {
            this.emit(EventType.REMOVE, { ids: [id] }, this);
        }
    }

    removeAll() {
        this.painter.removeAllHighlight();

        const ids = this.cache.removeAll();

        this.emit(EventType.REMOVE, { ids }, this);
    }

    private readonly _redactHtml = (root: HTMLElement): string => {
        const clone = root.cloneNode(true) as HTMLElement;
        const textNodes: Text[] = [];
        const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
        let current: Node;

        while ((current = walker.nextNode())) {
            textNodes.push(current as Text);
        }

        textNodes.forEach($text => {
            $text.textContent = `[…](${($text.textContent || '').length})`;
        });

        return clone.outerHTML;
    };

    private readonly _getHooks = (): HookMap => ({
        Render: {
            UUID: new Hook('Render.UUID'),
            SelectedNodes: new Hook('Render.SelectedNodes'),
            WrapNode: new Hook('Render.WrapNode'),
        },
        Serialize: {
            Restore: new Hook('Serialize.Restore'),
            RecordInfo: new Hook('Serialize.RecordInfo'),
        },
        Remove: {
            UpdateNodes: new Hook('Remove.UpdateNodes'),
        },
    });

    private readonly _highlightFromHRange = (
        range: HighlightRange,
        selectionMode: SelectionMode = 'keep',
    ): HighlightSource => {
        if (
            !isInsideRoot(range.start.$node, this.options.$root) ||
            !isInsideRoot(range.end.$node, this.options.$root)
        ) {
            eventEmitter.emit(INTERNAL_ERROR_EVENT, {
                type: ERROR.RANGE_OUT_OF_ROOT,
            });

            return null;
        }

        const source: HighlightSource = range.serialize(this.options.$root, this.hooks);

        // the native selection is live: splitting text nodes while it still
        // covers them makes the browser recompute (and truncate) its boundaries
        if (selectionMode !== 'keep') {
            HighlightRange.removeDomRange();
        }

        const $wraps = this.painter.highlightRange(range);

        if ($wraps.length === 0) {
            eventEmitter.emit(INTERNAL_ERROR_EVENT, {
                type: ERROR.DOM_SELECTION_EMPTY,
            });

            return null;
        }

        if (selectionMode === 'restore') {
            HighlightRange.restoreDomRange($wraps);
        }

        this.cache.save(source);
        this.emit(EventType.CREATE, { sources: [source], type: CreateFrom.INPUT }, this);

        return source;
    };

    private _highlightFromHSource(sources: HighlightSource | HighlightSource[] = []) {
        const renderedSources: HighlightSource[] = this.painter.highlightSource(sources);

        this.emit(EventType.CREATE, { sources: renderedSources, type: CreateFrom.STORE }, this);
        this.cache.save(sources);
    }

    private readonly _handleSelection = () => {
        const range = HighlightRange.fromSelection(this.hooks.Render.UUID);

        if (range) {
            this._highlightFromHRange(range, 'clear');
        }
    };

    private readonly _handleHighlightHover = (e: MouseEvent | TouchEvent) => {
        const $target = e.target as HTMLElement;

        if (!isHighlightWrapNode($target)) {
            this._hoverId && this.emit(EventType.HOVER_OUT, { id: this._hoverId }, this, e);
            this._hoverId = null;

            return;
        }

        const id = getHighlightId($target, this.options.$root);

        // prevent trigger in the same highlight range
        if (this._hoverId === id) {
            return;
        }

        // hover another highlight range, need to trigger previous highlight hover out event
        if (this._hoverId) {
            this.emit(EventType.HOVER_OUT, { id: this._hoverId }, this, e);
        }

        this._hoverId = id;
        this.emit(EventType.HOVER, { id: this._hoverId }, this, e);
    };

    private readonly _handleError = (data: { type: ERROR; detail?: HighlightSource; error?: any }) => {
        this._diagnosticErrors.push({
            type: data.type,
            ...(data.error instanceof Error ? { message: data.error.message } : {}),
            ...(data.detail?.id ? { sourceId: data.detail.id } : {}),
        });

        if (this._diagnosticErrors.length > 20) {
            this._diagnosticErrors.shift();
        }

        if (this.options.verbose) {
            // eslint-disable-next-line no-console
            console.warn(data);
        }
    };

    private readonly _handleHighlightClick = (e: MouseEvent | TouchEvent) => {
        const $target = e.target as HTMLElement;

        if (isHighlightWrapNode($target)) {
            const id = getHighlightId($target, this.options.$root);

            this.emit(EventType.CLICK, { id }, this, e);
        }
    };
}
