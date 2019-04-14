"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("../types");
var dom_1 = require("../util/dom");
var const_1 = require("../util/const");
/**
 * 支持的选择器类型
 *  - class: .title, .main-nav
 *  - id: #nav, #js-toggle-btn
 *  - tag: div, p, span
 */
var isMatchSelector = function ($node, selector) {
    if (!$node) {
        return false;
    }
    if (/^\./.test(selector)) {
        var className = selector.replace(/^\./, '');
        return $node && $node.classList.contains(className);
    }
    else if (/^#/.test(selector)) {
        var id = selector.replace(/^#/, '');
        return $node && $node.id === id;
    }
    else {
        var tagName = selector.toUpperCase();
        return $node && $node.tagName === tagName;
    }
};
/**
 * get all the dom nodes between the start and end node
 */
exports.getSelectedNodes = function ($root, start, end, exceptSelectors) {
    var $startNode = start.$node;
    var $endNode = end.$node;
    var startOffset = start.offset;
    var endOffset = end.offset;
    // split current node when the start-node and end-node is the same
    if ($startNode === $endNode && $startNode instanceof Text) {
        var $element_1 = $startNode;
        while ($element_1) {
            if ($element_1.nodeType === 1
                && exceptSelectors
                && exceptSelectors.some(function (s) { return isMatchSelector($element_1, s); })) {
                return [];
            }
            $element_1 = $element_1.parentNode;
        }
        $startNode.splitText(startOffset);
        var passedNode = $startNode.nextSibling;
        passedNode.splitText(endOffset - startOffset);
        return [{
                $node: passedNode,
                type: types_1.SelectedNodeType.text,
                splitType: types_1.SplitType.both
            }];
    }
    var nodeStack = [$root];
    var selectedNodes = [];
    var withinSelectedRange = false;
    var curNode = null;
    while (curNode = nodeStack.pop()) {
        // do not traverse the excepted node
        if (curNode.nodeType === 1
            && exceptSelectors
            && exceptSelectors.some(function (s) { return isMatchSelector(curNode, s); })) {
            continue;
        }
        var children = curNode.childNodes;
        for (var i = children.length - 1; i >= 0; i--) {
            nodeStack.push(children[i]);
        }
        // only collect text nodes
        if (curNode === $startNode) {
            if (curNode.nodeType === 3) {
                curNode.splitText(startOffset);
                var node = curNode.nextSibling;
                selectedNodes.push({
                    $node: node,
                    type: types_1.SelectedNodeType.text,
                    splitType: types_1.SplitType.head
                });
            }
            // meet the start-node (begin to traverse)
            withinSelectedRange = true;
        }
        else if (curNode === $endNode) {
            if (curNode.nodeType === 3) {
                var node = curNode;
                node.splitText(endOffset);
                selectedNodes.push({
                    $node: node,
                    type: types_1.SelectedNodeType.text,
                    splitType: types_1.SplitType.tail
                });
            }
            // meet the end-node
            break;
        }
        // handle text nodes between the range
        else if (withinSelectedRange && curNode.nodeType === 3) {
            selectedNodes.push({
                $node: curNode,
                type: types_1.SelectedNodeType.text,
                splitType: types_1.SplitType.none
            });
        }
    }
    return selectedNodes;
};
function addClass($el, className) {
    var classNames = Array.isArray(className) ? className : [className];
    classNames = classNames.length === 0 ? [const_1.DEFAULT_OPTIONS.style.className] : classNames;
    classNames.forEach(function (c) { return $el.classList.add(c); });
    return $el;
}
/**
 * wrap a dom node with highlight wrapper
 *
 * Because of supporting the highlight-overlapping,
 * Highlighter can't just wrap all nodes in a simple way.
 * There are three types:
 *  - wrapping a whole new node (without any wrapper)
 *  - wrapping part of the node
 *  - wrapping the whole wrapped node
 */
exports.wrapHighlight = function (selected, range, className) {
    var $parent = selected.$node.parentNode;
    var $prev = selected.$node.previousSibling;
    var $next = selected.$node.nextSibling;
    var $wrap;
    // text node, not in a highlight wrapper -> should be wrapped in a highlight wrapper
    if (!dom_1.isHighlightWrapNode($parent)) {
        $wrap = document.createElement(const_1.WRAP_TAG);
        addClass($wrap, className);
        $wrap.appendChild(selected.$node.cloneNode(false));
        selected.$node.parentNode.replaceChild($wrap, selected.$node);
        $wrap.setAttribute("data-" + const_1.DATASET_IDENTIFIER, range.id);
        $wrap.setAttribute("data-" + const_1.DATASET_SPLIT_TYPE, selected.splitType);
        $wrap.setAttribute("data-" + const_1.DATASET_IDENTIFIER_EXTRA, '');
    }
    // text node, in a highlight wrap -> should split the existing highlight wrapper
    else if (dom_1.isHighlightWrapNode($parent) && ($prev || $next)) {
        var $fr = document.createDocumentFragment();
        var parentId = $parent.dataset[const_1.CAMEL_DATASET_IDENTIFIER];
        var parentExtraId = $parent.dataset[const_1.CAMEL_DATASET_IDENTIFIER_EXTRA];
        $wrap = document.createElement(const_1.WRAP_TAG);
        var extraInfo = parentExtraId ? parentId + const_1.ID_DIVISION + parentExtraId : parentId;
        $wrap.setAttribute("data-" + const_1.DATASET_IDENTIFIER, range.id);
        $wrap.setAttribute("data-" + const_1.DATASET_IDENTIFIER_EXTRA, extraInfo);
        $wrap.appendChild(selected.$node.cloneNode(false));
        var headSplit = false;
        var tailSplit = false;
        var splitType = void 0;
        if ($prev) {
            var $span = $parent.cloneNode(false);
            $span.textContent = $prev.textContent;
            $fr.appendChild($span);
            headSplit = true;
        }
        addClass($wrap, className);
        $fr.appendChild($wrap);
        if ($next) {
            var $span = $parent.cloneNode(false);
            $span.textContent = $next.textContent;
            $fr.appendChild($span);
            tailSplit = true;
        }
        if (headSplit && tailSplit) {
            splitType = types_1.SplitType.both;
        }
        else if (headSplit) {
            splitType = types_1.SplitType.head;
        }
        else if (tailSplit) {
            splitType = types_1.SplitType.tail;
        }
        else {
            splitType = types_1.SplitType.none;
        }
        $wrap.setAttribute("data-" + const_1.DATASET_SPLIT_TYPE, splitType);
        $parent.parentNode.replaceChild($fr, $parent);
    }
    // completely overlap (with a highlight wrap) -> only add extra id info
    else {
        $wrap = $parent;
        addClass($wrap, className);
        var dataset = $parent.dataset;
        var formerId = dataset[const_1.CAMEL_DATASET_IDENTIFIER];
        dataset[const_1.CAMEL_DATASET_IDENTIFIER] = range.id;
        dataset[const_1.CAMEL_DATASET_IDENTIFIER_EXTRA] = dataset[const_1.CAMEL_DATASET_IDENTIFIER_EXTRA]
            ? formerId + const_1.ID_DIVISION + dataset[const_1.CAMEL_DATASET_IDENTIFIER_EXTRA]
            : formerId;
    }
    return $wrap;
};
/**
 * merge the adjacent text nodes
 * .normalize() API has some bugs in IE11
 */
exports.normalizeSiblingText = function ($s, isNext) {
    if (isNext === void 0) { isNext = true; }
    if (!$s || $s.nodeType !== 3) {
        return;
    }
    var $sibling = isNext ? $s.nextSibling : $s.previousSibling;
    if ($sibling.nodeType !== 3) {
        return;
    }
    var text = $sibling.nodeValue;
    $s.nodeValue = isNext ? ($s.nodeValue + text) : (text + $s.nodeValue);
    $sibling.parentNode.removeChild($sibling);
};
//# sourceMappingURL=dom.js.map