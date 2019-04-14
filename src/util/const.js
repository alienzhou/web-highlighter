"use strict";
/**
 * all constants
 * cSpell:ignore mengshou
 */
Object.defineProperty(exports, "__esModule", { value: true });
var camel_1 = require("./camel");
exports.ID_DIVISION = ';';
exports.LOCAL_STORE_KEY = 'highlight-mengshou';
exports.STYLESHEET_ID = 'highlight-mengshou-style';
exports.WRAP_TAG = 'span';
exports.DATASET_IDENTIFIER = 'highlight-id';
exports.DATASET_IDENTIFIER_EXTRA = 'highlight-id-extra';
exports.DATASET_SPLIT_TYPE = 'highlight-split-type';
exports.CAMEL_DATASET_IDENTIFIER = camel_1.default(exports.DATASET_IDENTIFIER);
exports.CAMEL_DATASET_IDENTIFIER_EXTRA = camel_1.default(exports.DATASET_IDENTIFIER_EXTRA);
exports.CAMEL_DATASET_SPLIT_TYPE = camel_1.default(exports.DATASET_SPLIT_TYPE);
exports.DEFAULT_OPTIONS = {
    $root: window.document.documentElement,
    exceptSelectors: null,
    style: {
        className: 'highlight-mengshou-wrap'
    }
};
var styles = exports.DEFAULT_OPTIONS.style;
exports.STYLESHEET_TEXT = "\n    ." + styles.className + " {\n        background: #ff9;\n        cursor: pointer;\n    }\n    ." + styles.className + ".active {\n        background: #ffb;\n    }\n";
//# sourceMappingURL=const.js.map