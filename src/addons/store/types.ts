export enum StoreType {
    LOCAL = 'localStorage',
    INDEX_DB = 'indexDB'
}

export interface Store<T> {
    type: StoreType;
    save(data: T): Promise<boolean>;
    get(id: string): Promise<T>;
    remove(id: string): Promise<boolean>;
    getAll(): Promise<T[]>;
    removeAll(): Promise<boolean>;
}