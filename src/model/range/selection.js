"use strict";
/**
 * Something about the Selection/Range API in browsers.
 * If you want to use Highligher in some old browsers, you may use a polyfill.
 * https://caniuse.com/#search=selection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDomRange = function () {
    var selection = window.getSelection();
    if (selection.isCollapsed) {
        console.debug('no text selected');
        return null;
    }
    return selection.getRangeAt(0);
};
exports.removeSelection = function () {
    window.getSelection().removeAllRanges();
};
//# sourceMappingURL=selection.js.map