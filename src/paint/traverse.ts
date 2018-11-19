import {
    SplitType,
    SelectedNode
} from '../model/types';
import {CAMEL_DATASET_IDENTIFIER} from '../util/const';

/**
 * [DFS] 获取开始与结束节点间选中的所有节点
 * TODO: 是否需要调用 selection.containsNode 来判断由于视觉与dom tree顺序不一致带来的问题
 * @param {dom node} $root 遍历的起始根节点
 * @param {dom node} $startNode 标记的开始节点
 * @param {dom node} $endNode 标记的结束节点
 * @param {number} startOffset 开始节点文本的偏移量
 * @param {number} endOffset 结束节点文本的偏移量
 * @return {Array<dom node>} 返回需要被选中的节点
 */
export default function getSelectedNodes(
    $root: HTMLElement | Document = window.document,
    $startNode: Node,
    $endNode: Node,
    startOffset: number,
    endOffset: number
): SelectedNode[] {
    // 开始节点和结束节点为同一个节点时，直接截取该节点返回
    if ($startNode === $endNode && $startNode instanceof Text) {
        $startNode.splitText(startOffset);
        let passedNode = $startNode.nextSibling as Text;
        passedNode.splitText(endOffset - startOffset);
        return [{
            $node: passedNode,
            splitType: SplitType.both
        }];
    }

    const nodeStack: Array<HTMLElement | Document | ChildNode | Text> = [$root];
    const selectedNodes: SelectedNode[] = [];

    let withinSelectedRange = false;
    let curNode: Node = null;
    while (curNode = nodeStack.pop()) {

        if (
            (curNode as HTMLElement).dataset
            && (curNode as HTMLElement).dataset[CAMEL_DATASET_IDENTIFIER]
        ) {
            // 不能选中已标记区域
            // TODO: fix
            continue;
        }

        const children = curNode.childNodes;
        for (let i = children.length - 1; i >= 0; i--) {
            nodeStack.push(children[i]);
        }

        if (
            (curNode as HTMLElement).dataset
            && (curNode as HTMLElement).dataset.highlight === '1'
        ) {
            continue;
        }

        // 只记录文本节点
        if (curNode === $startNode) {
            if (curNode.nodeType === 3) {
                // 选取后半段
                (curNode as Text).splitText(startOffset);
                const node = curNode.nextSibling as Text;
                selectedNodes.push({
                    $node: node,
                    splitType: SplitType.head
                });

            }
            // 开始进入选择范围
            withinSelectedRange = true;
        }
        else if (curNode === $endNode) {
            if (curNode.nodeType === 3) {
                const node = (curNode as Text);
                // 截取前半段
                node.splitText(endOffset);
                selectedNodes.push({
                    $node: node,
                    splitType: SplitType.tail
                });
            }
            // 碰到结束节点，退出循环
            break;
        }
        // 范围内的普通文本节点
        else if (withinSelectedRange && curNode.nodeType === 3) {
            selectedNodes.push({
                $node: curNode as Text,
                splitType: SplitType.none
            });
        }
    }
    return selectedNodes;
}