export interface HighlighterOptions {
    $root: HTMLElement | Document;
    useLocalStore: boolean;
    style?: {
        highlightClassName?: string;
    }
};

export interface PainterOptions {
    $root: HTMLElement | Document,
    highlightClassName?: string
};

export enum SplitType {
    none = 'none',
    head = 'head',
    tail = 'tail',
    both = 'both'
};

export enum ERROR {
    DOM_TYPE_ERROR = '[DOM] receive wrong node type',
    DB_ID_DUPLICATE_ERROR = '[STORE] unique id conflict',
    CACHE_SET_ERROR = '[CACHE] cache.data can\'t be set manually, please use .save()',
    SOURCE_TYPE_ERROR = '[SOURCE] object isn\'t a highlight source instance',
    HIGHLIGHT_RANGE_FROZEN = '[HIGHLIGHT_RANGE] a highlight range must be frozen before render'
};

export enum EventType {
    INIT = 'highlight:init',
    CREATE = 'selection:create',
    REMOVE = 'selection:remove',
    MODIFY = 'selection:modify',
    HOVER = 'selection:hover',
    HOVER_OUT = 'selection:hover-out'
};

export enum SelectedNodeType {
    text = 'text',
    span = 'span'
};

export interface SelectedNode {
    $node: Text | Node,
    type: SelectedNodeType,
    splitType: SplitType
};

export interface DomMeta {
    parentTagName: string;
    parentIndex: number;
    textOffset: number;
}

export interface DomNode {
    $node: Node;
    offset: number;
}