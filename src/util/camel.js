"use strict";
/**
 * convert dash-joined string to camel case
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (function (str) { return (str.split('-').reduce(function (str, s, idx) { return str + (idx === 0 ? s : s[0].toUpperCase() + s.slice(1)); }, '')); });
//# sourceMappingURL=camel.js.map