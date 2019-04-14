"use strict";
/**
 * some dom operations about HighlightRange
 */
Object.defineProperty(exports, "__esModule", { value: true });
var const_1 = require("@src/util/const");
var countGlobalNodeIndex = function ($node, $root) {
    var tagName = $node.tagName;
    var $list = $root.getElementsByTagName(tagName);
    for (var i = 0; i < $list.length; i++) {
        if ($node === $list[i]) {
            return i;
        }
    }
    return -1;
};
/**
 * text total length in all predecessors (text nodes) in the root node
 * (without offset in current node)
 */
var getTextPreOffset = function ($root, $text) {
    var nodeStack = [$root];
    var $curNode = null;
    var offset = 0;
    while ($curNode = nodeStack.pop()) {
        var children = $curNode.childNodes;
        for (var i = children.length - 1; i >= 0; i--) {
            nodeStack.push(children[i]);
        }
        if ($curNode.nodeType === 3 && $curNode !== $text) {
            offset += $curNode.textContent.length;
        }
        else if ($curNode.nodeType === 3) {
            break;
        }
    }
    return offset;
};
/**
 * find the original dom parent node (none highlight dom)
 */
var getOriginParent = function ($node) {
    if ($node instanceof HTMLElement
        && (!$node.dataset || !$node.dataset[const_1.CAMEL_DATASET_IDENTIFIER])) {
        return $node;
    }
    var $originParent = $node.parentNode;
    while ($originParent.dataset
        && $originParent.dataset[const_1.CAMEL_DATASET_IDENTIFIER]) {
        $originParent = $originParent.parentNode;
    }
    return $originParent;
};
exports.getDomMeta = function ($node, offset, $root) {
    var $originParent = getOriginParent($node);
    var index = countGlobalNodeIndex($originParent, $root);
    var preNodeOffset = getTextPreOffset($originParent, $node);
    var tagName = $originParent.tagName;
    return {
        parentTagName: tagName,
        parentIndex: index,
        textOffset: preNodeOffset + offset
    };
};
//# sourceMappingURL=dom.js.map