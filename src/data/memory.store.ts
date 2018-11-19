import Highlight from '../model/highlight';
import {resolve} from '../util/defer';
import {Store, StoreType} from '../model/types';

export default class LocalStore implements Store<Highlight> {
    data: Map<string, Highlight> = new Map();
    type = StoreType.MEMORY;

    save(highlight: Highlight): Promise<boolean> {
        this.data.set(highlight.id, highlight);
        return resolve(true);
    }

    get(id: string) {
        return resolve<Highlight>(this.data.get(id));
    }

    remove(id: string) {
        this.data.delete(id);
        return resolve<boolean>(true);
    }

    getAll() {
        const list: Highlight[] = [];
        this.data = new Map();
        for (let pair of this.data) {
            list.push(pair[1]);
        }
        return resolve<Highlight[]>(list);
    }

    removeAll() {
        this.data = new Map();
        return resolve<boolean>(true);
    }
}