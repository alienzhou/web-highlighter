export interface NodeMeta {
    tagName: string,
    index: number
};

export interface HighlightNodePartial {
    offset: number,
    domNode: NodeMeta,
    textNode: {
        index: number
    }
};

export interface HighlightSource {
    start: HighlightNodePartial,
    end: HighlightNodePartial,
    id: string
};

export interface HighlightRange {
    $startNode: Node,
    $endNode: Node,
    startOffset: number,
    endOffset: number,
    id?: string
};

export interface PainterOptions {
    $root: HTMLElement | Document,
    highlightClassName?: string
};

export interface HighlighterOptions {
    $root: HTMLElement | Document,
    style?: {
        highlightClassName?: string
    }
};

export interface Store<T> {
    type: string,
    save(data: T[] | T): Promise<boolean>,
    get(id: string): Promise<T>,
    remove(id: string): Promise<boolean>,
    getAll(): Promise<T[]>,
    removeAll(): Promise<boolean>
};

export enum SplitType {
    none = 'none',
    head = 'head',
    tail = 'tail',
    both = 'both'
};

export interface SelectedNode {
    $node: Text,
    splitType: SplitType
}

export enum StoreType {
    LOCAL = 'localStorage',
    REMOTE = 'remote',
    INDEX_DB = 'indexDB',
    MEMORY = 'memory'
};

export enum ERROR {
    DOM_TYPE_ERROR = '[DOM] receive wrong node type',
    DB_ID_DUPLICATE_ERROR = '[STORE] unique id conflict'
};

export enum EventType {
    INIT = 'highlight-init',
    CREATE = 'highlight-create',
    REMOVE = 'highlight-remove',
    MODIFY = 'highlight-modify',
    HOVER = 'highlight-hover',
    HOVER_OUT = 'highlight-hover-out'
};