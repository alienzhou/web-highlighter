import type Hook from '@src/util/hook';

export type RootElement = Document | HTMLElement;

export interface HighlighterOptions {
    $root?: RootElement;
    rootDocument?: Document;
    exceptSelectors?: string[];
    wrapTag?: string;
    verbose?: boolean;
    style?: {
        className?: string[] | string;
    };
    window: Window;
}

export interface PainterOptions {
    $root: RootElement;
    rootDocument: Document;
    wrapTag: string;
    className: string[] | string;
    exceptSelectors: string[];
}

export enum SplitType {
    none = 'none',
    head = 'head',
    tail = 'tail',
    both = 'both',
}

export enum ERROR {
    DOM_TYPE_ERROR = '[DOM] Receive wrong node type.',
    DOM_SELECTION_EMPTY = '[DOM] The selection contains no dom node, may be you except them.',
    RANGE_INVALID = "[RANGE] Got invalid dom range, can't convert to a valid highlight range.",
    RANGE_NODE_INVALID = "[RANGE] Start or end node isn't a text node, it may occur an error.",
    DB_ID_DUPLICATE_ERROR = '[STORE] Unique id conflict.',
    CACHE_SET_ERROR = "[CACHE] Cache.data can't be set manually, please use .save().",
    SOURCE_TYPE_ERROR = "[SOURCE] Object isn't a highlight source instance.",
    HIGHLIGHT_RANGE_FROZEN = '[HIGHLIGHT_RANGE] A highlight range must be frozen before render.',
    HIGHLIGHT_SOURCE_RECREATE = '[HIGHLIGHT_SOURCE] Recreate highlights from sources error.',
    // eslint-disable-next-line max-len
    HIGHLIGHT_SOURCE_NONE_RENDER = "[HIGHLIGHT_SOURCE] This highlight source isn't rendered. May be the exception skips it or the dom structure has changed.",
}

export enum EventType {
    CREATE = 'selection:create',
    REMOVE = 'selection:remove',
    MODIFY = 'selection:modify',
    HOVER = 'selection:hover',
    HOVER_OUT = 'selection:hover-out',
    CLICK = 'selection:click',
}

export enum CreateFrom {
    STORE = 'from-store',
    INPUT = 'from-input',
}

export enum SelectedNodeType {
    text = 'text',
    span = 'span',
}

export interface SelectedNode {
    $node: Node | Text;
    type: SelectedNodeType;
    splitType: SplitType;
}

export interface DomMeta {
    parentTagName: string;
    parentIndex: number;
    textOffset: number;
    extra?: unknown;
}

export interface DomNode {
    $node: Node;
    offset: number;
}

export interface HighlightPosition {
    start: {
        top: number;
        left: number;
    };
    end: {
        top: number;
        left: number;
    };
}

export interface HookMap {
    Render: {
        UUID: Hook<string>;
        SelectedNodes: Hook<SelectedNode[]>;
        WrapNode: Hook<HTMLElement>;
    };
    Serialize: {
        Restore: Hook<DomNode[]>;
        RecordInfo: Hook<string>;
    };
    Remove: {
        UpdateNodes: Hook;
    };
}

export enum UserInputEvent {
    touchend = 'touchend',
    mouseup = 'mouseup',
    touchstart = 'touchstart',
    click = 'click',
    mouseover = 'mouseover',
}

export interface IInteraction {
    PointerEnd: UserInputEvent;
    PointerTap: UserInputEvent;
    PointerOver: UserInputEvent;
}
