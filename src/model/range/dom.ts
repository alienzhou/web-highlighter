/**
 * some dom operations about HighlightRange
 */

import type { DomMeta, DomNode } from '@src/types';
import { CAMEL_DATASET_IDENTIFIER, ROOT_IDX, UNKNOWN_IDX } from '@src/util/const';

const countGlobalNodeIndex = ($node: Node, $root: Document | HTMLElement): number => {
    const tagName = ($node as HTMLElement).tagName;
    const $list = $root.getElementsByTagName(tagName);

    for (let i = 0; i < $list.length; i++) {
        if ($node === $list[i]) {
            return i;
        }
    }

    return UNKNOWN_IDX;
};

/**
 * text total length in all predecessors (text nodes) in the root node
 * (without offset in current node)
 */
const getTextPreOffset = ($root: Node, $text: Node): number => {
    const nodeStack: Node[] = [$root];

    let $curNode: Node = null;
    let offset = 0;

    while (($curNode = nodeStack.pop())) {
        const children = $curNode.childNodes;

        for (let i = children.length - 1; i >= 0; i--) {
            nodeStack.push(children[i]);
        }

        if ($curNode.nodeType === 3 && $curNode !== $text) {
            offset += $curNode.textContent.length;
        } else if ($curNode.nodeType === 3) {
            break;
        }
    }

    return offset;
};

/**
 * find the original dom parent node (none highlight dom)
 */
const getOriginParent = ($node: HTMLElement | Text): HTMLElement => {
    if ($node instanceof HTMLElement && (!$node.dataset || !$node.dataset[CAMEL_DATASET_IDENTIFIER])) {
        return $node;
    }

    let $originParent = $node.parentNode as HTMLElement;

    while ($originParent?.dataset[CAMEL_DATASET_IDENTIFIER]) {
        $originParent = $originParent.parentNode as HTMLElement;
    }

    return $originParent;
};

export const getDomMeta = ($node: HTMLElement | Text, offset: number, $root: Document | HTMLElement): DomMeta => {
    const $originParent = getOriginParent($node);
    const index = $originParent === $root ? ROOT_IDX : countGlobalNodeIndex($originParent, $root);
    const preNodeOffset = getTextPreOffset($originParent, $node);
    const tagName = $originParent.tagName;

    return {
        parentTagName: tagName,
        parentIndex: index,
        textOffset: preNodeOffset + offset,
    };
};

const isTextLikeNode = ($node: Node): boolean =>
    // Text / CDATASection / Comment
    $node.nodeType === 3 || $node.nodeType === 4 || $node.nodeType === 8;

/**
 * find the first (or the last) text node inside a node, the node itself included
 */
const findTextNode = ($node: Node, fromStart: boolean): Node => {
    if (!$node) {
        return null;
    }

    if (isTextLikeNode($node)) {
        return $node;
    }

    const children = $node.childNodes;

    for (let i = 0; i < children.length; i++) {
        const $child = children[fromStart ? i : children.length - 1 - i];
        const $text = findTextNode($child, fromStart);

        if ($text) {
            return $text;
        }
    }

    return null;
};

/**
 * find the closest text node after (or before) a boundary of an element node
 */
const findAdjacentTextNode = ($node: Node, offset: number, fromStart: boolean): Node => {
    const children = $node.childNodes;
    const step = fromStart ? 1 : -1;

    for (let i = fromStart ? offset : offset - 1; i >= 0 && i < children.length; i += step) {
        const $text = findTextNode(children[i], fromStart);

        if ($text) {
            return $text;
        }
    }

    // no text node inside the element, keep searching in its siblings and ancestors
    let $cur = $node;

    while ($cur) {
        const $sibling = fromStart ? $cur.nextSibling : $cur.previousSibling;

        if (!$sibling) {
            $cur = $cur.parentNode;
            continue;
        }

        const $text = findTextNode($sibling, fromStart);

        if ($text) {
            return $text;
        }

        $cur = $sibling;
    }

    return null;
};

/**
 * an element boundary (e.g. the end of a range is <p>|<b>text</b></p>) can't be serialized,
 * so convert it to the equivalent boundary of its closest text node
 */
export const formatDomNode = (n: DomNode, isStart: boolean): DomNode => {
    if (isTextLikeNode(n.$node)) {
        return n;
    }

    const $text = findAdjacentTextNode(n.$node, n.offset, isStart);

    if (!$text) {
        return { $node: null, offset: 0 };
    }

    return { $node: $text, offset: isStart ? 0 : $text.textContent.length };
};
