"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@src/util/dataset.polyfill");
var event_emitter_1 = require("@src/util/event.emitter");
var types_1 = require("./types");
var range_1 = require("@src/model/range");
var source_1 = require("@src/model/source");
var dom_1 = require("@src/util/dom");
var const_1 = require("@src/util/const");
var uuid_1 = require("@src/util/uuid");
var hook_1 = require("@src/util/hook");
var cache_1 = require("@src/data/cache");
var painter_1 = require("@src/painter");
var local_store_1 = require("@src/addons/store/local.store");
var Highlighter = /** @class */ (function (_super) {
    __extends(Highlighter, _super);
    function Highlighter(options) {
        var _this = _super.call(this) || this;
        _this._getHooks = function () { return ({
            Render: {
                UUID: new hook_1.default('Render.UUID'),
                SelectedNodes: new hook_1.default('Render.SelectedNodes'),
                WrapNode: new hook_1.default('Render.WrapNode')
            },
            Serialize: {
                RecordInfo: new hook_1.default('Serialize.RecordInfo')
            },
            Remove: {
                UpdateNode: new hook_1.default('Remove.UpdateNode')
            }
        }); };
        _this._highlighFromHRange = function (range) {
            var source = range.serialize(_this.options.$root, _this.hooks);
            var $wraps = _this.painter.highlightRange(range);
            if ($wraps.length === 0) {
                console.warn(types_1.ERROR.DOM_SELECTION_EMPTY);
                return null;
            }
            _this.cache.save(source);
            _this.emit(types_1.EventType.CREATE, { sources: [source], type: 'from-input' }, _this);
            return source;
        };
        _this._handleSelection = function (e) {
            var range = range_1.default.fromSelection(_this.hooks.Render.UUID);
            if (range) {
                _this._highlighFromHRange(range);
                range_1.default.removeDomRange();
            }
        };
        _this._handleHighlightHover = function (e) {
            var $target = e.target;
            if (!dom_1.isHighlightWrapNode($target)) {
                _this._hoverId && _this.emit(types_1.EventType.HOVER_OUT, { id: _this._hoverId }, _this, e);
                _this._hoverId = null;
                return;
            }
            var id = dom_1.getHighlightId($target);
            // prevent trigger in the same highlight range
            if (_this._hoverId === id) {
                return;
            }
            // hover another highlight range, need to trigger previous highlight hover out event
            if (_this._hoverId) {
                _this.emit(types_1.EventType.HOVER_OUT, { id: _this._hoverId }, _this, e);
            }
            _this._hoverId = id;
            _this.emit(types_1.EventType.HOVER, { id: _this._hoverId }, _this, e);
        };
        _this._handleHighlightClick = function (e) {
            var $target = e.target;
            if (dom_1.isHighlightWrapNode($target)) {
                var id = dom_1.getHighlightId($target);
                _this.emit(types_1.EventType.CLICK, { id: id }, _this, e);
                return;
            }
        };
        _this.run = function () { return _this.options.$root.addEventListener('mouseup', _this._handleSelection); };
        _this.stop = function () { return _this.options.$root.removeEventListener('mouseup', _this._handleSelection); };
        _this.getDoms = function (id) { return id ? dom_1.getHighlightById(_this.options.$root, id) : dom_1.getHighlightsByRoot(_this.options.$root); };
        _this.addClass = function (className, id) { return _this.getDoms(id).forEach(function ($n) { return $n.classList.add(className); }); };
        _this.removeClass = function (className, id) { return _this.getDoms(id).forEach(function ($n) { return $n.classList.remove(className); }); };
        _this.getIdByDom = function ($node) { return dom_1.getHighlightId($node); };
        _this.dispose = function () {
            _this.options.$root.removeEventListener('mouseover', _this._handleHighlightHover);
            _this.options.$root.removeEventListener('mouseup', _this._handleSelection);
            _this.options.$root.removeEventListener('click', _this._handleHighlightClick);
            _this.removeAll();
        };
        _this.setOption = function (options) {
            _this.options = __assign({}, _this.options, options);
            _this.painter = new painter_1.default({
                $root: _this.options.$root,
                className: _this.options.style.className,
                exceptSelectors: _this.options.exceptSelectors
            }, _this.hooks);
        };
        _this.fromRange = function (range) {
            var start = {
                $node: range.startContainer,
                offset: range.startOffset
            };
            var end = {
                $node: range.endContainer,
                offset: range.endOffset
            };
            var text = range.toString();
            var id = _this.hooks.Render.UUID.call(start, end, text);
            id = id !== undefined && id !== null ? id : uuid_1.default();
            var hRange = new range_1.default(start, end, text, id);
            if (!hRange) {
                console.warn(types_1.ERROR.RANGE_INVALID);
                return null;
            }
            return _this._highlighFromHRange(hRange);
        };
        _this.fromStore = function (start, end, text, id) {
            try {
                var hs = new source_1.default(start, end, text, id);
                _this._highlighFromHSource(hs);
                return hs;
            }
            catch (err) {
                console.error(err, id, text, start, end);
                return null;
            }
        };
        _this.options = const_1.DEFAULT_OPTIONS;
        // initialize hooks
        _this.hooks = _this._getHooks();
        _this.setOption(options);
        // initialize cache
        _this.cache = new cache_1.default();
        // initialize event listener
        _this.options.$root.addEventListener('mouseover', _this._handleHighlightHover);
        _this.options.$root.addEventListener('click', _this._handleHighlightClick);
        return _this;
    }
    Highlighter.prototype._highlighFromHSource = function (sources) {
        if (sources === void 0) { sources = []; }
        var renderedSources = this.painter.highlightSource(sources);
        ;
        this.emit(types_1.EventType.CREATE, { sources: renderedSources, type: 'from-store' }, this);
        this.cache.save(sources);
    };
    Highlighter.prototype.remove = function (id) {
        if (!id) {
            return;
        }
        this.painter.removeHighlight(id);
        this.cache.remove(id);
        this.emit(types_1.EventType.REMOVE, { ids: [id] }, this);
    };
    Highlighter.prototype.removeAll = function () {
        this.painter.removeAllHighlight();
        var ids = this.cache.removeAll();
        this.emit(types_1.EventType.REMOVE, { ids: ids }, this);
    };
    Highlighter.event = types_1.EventType;
    Highlighter.LocalStore = local_store_1.default;
    return Highlighter;
}(event_emitter_1.default));
exports.default = Highlighter;
//# sourceMappingURL=index.js.map