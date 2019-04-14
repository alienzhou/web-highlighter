"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
function getDeferred() {
    var promise;
    var resolve;
    var reject;
    promise = new Promise(function (r, j) {
        resolve = r;
        reject = j;
    });
    return {
        promise: promise,
        resolve: resolve,
        reject: reject
    };
}
exports.default = getDeferred;
;
exports.resolve = function (data) {
    var defer = getDeferred();
    defer.resolve(data);
    return defer.promise;
};
exports.reject = function (data) {
    var defer = getDeferred();
    defer.reject(data);
    return defer.promise;
};
//# sourceMappingURL=deferred.js.map