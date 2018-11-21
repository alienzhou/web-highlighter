import HighlightSource from '../../model/source';
import {Store, StoreType} from './types';
import {ERROR} from '../../types';
import {resolve, reject} from '../../util/defer';
import {LOCAL_STORE_KEY} from '../../util/const';

class LocalStore implements Store<HighlightSource> {
    type = StoreType.LOCAL;
    key = LOCAL_STORE_KEY;

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

    save(data: HighlightSource | HighlightSource[]): Promise<boolean> {
        const sources: HighlightSource[] = this.storeToJson();
        const map = {};
        sources.forEach((s, idx) => map[s.id] = idx);
        if (!Array.isArray(data)) {
            data = [data];
        }
        data.forEach(s => {
            if (map[s.id] !== undefined) {
                sources[map[s.id]] = s;
            }
            else {
                sources.push(s);
            }
        })
        this.jsonToStore(sources);
        return resolve(true);
    }

    forceSave(source: HighlightSource): Promise<boolean> {
        const sources: HighlightSource[] = this.storeToJson();
        sources.push(source);
        this.jsonToStore(sources);
        return resolve(true);
    }

    get(id: string) {
        const list = this.storeToJson()
            .filter(m => m.id === id)
            .map(s => new HighlightSource(
                s.startMeta,
                s.endMeta,
                s.text,
                s.id
            ));
        return resolve<HighlightSource>(list[0]);
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
        return resolve<HighlightSource[]>(
            this.storeToJson().map(s => new HighlightSource(
                s.startMeta,
                s.endMeta,
                s.text,
                s.id
            ))
        );
    }

    removeAll() {
        this.jsonToStore([]);
        return resolve<boolean>(true);
    }
}

export default LocalStore;
