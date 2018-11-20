export const getDomRange = (): Range => {
    const selection = window.getSelection();
    if (selection.isCollapsed) {
        console.log('没有被选中的内容');
        return null;
    }
    return selection.getRangeAt(0);
};

export const removeSelection = (): void => {
    window.getSelection().removeAllRanges();
};