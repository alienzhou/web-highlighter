import {HighlightNodePartial} from '../model/types';
import {NodeMeta} from '../model/types';
import {ERROR} from '../model/types';

export const countNodeIndex = ($node: Node): number => {
    if ($node instanceof HTMLDocument) {
        return 0;
    }

    const $children = $node.parentNode.childNodes;
    for (let i = 0; i < $children.length; i++) {
        if ($node === $children[i]) {
            return i;
        }
    }
};

export const markNodeMetaInfo = ($node: Element): NodeMeta => {
    if ($node.nodeType !== 1) {
        throw ERROR.DOM_TYPE_ERROR;
    }
    const tagName = $node.tagName;
    const $list = document.getElementsByTagName(tagName);

    let index: number = null;
    for (let i: number = 0; i < $list.length; i++) {
        if ($node === $list[i]) {
            index = i;
            break;
        }
    }
    return {tagName, index};
};

export const getElementByMeta = (partial: HighlightNodePartial): Text => {
    const {
        domNode: {
            tagName,
            index
        },
        textNode
    } = partial;
    const $parent = document.getElementsByTagName(tagName)[index];
    return $parent.childNodes[textNode.index] as Text;
};