/**
 * simple hook
 * webpack-plugin-liked api
 */

type HookCallback<T> = (...args: unknown[]) => T;

class Hook<T = unknown> {
    name = '';

    private readonly ops: HookCallback<T>[] = [];

    constructor(name?) {
        this.name = name;
    }

    tap(cb: HookCallback<T>) {
        if (this.ops.indexOf(cb) === -1) {
            this.ops.push(cb);
        }

        return () => {
            this.remove(cb);
        };
    }

    remove(cb: HookCallback<T>) {
        const idx = this.ops.indexOf(cb);

        if (idx < 0) {
            return;
        }

        this.ops.splice(idx, 1);
    }

    isEmpty() {
        return this.ops.length === 0;
    }

    call(...args: unknown[]) {
        let ret: T;

        this.ops.forEach(op => {
            ret = op(...args);
        });

        return ret;
    }
}

export default Hook;
