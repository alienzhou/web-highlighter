"use strict";
/**
 * tiny event emitter
 * modify from mitt
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
var EventEmitter = /** @class */ (function () {
    function EventEmitter() {
        this.handlersMap = Object.create(null);
    }
    EventEmitter.prototype.on = function (type, handler) {
        if (!this.handlersMap[type]) {
            this.handlersMap[type] = [];
        }
        this.handlersMap[type].push(handler);
        return this;
    };
    EventEmitter.prototype.off = function (type, handler) {
        if (this.handlersMap[type]) {
            this.handlersMap[type].splice(this.handlersMap[type].indexOf(handler) >>> 0, 1);
        }
        return this;
    };
    EventEmitter.prototype.emit = function (type) {
        var data = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            data[_i - 1] = arguments[_i];
        }
        if (this.handlersMap[type]) {
            this.handlersMap[type].slice().forEach(function (handler) { return handler.apply(void 0, __spread(data)); });
        }
        return this;
    };
    return EventEmitter;
}());
exports.default = EventEmitter;
//# sourceMappingURL=event.emitter.js.map