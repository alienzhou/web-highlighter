"use strict";
/**
 * @file dom 操作相关的通用工具类
 * @author zhouhongxuan@baidu.com
 */
Object.defineProperty(exports, "__esModule", { value: true });
var const_1 = require("./const");
/**
 * whether a wrapper node
 */
exports.isHighlightWrapNode = function ($node) { return (!!$node.dataset && !!$node.dataset[const_1.CAMEL_DATASET_IDENTIFIER]); };
/**
 * get highlight id by wrapping node
 */
exports.getHighlightId = function ($node) {
    if (exports.isHighlightWrapNode($node)) {
        return $node.dataset[const_1.CAMEL_DATASET_IDENTIFIER];
    }
    return '';
};
/**
 * get all highlight wrapping nodes nodes from a root node
 */
exports.getHighlightsByRoot = function ($roots) {
    if (!Array.isArray($roots)) {
        $roots = [$roots];
    }
    var $wraps = [];
    for (var i = 0; i < $roots.length; i++) {
        var $list = $roots[i].querySelectorAll(const_1.WRAP_TAG + "[data-" + const_1.DATASET_IDENTIFIER + "]");
        $wraps.concat($list);
    }
    return $wraps;
};
/**
 * get all highlight wrapping nodes by highlight id from a root node
 */
exports.getHighlightById = function ($root, id) {
    var $highlights = [];
    var reg = new RegExp("(" + id + "\\" + const_1.ID_DIVISION + "|\\" + const_1.ID_DIVISION + "?" + id + "$)");
    var $list = $root.querySelectorAll(const_1.WRAP_TAG + "[data-" + const_1.DATASET_IDENTIFIER + "]");
    for (var k = 0; k < $list.length; k++) {
        var $n = $list[k];
        var nid = $n.dataset[const_1.CAMEL_DATASET_IDENTIFIER];
        if (nid === id) {
            $highlights.push($n);
            continue;
        }
        var extraId = $n.dataset[const_1.CAMEL_DATASET_IDENTIFIER_EXTRA];
        if (reg.test(extraId)) {
            $highlights.push($n);
            continue;
        }
    }
    return $highlights;
};
exports.forEach = function ($nodes, cb) {
    for (var i = 0; i < $nodes.length; i++) {
        cb($nodes[i], i, $nodes);
    }
};
//# sourceMappingURL=dom.js.map