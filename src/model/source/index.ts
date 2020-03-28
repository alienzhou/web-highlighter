/**
 * HighlightSource Class (HSource)
 * This Object can be deSerialized to HRange.
 * Also it has the ability for persistence.
 */

import {DomMeta, HookMap, DomNode} from '../../types';
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

    deSerialize($root: HTMLElement | Document, hooks: HookMap): HighlightRange {
        let startInfo: DomNode;
        let endInfo: DomNode;
        if (!hooks.Serialize.Restore.isEmpty()) {
            const res = hooks.Serialize.Restore.call(this) || [];
            startInfo = res[0];
            endInfo = res[1];
        }
        if (!startInfo || !endInfo) {
            const {start, end} = queryElementNode(this, $root);
            startInfo = getTextChildByOffset(start, this.startMeta.textOffset);
            endInfo = getTextChildByOffset(end, this.endMeta.textOffset);
        }

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
