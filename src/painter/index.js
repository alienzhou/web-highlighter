"use strict";
/**
 * Painter object is designed for some painting work about higlighting,
 * including rendering, cleaning...
 * No need to instantiate repeatly. A Highlighter instance will bind a Painter instance.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var source_1 = require("@src/model/source");
var dom_1 = require("./dom");
var dom_2 = require("@src/util/dom");
var types_1 = require("@src/types");
var style_1 = require("./style");
var const_1 = require("../util/const");
var Painter = /** @class */ (function () {
    function Painter(options, hooks) {
        this.options = {
            $root: options.$root,
            exceptSelectors: options.exceptSelectors,
            className: options.className
        };
        this.hooks = hooks;
        style_1.initDefaultStylesheet();
    }
    /* =========================== render =========================== */
    Painter.prototype.highlightRange = function (range) {
        if (!range.frozen) {
            throw types_1.ERROR.HIGHLIGHT_RANGE_FROZEN;
        }
        var _a = this.options, $root = _a.$root, className = _a.className, exceptSelectors = _a.exceptSelectors;
        var hooks = this.hooks;
        var $selectedNodes = dom_1.getSelectedNodes($root, range.start, range.end, exceptSelectors);
        if (!hooks.Render.SelectedNodes.isEmpty()) {
            $selectedNodes = hooks.Render.SelectedNodes.call(range.id, $selectedNodes);
        }
        return $selectedNodes.map(function (n) {
            var $node = dom_1.wrapHighlight(n, range, className);
            if (!hooks.Render.WrapNode.isEmpty()) {
                $node = hooks.Render.WrapNode.call(range.id, $node);
            }
            return $node;
        });
    };
    Painter.prototype.highlightSource = function (sources) {
        var _this = this;
        var list = Array.isArray(sources)
            ? sources
            : [sources];
        var renderedSources = [];
        list.forEach(function (s) {
            if (!(s instanceof source_1.default)) {
                console.error(types_1.ERROR.SOURCE_TYPE_ERROR);
                return;
            }
            var range = s.deSerialize(_this.options.$root);
            var $nodes = _this.highlightRange(range);
            if ($nodes.length > 0) {
                renderedSources.push(s);
            }
            else {
                console.warn(types_1.ERROR.HIGHLIGHT_SOURCE_NONE_RENDER, s);
            }
        });
        return renderedSources;
    };
    /* ============================================================== */
    /* =========================== clean =========================== */
    // id: target id - highlight with this id should be clean
    Painter.prototype.removeHighlight = function (id) {
        // whether extra ids contains the target id
        var reg = new RegExp("(" + id + "\\" + const_1.ID_DIVISION + "|\\" + const_1.ID_DIVISION + "?" + id + "$)");
        var hooks = this.hooks;
        var $spans = document.querySelectorAll(const_1.WRAP_TAG + "[data-" + const_1.DATASET_IDENTIFIER + "]");
        // nodes to remove
        var $toRemove = [];
        // nodes to update main id
        var $idToUpdate = [];
        // nodes to update extra id
        var $extraToUpdate = [];
        for (var i = 0; i < $spans.length; i++) {
            var spanId = $spans[i].dataset[const_1.CAMEL_DATASET_IDENTIFIER];
            var spanExtraIds = $spans[i].dataset[const_1.CAMEL_DATASET_IDENTIFIER_EXTRA];
            // main id is the target id and no extra ids --> to remove
            if (spanId === id && !spanExtraIds) {
                $toRemove.push($spans[i]);
            }
            // main id is the target id but there is some extra ids -> update main id & extra id
            else if (spanId === id) {
                $idToUpdate.push($spans[i]);
            }
            // main id isn't the target id but extra ids contains it -> just remove it from extra id
            else if (spanId !== id && reg.test(spanExtraIds)) {
                $extraToUpdate.push($spans[i]);
            }
        }
        $toRemove.forEach(function ($s) {
            var $parent = $s.parentNode;
            var $fr = document.createDocumentFragment();
            dom_2.forEach($s.childNodes, function ($c) { return $fr.appendChild($c.cloneNode(false)); });
            var $prev = $s.previousSibling;
            var $next = $s.nextSibling;
            $parent.replaceChild($fr, $s);
            // there are bugs in IE11, so use a more reliable function
            dom_1.normalizeSiblingText($prev, true);
            dom_1.normalizeSiblingText($next, false);
            hooks.Remove.UpdateNode.call(id, $s, 'remove');
        });
        $idToUpdate.forEach(function ($s) {
            var dataset = $s.dataset;
            var ids = dataset[const_1.CAMEL_DATASET_IDENTIFIER_EXTRA].split(const_1.ID_DIVISION);
            dataset[const_1.CAMEL_DATASET_IDENTIFIER] = ids.shift();
            dataset[const_1.CAMEL_DATASET_IDENTIFIER_EXTRA] = ids.join(const_1.ID_DIVISION);
            hooks.Remove.UpdateNode.call(id, $s, 'id-update');
        });
        $extraToUpdate.forEach(function ($s) {
            var extraIds = $s.dataset[const_1.CAMEL_DATASET_IDENTIFIER_EXTRA];
            $s.dataset[const_1.CAMEL_DATASET_IDENTIFIER_EXTRA] = extraIds.replace(reg, '');
            hooks.Remove.UpdateNode.call(id, $s, 'extra-update');
        });
    };
    Painter.prototype.removeAllHighlight = function () {
        var $spans = dom_2.getHighlightsByRoot(this.options.$root);
        $spans.forEach(function ($s) {
            var $parent = $s.parentNode;
            var $fr = document.createDocumentFragment();
            dom_2.forEach($s.childNodes, function ($c) { return $fr.appendChild($c.cloneNode(false)); });
            $parent.replaceChild($fr, $s);
        });
    };
    return Painter;
}());
exports.default = Painter;
;
//# sourceMappingURL=index.js.map