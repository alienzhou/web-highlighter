/**
 * simple hook
 * webpack-plugin-liked api
 */

class Hook {
    name = '';
    private ops: Array<Function> = [];

    constructor(name?) {
        this.name = name;
    }

    tap(cb: Function) {
        this.ops.push(cb);
        return this;
    }

    isEmpty(): boolean {
        return this.ops.length === 0;
    }

    call(...args) {
        return this.ops.reduce((result, op) => op(...args), null);
    }
}

export default Hook;