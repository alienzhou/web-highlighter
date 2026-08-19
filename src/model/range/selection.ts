/**
 * Something about the Selection/Range API in browsers.
 * If you want to use Highlighter in some old browsers, you may use a polyfill.
 * https://caniuse.com/#search=selection
 */

export const getDomRange = (): Range => {
    const selection = window.getSelection();

    if (selection.isCollapsed) {
        // eslint-disable-next-line no-console
        console.debug('no text selected');

        return null;
    }

    return selection.getRangeAt(0);
};

export const removeSelection = (): void => {
    window.getSelection().removeAllRanges();
};

/**
 * select the given wrappers as a whole
 * the highlighted text may be split into several wrappers,
 * so only the range they cover is restored
 */
export const restoreSelection = ($nodes: HTMLElement[]): void => {
    const selection = window.getSelection();

    selection.removeAllRanges();

    if ($nodes.length === 0) {
        return;
    }

    const range = document.createRange();

    range.setStartBefore($nodes[0]);
    range.setEndAfter($nodes[$nodes.length - 1]);
    selection.addRange(range);
};
