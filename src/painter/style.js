"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * inject styles
 */
var const_1 = require("@src/util/const");
function initDefaultStylesheet() {
    var styleId = const_1.STYLESHEET_ID;
    var $style = document.getElementById(styleId);
    if (!$style) {
        var $cssNode = document.createTextNode(const_1.STYLESHEET_TEXT);
        $style = document.createElement('style');
        $style.id = this.styleId;
        $style.appendChild($cssNode);
        document.head.appendChild($style);
    }
    return $style;
}
exports.initDefaultStylesheet = initDefaultStylesheet;
//# sourceMappingURL=style.js.map