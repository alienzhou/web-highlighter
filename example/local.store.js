class LocalStore {
    constructor(id) {
        this.key = id !== undefined ? `highlight-mengshou-${id}` : 'highlight-mengshou';
    }

    storeToJson() {
        const store = localStorage.getItem(this.key);
        try {
            const sources = JSON.parse(store) || [];
            return Array.isArray(sources) ? sources : [];
        }
        catch (e) {
            return [];
        }
    }

    jsonToStore(stores) {
        try {
            localStorage.setItem(this.key, JSON.stringify(stores));
            return true;
        }
        catch (e) {
            console.warn('[highlighter] unable to save highlights to localStorage', e);
            return false;
        }
    }

    save(data) {
        const stores = this.storeToJson();
        const map = {};
        stores.forEach((store, idx) => {
            if (store?.hs?.id) {
                map[store.hs.id] = idx;
            }
        });

        const entries = (Array.isArray(data) ? data : [data])
            .filter(store => store?.hs?.id);

        entries.forEach(store => {
            if (map[store.hs.id] !== undefined) {
                stores[map[store.hs.id]] = store;
            }
            else {
                stores.push(store);
            }
        });

        return this.jsonToStore(stores);
    }

    forceSave(store) {
        const stores = this.storeToJson();
        stores.push(store);
        return this.jsonToStore(stores);
    }

    remove(id) {
        const stores = this.storeToJson();
        const index = stores.findIndex(store => store?.hs?.id === id);

        if (index === -1) {
            return false;
        }

        stores.splice(index, 1);
        return this.jsonToStore(stores);
    }

    getAll() {
        return this.storeToJson();
    }

    removeAll() {
        return this.jsonToStore([]);
    }
}

export default LocalStore;