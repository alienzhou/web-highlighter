"use strict";
/**
 * simple hook
 * webpack-plugin-liked api
 */
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Hook = /** @class */ (function () {
    function Hook(name) {
        this.name = '';
        this.ops = [];
        this.name = name;
    }
    Hook.prototype.tap = function (cb) {
        this.ops.push(cb);
        return this;
    };
    Hook.prototype.isEmpty = function () {
        return this.ops.length === 0;
    };
    Hook.prototype.call = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return this.ops.reduce(function (result, op) { return op.apply(void 0, __spread(args)); }, null);
    };
    return Hook;
}());
exports.default = Hook;
//# sourceMappingURL=hook.js.map