import {HighlightRange} from '../model/types';

export const getHighlightRange = (): HighlightRange => {
    const selection = window.getSelection();
    if (selection.isCollapsed) {
        console.log('没有被选中的内容');
        return null;
    }
    const range = selection.getRangeAt(0);

    return {
        $startNode: range.startContainer,
        $endNode: range.endContainer,
        startOffset: range.startOffset,
        endOffset: range.endOffset
    };
};

export const removeSelection = (): void => {
    window.getSelection().removeAllRanges();
};