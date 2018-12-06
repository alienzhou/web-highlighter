import {DomMeta} from '../types';
import HighlightRange from './range';
import {queryDomByMeta} from '../util/dom';

class HighlightSource {
    startMeta: DomMeta;
    endMeta: DomMeta;
    text: string;
    id: string;

    constructor(
        startMeta: DomMeta,
        endMeta: DomMeta,
        text: string,
        id: string
    ) {
        this.startMeta = startMeta;
        this.endMeta = endMeta;
        this.text = text;
        this.id = id;
    }

    deSerialize() {
        const start = queryDomByMeta(this.startMeta);
        const end = queryDomByMeta(this.endMeta);
        const range = new HighlightRange(
            start.$node,
            end.$node,
            start.offset,
            end.offset,
            this.text,
            this.id,
            true
        );
        return range;
    }
}

export default HighlightSource;
