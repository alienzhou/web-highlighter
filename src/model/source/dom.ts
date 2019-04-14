import {DomNode} from '@src//types';
import HighlightSource from './index';

/**
 * Because of supporting highligting a same area (range overlapping), 
 * Highlighter will calculate which text-node and how much offset it actually be,
 * baseed on the origin website dom node and the text offset.
 * 
 * @param {Node} $parent element node in the origin website dom tree
 * @param {number} offset text offset in the origin website dom tree
 * @return {DomNode} DOM a dom info object
 */
export const getTextChildByOffset = ($parent: Node, offset: number): DomNode => {
    const nodeStack: Array<Node> = [$parent];

    let $curNode: Node = null;
    let curOffset = 0;
    let startOffset = 0;
    while ($curNode = nodeStack.pop()) {
        const children = $curNode.childNodes;
        for (let i = children.length - 1; i >= 0; i--) {
            nodeStack.push(children[i]);
        }

        if ($curNode.nodeType === 3) {
            startOffset = offset - curOffset;
            curOffset += $curNode.textContent.length;
            if (curOffset >= offset) {
                break;
            }
        }
    }

    if (!$curNode) {
        $curNode = $parent;
    }

    return {
        $node: $curNode,
        offset: startOffset
    };
}

/**
 * get start and end parent element from meta info
 * 
 * @param {HighlightSource} hs 
 * @param {HTMLElement | Document} $root root element, default document
 * @return {Object}
 */
export const queryElementNode = (
    hs: HighlightSource,
    $root: HTMLElement | Document
): {start: Node, end: Node} => {
    return {
        start: $root.getElementsByTagName(hs.startMeta.parentTagName)[hs.startMeta.parentIndex],
        end: $root.getElementsByTagName(hs.endMeta.parentTagName)[hs.endMeta.parentIndex],
    };
};
