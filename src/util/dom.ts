import {
    ID_DIVISION,
    DATASET_IDENTIFIER,
    CAMEL_DATASET_IDENTIFIER,
    CAMEL_DATASET_IDENTIFIER_EXTRA
} from './const';
import {
    SplitType,
    SelectedNode,
    DomMeta,
    DomNode,
    DomPosition,
    SelectedNodeType
} from '../types';

const countGlobalNodeIndex = ($node: Node): number => {
    const tagName = ($node as HTMLElement).tagName;
    const $list = document.getElementsByTagName(tagName);
    for (let i = 0; i < $list.length; i++) {
        if ($node === $list[i]) {
            return i;
        }
    }
    return -1;
};

/**
 * get the text dom node & offset by parent node and overall offset
 * @param $parent parent node
 * @param offset offset in all text
 */
const getTextChildByOffset = ($parent: Node, offset: number): DomNode => {
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

    return {
        $node: $curNode,
        offset: startOffset
    };
}

/**
 * text total length in all predecessors (text nodes) in the root node
 * (without offset in current node)
 */
const getTextPreOffset = ($root: Node, $text: Node): number => {
    const nodeStack: Array<Node> = [$root];

    let $curNode: Node = null;
    let offset = 0;
    while ($curNode = nodeStack.pop()) {
        const children = $curNode.childNodes;
        for (let i = children.length - 1; i >= 0; i--) {
            nodeStack.push(children[i]);
        }

        if ($curNode.nodeType === 3 && $curNode !== $text) {
            offset += $curNode.textContent.length;
        }
        else if ($curNode.nodeType === 3) {
            break;
        }
    }

    return offset;
}

/**
 * find the original dom parent node (none highlight dom)
 */
const getOriginParent = ($node: Text): HTMLElement => {
    let $originParent = $node.parentNode as HTMLElement;
    while (
        $originParent.dataset
        && $originParent.dataset[CAMEL_DATASET_IDENTIFIER]
    ) {
        $originParent = $originParent.parentNode as HTMLElement;
    }
    return $originParent;
};

export const getDomMeta = ($node: Text, offset: number): DomMeta => {
    const $originParent = getOriginParent($node);
    const index = countGlobalNodeIndex($originParent);
    const preNodeOffset = getTextPreOffset($originParent, $node);
    const tagName = $originParent.tagName;
    return {
        parentTagName: tagName,
        parentIndex: index,
        textOffset: preNodeOffset + offset
    };
};

/**
 * get current dom node by DomMeta info
 * @param meta DomMeta
 */
export const queryDomByMeta = (meta: DomMeta): {offset: number, $node: Node} => {
    const {
        parentTagName: tagName,
        parentIndex: index,
        textOffset
    } = meta;
    const $parent = document.getElementsByTagName(tagName)[index];
    return getTextChildByOffset($parent, textOffset);
};

/**
 * support type
 *  - class: .title, .main-nav
 *  - id: #nav, #js-toggle-btn
 *  - tag: div, p, span
 */
