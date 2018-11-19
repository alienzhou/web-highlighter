import Highlight from '../model/highlight';
import {resolve, reject} from '../util/defer';
import {ERROR} from '../model/types';
import {LOCAL_STORE_KEY} from '../util/const';
import {Store, StoreType, HighlightSource} from '../model/types';

export default class LocalStore implements Store<Highlight> {
    key = LOCAL_STORE_KEY;
    type = StoreType.LOCAL;

    storeToJson(): HighlightSource[] {
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

    jsonToStore(sources: HighlightSource[]): void {
        localStorage.setItem(this.key, JSON.stringify(sources));
    }

    save(highlight: Highlight): Promise<boolean> {
        const sources: HighlightSource[] = this.storeToJson();
        // id 重复
        if (sources.filter(s => s.id === highlight.id).length > 0) {
            return reject(ERROR.DB_ID_DUPLICATE_ERROR);
        }
        sources.push(highlight.freeze());
        this.jsonToStore(sources);
        return resolve(true);
    }

    forceSave(highlight: Highlight): Promise<boolean> {
        const sources: HighlightSource[] = this.storeToJson();
        sources.push(highlight.freeze());
        this.jsonToStore(sources);
        return resolve(true);
    }

    get(id: string) {
        const list = this.storeToJson()
            .filter(m => m.id === id)
            .map(m => Highlight.boil(m));
        return resolve<Highlight>(list[0]);
    }

    remove(id: string) {
        const sources: HighlightSource[] = this.storeToJson();
        let index: number = null;
        for (let i = 0; i < sources.length; i++) {
            if (sources[i].id === id) {
                index = i;
                break;
            }
        }
        sources.splice(index, 1);
        this.jsonToStore(sources);
        return resolve<boolean>(true);
    }

    getAll() {
        return resolve<Highlight[]>(
            this.storeToJson().map(m => Highlight.boil(m))
        );
    }

    removeAll() {
        this.jsonToStore([]);
        return resolve<boolean>(true);
    }
}