export const getDomRange = (): Range => {
    const selection = window.getSelection();
    if (selection.isCollapsed) {
        console.log('no text selected');
        return null;
    }
    return selection.getRangeAt(0);
};

export const removeSelection = (): void => {
    window.getSelection().removeAllRanges();
};