const isMatchSelector = ($node: HTMLElement, selector: string): boolean => {
    if (!$node) {
        return false;
    }
    if (/^\./.test(selector)) {
        const className = selector.replace(/^\./, '');
        return $node && $node.classList.contains(className);
    }
    else if (/^#/.test(selector)) {
        const id = selector.replace(/^#/, '');
        return $node && $node.id === id;
    }
    else {
        const tagName = selector.toUpperCase()
        return $node && $node.tagName === tagName;
    }
}

/**
 * [DFS] get all the dom nodes between the start and end node
 */
export const getSelectedNodes = (
    $root: HTMLElement | Document = window.document,
    $startNode: Node,
    $endNode: Node,
    startOffset: number,
    endOffset: number,
    exceptSelectors: Array<string>
): SelectedNode[] => {
    // split current node when the start and end is the same
    if ($startNode === $endNode && $startNode instanceof Text) {

        let $element = $startNode as Node;
        while ($element) {
            if ($element.nodeType === 1
                && exceptSelectors.some(s => isMatchSelector($element as HTMLElement, s))
            ) {
                return [];
            }
            $element = $element.parentNode;
        }

        $startNode.splitText(startOffset);
        let passedNode = $startNode.nextSibling as Text;
        passedNode.splitText(endOffset - startOffset);
        return [{
            $node: passedNode,
            type: SelectedNodeType.text,
            splitType: SplitType.both
        }];
    }

    const nodeStack: Array<HTMLElement | Document | ChildNode | Text> = [$root];
    const selectedNodes: SelectedNode[] = [];

    let withinSelectedRange = false;
    let curNode: Node = null;
    while (curNode = nodeStack.pop()) {

        // do not traverse the excepted node
        if (curNode.nodeType === 1 && exceptSelectors.some(s => isMatchSelector(curNode as HTMLElement, s))) {
            continue;
        }

        const children = curNode.childNodes;
        for (let i = children.length - 1; i >= 0; i--) {
            nodeStack.push(children[i]);
        }

        // only push text node
        if (curNode === $startNode) {
            if (curNode.nodeType === 3) {
                // 选取后半段
                (curNode as Text).splitText(startOffset);
                const node = curNode.nextSibling as Text;
                selectedNodes.push({
                    $node: node,
                    type: SelectedNodeType.text,
                    splitType: SplitType.head
                });

            }
            // meet the start node (begin traverse)
            withinSelectedRange = true;
        }
        else if (curNode === $endNode) {
            if (curNode.nodeType === 3) {
                const node = (curNode as Text);
                // 截取前半段
                node.splitText(endOffset);
                selectedNodes.push({
                    $node: node,
                    type: SelectedNodeType.text,
                    splitType: SplitType.tail
                });
            }
            // meet the end node
            break;
        }
        // text nodes between the range
        else if (withinSelectedRange && curNode.nodeType === 3) {
            selectedNodes.push({
                $node: curNode as Text,
                type: SelectedNodeType.text,
                splitType: SplitType.none
            });
        }
    }
    return selectedNodes;
};

/**
 * is current node the highlight wrap node
 */
export const isHighlightWrapNode = ($node: HTMLElement): boolean => (
    !!$node.dataset && !!$node.dataset[CAMEL_DATASET_IDENTIFIER]
);

/**
 * calc dom position
 */
export const getDomPosition = ($node: HTMLElement): DomPosition => {
    let offsetTop = 0;
    let offsetLeft = 0;
    while ($node.nodeType !== 1) {
        $node = $node.parentNode as HTMLElement;
    }

    while ($node) {
        offsetTop += $node.offsetTop;
        offsetLeft += $node.offsetLeft;
        $node = $node.offsetParent as HTMLElement;
    }

    return {
        top: offsetTop,
        left: offsetLeft
    };
};

export const getAllHighlightDom = ($roots: HTMLElement | Array<HTMLElement>): Array<HTMLElement> => {
    if (!Array.isArray($roots)) {
        $roots = [$roots];
    }

    const $wraps = [];
    for (let i = 0; i < $roots.length; i++) {
        const $list = $roots[i].querySelectorAll(`[data-${DATASET_IDENTIFIER}]`);
        $wraps.concat($list);
        }
    return $wraps;
}

/**
 * get highlight wrap dom node by highlight id
 */
export const getHighlightDomById = ($root: HTMLElement, id: String): Array<HTMLElement> => {
    const $highlights = [];
    const reg = new RegExp(`(${id}\\${ID_DIVISION}|\\${ID_DIVISION}?${id}$)`);
    const $list = $root.querySelectorAll(`[data-${DATASET_IDENTIFIER}]`);
    for (let k = 0; k < $list.length; k++) {
        const $n = $list[k] as HTMLElement;
        const nid = $n.dataset[CAMEL_DATASET_IDENTIFIER];
        if (nid === id) {
            $highlights.push($n);
            continue;
        }
        const extraId = $n.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA];
        if (reg.test(extraId)) {
            $highlights.push($n);
            continue;
        }
    }
    return $highlights;
};