// cSpell:ignore deserialize
import uuid from '../util/uuid';
import {NodeMeta, HighlightNodePartial, HighlightSource} from './types';
import * as dom from '../util/dom';

class Highlight {
    id: string;
    startMeta: HighlightNodePartial;
    endMeta: HighlightNodePartial;
    $startNode: Node;
    $endNode: Node;
    startOffset: number;
    endOffset: number;

    static freeze = (
        $startNode: Node | Highlight,
        $endNode: Node,
        startOffset: number,
        endOffset: number,
        id?: string
    ): HighlightSource => {

        if ($startNode instanceof Highlight) {
            return $startNode.freeze();
        }

        const highlight = new Highlight(
            $startNode,
            $endNode,
            startOffset,
            endOffset,
            id
        );
        return highlight.freeze();
    }

    static boil = (source: HighlightSource): Highlight => {
        const {start, end} = source;
        return new Highlight(
            dom.getElementByMeta(start),
            dom.getElementByMeta(end),
            start.offset,
            end.offset,
            source.id
        )
    }

    constructor(
        $startNode: Node,
        $endNode: Node,
        startOffset: number,
        endOffset: number,
        id?: string
    ) {
        const [startMeta, startTextIndex] = this.getNodeInfoPartial($startNode);
        const [endMeta, endTextIndex] = this.getNodeInfoPartial($endNode);

        this.startMeta = {
            offset: startOffset,
            domNode: startMeta,
            textNode: {
                index: startTextIndex
            }
        };
        this.endMeta = {
            offset: endOffset,
            domNode: endMeta,
            textNode: {
                index: endTextIndex
            }
        };

        this.id = id || uuid();
        this.$startNode = $startNode;
        this.$endNode = $endNode;
        this.startOffset = startOffset;
        this.endOffset = endOffset;
    }

    freeze(): HighlightSource {
        return {
            start: this.startMeta,
            end: this.endMeta,
            id: this.id
        };
    }

    getNodeInfoPartial($node: Node): [NodeMeta, number] {
        const $parent = $node.parentNode as HTMLElement;
        const parentMeta = dom.markNodeMetaInfo($parent);
        const index = dom.countNodeIndex($node);

        return [parentMeta, index];
    }
}

export default Highlight;