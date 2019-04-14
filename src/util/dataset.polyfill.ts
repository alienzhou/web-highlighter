/**
 * Dataset Polyfill
 * cSpell: ignore Polyfill
 */

(function elementDatasetPolyfill(): void {
    if (!document.documentElement.dataset
        && (
            !Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'dataset')
            ||!Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'dataset').get
        )
    ) {
        const descriptor: PropertyDescriptor = {};
        descriptor.enumerable = true;
        descriptor.get = function get(): Object {
            const element: HTMLElement = this;
            const map = {};
            const attributes: NamedNodeMap = this.attributes;

            function toUpperCase(n: string): string {
                return n.charAt(1).toUpperCase();
            }

            function getter():string {
                return this.value;
            }

            function setter(name, value): void {
                if (typeof value !== 'undefined') {
                    this.setAttribute(name, value);
                } else {
                    this.removeAttribute(name);
                }
            }

            for (let i = 0; i < attributes.length; i++) {
                const attribute = attributes[i];
                if (attribute && attribute.name && (/^data-\w[\w-]*$/).test(attribute.name)) {
                    const name = attribute.name;
                    const value = attribute.value;
                    const propName = name.substr(5).replace(/-./g, toUpperCase);

                    Object.defineProperty(map, propName, {
                        enumerable: descriptor.enumerable,
                        get: getter.bind({ value: value || '' }),
                        set: setter.bind(element, name)
                    });
                }
            }
            return map;
        }
        Object.defineProperty(HTMLElement.prototype, 'dataset', descriptor);
    }
})();