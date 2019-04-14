/**
 * Dataset Polyfill
 * cSpell: ignore Polyfill
 */
(function elementDatasetPolyfill() {
    if (!document.documentElement.dataset
        && (!Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'dataset')
            || !Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'dataset').get)) {
        var descriptor_1 = {};
        descriptor_1.enumerable = true;
        descriptor_1.get = function get() {
            var element = this;
            var map = {};
            var attributes = this.attributes;
            function toUpperCase(n) {
                return n.charAt(1).toUpperCase();
            }
            function getter() {
                return this.value;
            }
            function setter(name, value) {
                if (typeof value !== 'undefined') {
                    this.setAttribute(name, value);
                }
                else {
                    this.removeAttribute(name);
                }
            }
            for (var i = 0; i < attributes.length; i++) {
                var attribute = attributes[i];
                if (attribute && attribute.name && (/^data-\w[\w-]*$/).test(attribute.name)) {
                    var name_1 = attribute.name;
                    var value = attribute.value;
                    var propName = name_1.substr(5).replace(/-./g, toUpperCase);
                    Object.defineProperty(map, propName, {
                        enumerable: descriptor_1.enumerable,
                        get: getter.bind({ value: value || '' }),
                        set: setter.bind(element, name_1)
                    });
                }
            }
            return map;
        };
        Object.defineProperty(HTMLElement.prototype, 'dataset', descriptor_1);
    }
})();
//# sourceMappingURL=dataset.polyfill.js.map