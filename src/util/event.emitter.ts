/**
 * tiny event emitter
 * modify from mitt
 */

type EventHandler = (...data: unknown[]) => void;

type EventMap = Record<string, EventHandler>;
type HandlersMap<T extends EventMap> = {
    [K in keyof T]: T[K][];
};

class EventEmitter<U extends EventMap = EventMap> {
    private handlersMap: HandlersMap<U> = Object.create(null);

    on<T extends keyof U>(type: T, handler: U[T]) {
        if (!this.handlersMap[type]) {
            this.handlersMap[type] = [];
        }

        this.handlersMap[type].push(handler);

        return this;
    }

    off<T extends keyof U>(type: T, handler: U[T]) {
        if (this.handlersMap[type]) {
            this.handlersMap[type].splice(this.handlersMap[type].indexOf(handler) >>> 0, 1);
        }

        return this;
    }

    emit<T extends keyof U>(type: T, ...data: Parameters<U[T]>) {
        if (this.handlersMap[type]) {
            this.handlersMap[type].slice().forEach(handler => {
                handler(...data);
            });
        }

        return this;
    }
}

export default EventEmitter;
