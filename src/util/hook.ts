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

    tap(cb: Function): Function {
        if (this.ops.indexOf(cb) < 0) {
            this.ops.push(cb);
        }
        return () => this.remove(cb);
    }

    remove(cb: Function): void {
        const idx = this.ops.indexOf(cb);
        if (idx < 0) {
            return;
        }
        this.ops.splice(idx, 1);
    }

    isEmpty(): boolean {
        return this.ops.length === 0;
    }

    call(...args) {
        return this.ops.reduce((result, op) => op(...args), null);
    }
}

export default Hook;