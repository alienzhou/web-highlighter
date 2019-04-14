"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
;
var SplitType;
(function (SplitType) {
    SplitType["none"] = "none";
    SplitType["head"] = "head";
    SplitType["tail"] = "tail";
    SplitType["both"] = "both";
})(SplitType = exports.SplitType || (exports.SplitType = {}));
;
var ERROR;
(function (ERROR) {
    ERROR["DOM_TYPE_ERROR"] = "[DOM] Receive wrong node type.";
    ERROR["DOM_SELECTION_EMPTY"] = "[DOM] The selection contains no dom node, may be you except them.";
    ERROR["RANGE_INVALID"] = "[RANGE] Got invalid dom range, can't convert to a valid highlight range.";
    ERROR["RANGE_NODE_INVALID"] = "[RANGE] Start or end node isn't a text node, it may occur an error.";
    ERROR["DB_ID_DUPLICATE_ERROR"] = "[STORE] Unique id conflict.";
    ERROR["CACHE_SET_ERROR"] = "[CACHE] Cache.data can't be set manually, please use .save().";
    ERROR["SOURCE_TYPE_ERROR"] = "[SOURCE] Object isn't a highlight source instance.";
    ERROR["HIGHLIGHT_RANGE_FROZEN"] = "[HIGHLIGHT_RANGE] A highlight range must be frozen before render.";
    ERROR["HIGHLIGHT_SOURCE_NONE_RENDER"] = "[HIGHLIGHT_SOURCE] This highlight source isn't rendered. May be the exception skips it or the dom structure has changed.";
})(ERROR = exports.ERROR || (exports.ERROR = {}));
;
var EventType;
(function (EventType) {
    EventType["CREATE"] = "selection:create";
    EventType["REMOVE"] = "selection:remove";
    EventType["MODIFY"] = "selection:modify";
    EventType["HOVER"] = "selection:hover";
    EventType["HOVER_OUT"] = "selection:hover-out";
    EventType["CLICK"] = "selection:click";
})(EventType = exports.EventType || (exports.EventType = {}));
;
var SelectedNodeType;
(function (SelectedNodeType) {
    SelectedNodeType["text"] = "text";
    SelectedNodeType["span"] = "span";
})(SelectedNodeType = exports.SelectedNodeType || (exports.SelectedNodeType = {}));
;
;
//# sourceMappingURL=index.js.map