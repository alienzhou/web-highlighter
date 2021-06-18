/**
 * HighlightSource Class (HSource)
 * This Object can be deSerialized to HRange.
 * Also it has the ability for persistence.
 */

import type { DomMeta, HookMap, DomNode } from '@src/types';
import HighlightRange from '@src/model/range/index';
import { queryElementNode, getTextChildByOffset } from '@src/model/source/dom';

class HighlightSource {
    startMeta: DomMeta;

    endMeta: DomMeta;

    text: string;

    id: string;

    extra?: unknown;

    __isHighlightSource: unknown;

    constructor(startMeta: DomMeta, endMeta: DomMeta, text: string, id: string, extra?: unknown) {
        this.startMeta = startMeta;
        this.endMeta = endMeta;
        this.text = text;
        this.id = id;
        this.__isHighlightSource = {};

        if (extra) {
            this.extra = extra;
        }
    }

    deSerialize($root: Document | HTMLElement, hooks: HookMap): HighlightRange {
        const { start, end } = queryElementNode(this, $root);
        let startInfo = getTextChildByOffset(start, this.startMeta.textOffset);
        let endInfo = getTextChildByOffset(end, this.endMeta.textOffset);

        if (!hooks.Serialize.Restore.isEmpty()) {
            const res: DomNode[] = hooks.Serialize.Restore.call(this, startInfo, endInfo) || [];

            startInfo = res[0] || startInfo;
            endInfo = res[1] || endInfo;
        }

        const range = new HighlightRange(startInfo, endInfo, this.text, this.id, true);

        return range;
    }
}

export default HighlightSource;
