"use strict";
/**
 * highlighter provides an easy alternative implementation for frontend store
 * you can also implement your own lib (e.g. indexedDB)
 * or even use a backend store server
 */
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../model/source/index");
var types_1 = require("./types");
var deferred_1 = require("../../util/deferred");
var const_1 = require("../../util/const");
var LocalStore = /** @class */ (function () {
    function LocalStore(id) {
        this.type = types_1.StoreType.LOCAL;
        this.key = '';
        this.key = id !== undefined ? const_1.LOCAL_STORE_KEY + "-" + id : const_1.LOCAL_STORE_KEY;
    }
    LocalStore.prototype.storeToJson = function () {
        var store = localStorage.getItem(this.key);
        var sources;
        try {
            sources = JSON.parse(store) || [];
        }
        catch (e) {
            sources = [];
        }
        return sources;
    };
    LocalStore.prototype.jsonToStore = function (stores) {
        localStorage.setItem(this.key, JSON.stringify(stores));
    };
    LocalStore.prototype.save = function (data) {
        var stores = this.storeToJson();
        var map = {};
        stores.forEach(function (store, idx) { return map[store.hs.id] = idx; });
        if (!Array.isArray(data)) {
            data = [data];
        }
        data.forEach(function (store) {
            // update
            if (map[store.hs.id] !== undefined) {
                stores[map[store.hs.id]] = store;
            }
            // append
            else {
                stores.push(store);
            }
        });
        this.jsonToStore(stores);
        return deferred_1.resolve(true);
    };
    LocalStore.prototype.forceSave = function (store) {
        var stores = this.storeToJson();
        stores.push(store);
        this.jsonToStore(stores);
        return deferred_1.resolve(true);
    };
    LocalStore.prototype.get = function (id) {
        var list = this.storeToJson()
            .filter(function (store) { return store.hs.id === id; })
            .map(function (store) { return ({
            hs: new index_1.default(store.hs.startMeta, store.hs.endMeta, store.hs.text, store.hs.id),
            info: store.info
        }); });
        return deferred_1.resolve(list[0]);
    };
    LocalStore.prototype.remove = function (id) {
        var stores = this.storeToJson();
        var index = null;
        for (var i = 0; i < stores.length; i++) {
            if (stores[i].hs.id === id) {
                index = i;
                break;
            }
        }
        stores.splice(index, 1);
        this.jsonToStore(stores);
        return deferred_1.resolve(true);
    };
    LocalStore.prototype.getAll = function () {
        return deferred_1.resolve(this.storeToJson().map(function (store) { return ({
            hs: new index_1.default(store.hs.startMeta, store.hs.endMeta, store.hs.text, store.hs.id),
            info: store.info
        }); }));
    };
    LocalStore.prototype.removeAll = function () {
        this.jsonToStore([]);
        return deferred_1.resolve(true);
    };
    return LocalStore;
}());
exports.default = LocalStore;
//# sourceMappingURL=local.store.js.map