"use strict";
/**
 * the HighlightRange Class（HRange）
 * It's a special object called HRange in Highlighter,
 * represents for a piece of chosen dom
 */
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../source/index");
var types_1 = require("@src/types");
var selection_1 = require("./selection");
var uuid_1 = require("@src/util/uuid");
var dom_1 = require("./dom");
var HighlightRange = /** @class */ (function () {
    function HighlightRange(start, end, text, id, frozen) {
        if (frozen === void 0) { frozen = false; }
        if (start.$node.nodeType !== 3 || end.$node.nodeType !== 3) {
            console.warn(types_1.ERROR.RANGE_NODE_INVALID);
        }
        this.start = start;
        this.end = end;
        this.text = text;
        this.frozen = frozen;
        this.id = id;
    }
    HighlightRange.fromSelection = function (idHook) {
        var range = selection_1.getDomRange();
        if (!range) {
            return null;
        }
        var start = {
            $node: range.startContainer,
            offset: range.startOffset
        };
        var end = {
            $node: range.endContainer,
            offset: range.endOffset
        };
        var text = range.toString();
        var id = idHook.call(start, end, text);
        id = id !== undefined && id !== null ? id : uuid_1.default();
        return new HighlightRange(start, end, text, id);
    };
    // serialize the HRange instance
    // so that you can save the returned object (e.g. use JSON.stringify on it and send to backend)
    HighlightRange.prototype.serialize = function ($root, hooks) {
        var startMeta = dom_1.getDomMeta(this.start.$node, this.start.offset, $root);
        var endMeta = dom_1.getDomMeta(this.end.$node, this.end.offset, $root);
        var extra;
        if (!hooks.Serialize.RecordInfo.isEmpty()) {
            extra = hooks.Serialize.RecordInfo.call(this.start, this.end, $root);
        }
        this.frozen = true;
        return new index_1.default(startMeta, endMeta, this.text, this.id, extra);
    };
    HighlightRange.removeDomRange = selection_1.removeSelection;
    return HighlightRange;
}());
exports.default = HighlightRange;
//# sourceMappingURL=index.js.map