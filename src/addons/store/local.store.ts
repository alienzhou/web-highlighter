/**
 * highlighter provides an easy alternative implementation for frontend store
 * you can also implement your own lib (e.g. indexedDB)
 * or even use a backend store server
 */

import HighlightSource from '../../model/source/index';
import {Store, StoreType} from './types';
import {resolve} from '../../util/deferred';
import {LOCAL_STORE_KEY} from '../../util/const';

type StoreInfo = {
    hs: HighlightSource,
    info?: any
};

class LocalStore implements Store<StoreInfo> {
    type = StoreType.LOCAL;
    key = '';

    constructor(id?) {
        this.key = id !== undefined ? `${LOCAL_STORE_KEY}-${id}` : LOCAL_STORE_KEY;
    }

    storeToJson(): StoreInfo[] {
        const store = localStorage.getItem(this.key);
        let sources;
        try {
            sources = JSON.parse(store) || [];
        }
        catch (e) {
            sources = [];
        }
        return sources;
    }

    jsonToStore(stores: StoreInfo[]): void {
        localStorage.setItem(this.key, JSON.stringify(stores));
    }

    save(data: StoreInfo | StoreInfo[]): Promise<boolean> {
        const stores: StoreInfo[] = this.storeToJson();
        const map = {};
        stores.forEach((store, idx) => map[store.hs.id] = idx);

        if (!Array.isArray(data)) {
            data = [data];
        }

        data.forEach(store => {
            // update
            if (map[store.hs.id] !== undefined) {
                stores[map[store.hs.id]] = store;
            }
            // append
            else {
                stores.push(store);
            }
        })
        this.jsonToStore(stores);
        return resolve(true);
    }

    forceSave(store: StoreInfo): Promise<boolean> {
        const stores: StoreInfo[] = this.storeToJson();
        stores.push(store);
        this.jsonToStore(stores);
        return resolve(true);
    }

    get(id: string) {
        const list = this.storeToJson()
            .filter(store => store.hs.id === id)
            .map(store => ({
                hs: new HighlightSource(
                    store.hs.startMeta,
                    store.hs.endMeta,
                    store.hs.text,
                    store.hs.id
                ),
                info: store.info
            }));
        return resolve<StoreInfo>(list[0]);
    }

    remove(id: string) {
        const stores: StoreInfo[] = this.storeToJson();
        let index: number = null;
        for (let i = 0; i < stores.length; i++) {
            if (stores[i].hs.id === id) {
                index = i;
                break;
            }
        }
        stores.splice(index, 1);
        this.jsonToStore(stores);
        return resolve<boolean>(true);
    }

    getAll() {
        return resolve<StoreInfo[]>(
            this.storeToJson().map(store => ({
                hs: new HighlightSource(
                    store.hs.startMeta,
                    store.hs.endMeta,
                    store.hs.text,
                    store.hs.id
                ),
                info: store.info
            }))
        );
    }

    removeAll() {
        this.jsonToStore([]);
        return resolve<boolean>(true);
    }
}

export default LocalStore;
