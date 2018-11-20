import HighlightSource from './source';
import uuid from '../util/uuid';
import {DomNode} from '../types';
import {getDomMeta} from '../util/dom';
import {getDomRange, removeSelection} from '../util/range';

class HighlightRange {
    start: DomNode;
    end: DomNode;
    text: string;
    id: string;
    frozen: boolean;

    static removeDomRange() {
        removeSelection();
    }

    static fromSelection() {
        const range = getDomRange();
        if (!range) {
            return null;
        }
        return new HighlightRange(
            range.startContainer,
            range.endContainer,
            range.startOffset,
            range.endOffset,
            range.toString()
        );
    }

    constructor(
        $start: Node,
        $end: Node,
        startOffset: number,
        endOffset: number,
        text: string,
        id?: string,
        frozen: boolean = false
    ) {
        this.start = {
            $node: $start,
            offset: startOffset
        };
        this.end = {
            $node: $end,
            offset: endOffset
        };
        this.text = text;
        this.id = id || uuid();
        this.frozen = frozen;
    }

    freeze(): HighlightSource {
        const startMeta = getDomMeta(this.start.$node as Text, this.start.offset);
        const endMeta = getDomMeta(this.end.$node as Text, this.end.offset);
        this.frozen = true;
        return new HighlightSource(startMeta, endMeta, this.text, this.id);
    }
}

export default HighlightRange;