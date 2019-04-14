/**
 * HighlightSource Class (HSource)
 * This Object can be deSerialized to HRange.
 * Also it has the ability for persistence.
 */

import {DomMeta} from '../../types';
import HighlightRange from '../range/index';
import {queryElementNode, getTextChildByOffset} from './dom';

class HighlightSource {
    startMeta: DomMeta;
    endMeta: DomMeta;
    text: string;
    id: string;
    extra?: any;
    __isHighlightSource: any;

    constructor(
        startMeta: DomMeta,
        endMeta: DomMeta,
        text: string,
        id: string,
        extra?: any
    ) {
        this.startMeta = startMeta;
        this.endMeta = endMeta;
        this.text = text;
        this.id = id;
        this.__isHighlightSource = {};
        if (extra) {
            this.extra = extra;
        }
    }

    deSerialize($root: HTMLElement | Document): HighlightRange {
        const {start, end} = queryElementNode(this, $root);
        const startInfo = getTextChildByOffset(start, this.startMeta.textOffset);
        const endInfo = getTextChildByOffset(end, this.endMeta.textOffset);

        const range = new HighlightRange(
            startInfo,
            endInfo,
            this.text,
            this.id,
            true
        );
        return range;
    }
}

export default HighlightSource;
