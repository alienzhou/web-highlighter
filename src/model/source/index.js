"use strict";
/**
 * HighlightSource Class (HSource)
 * This Object can be deSerialized to HRange.
 * Also it has the ability for persistence.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../range/index");
var dom_1 = require("./dom");
var HighlightSource = /** @class */ (function () {
    function HighlightSource(startMeta, endMeta, text, id, extra) {
        this.startMeta = startMeta;
        this.endMeta = endMeta;
        this.text = text;
        this.id = id;
        this.__isHighlightSource = {};
        if (extra) {
            this.extra = extra;
        }
    }
    HighlightSource.prototype.deSerialize = function ($root) {
        var _a = dom_1.queryElementNode(this, $root), start = _a.start, end = _a.end;
        var startInfo = dom_1.getTextChildByOffset(start, this.startMeta.textOffset);
        var endInfo = dom_1.getTextChildByOffset(end, this.endMeta.textOffset);
        var range = new index_1.default(startInfo, endInfo, this.text, this.id, true);
        return range;
    };
    return HighlightSource;
}());
exports.default = HighlightSource;
//# sourceMappingURL=index.js.map