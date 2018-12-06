import {CAMEL_DATASET_IDENTIFIER} from './const';
import {
    SplitType,
    SelectedNode,
    DomMeta,
    DomNode,
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
 * [DFS] get all the dom nodes between the start and end node
 */
export const getSelectedNodes = (
    $root: HTMLElement | Document = window.document,
    $startNode: Node,
    $endNode: Node,
    startOffset: number,
    endOffset: number
): SelectedNode[] => {
    // split current node when the start and end is the same
    if ($startNode === $endNode && $startNode instanceof Text) {
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
export const isHighlightWrapNode = ($node: HTMLElement) => (
    $node.dataset && $node.dataset[CAMEL_DATASET_IDENTIFIER]
);