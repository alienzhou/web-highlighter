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
