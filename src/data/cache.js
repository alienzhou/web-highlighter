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
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var event_emitter_1 = require("@src/util/event.emitter");
var types_1 = require("../types");
var Cache = /** @class */ (function (_super) {
    __extends(Cache, _super);
    function Cache() {
        var _this = _super.call(this) || this;
        _this._data = new Map();
        return _this;
    }
    Object.defineProperty(Cache.prototype, "data", {
        get: function () {
            return this.getAll();
        },
        set: function (map) {
            throw types_1.ERROR.CACHE_SET_ERROR;
        },
        enumerable: true,
        configurable: true
    });
    Cache.prototype.save = function (source) {
        var _this = this;
        if (!Array.isArray(source)) {
            this._data.set(source.id, source);
            return;
        }
        source.forEach(function (s) { return _this._data.set(s.id, s); });
    };
    Cache.prototype.get = function (id) {
        return this._data.get(id);
    };
    Cache.prototype.remove = function (id) {
        this._data.delete(id);
    };
    Cache.prototype.getAll = function () {
        var e_1, _a;
        var list = [];
        this._data = new Map();
        try {
            for (var _b = __values(this._data), _c = _b.next(); !_c.done; _c = _b.next()) {
                var pair = _c.value;
                list.push(pair[1]);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return list;
    };
    Cache.prototype.removeAll = function () {
        var e_2, _a;
        var ids = [];
        try {
            for (var _b = __values(this._data), _c = _b.next(); !_c.done; _c = _b.next()) {
                var pair = _c.value;
                ids.push(pair[0]);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
        this._data = new Map();
        return ids;
    };
    return Cache;
}(event_emitter_1.default));
exports.default = Cache;
//# sourceMappingURL=cache.js.map