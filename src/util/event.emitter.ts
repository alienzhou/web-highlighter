/**
 * tiny event emitter
 * modify from mitt
*/

type EventHandler = (event?: any) => void;
type EventHandlerList = Array<EventHandler>;
type HandlersMap = {[propName: string]: EventHandlerList};

class EventEmitter {
    private handlersMap: HandlersMap = Object.create(null);

    on(type: string, handler: EventHandler) {
        if (!this.handlersMap[type]) {
            this.handlersMap[type] = [];
        }
        this.handlersMap[type].push(handler);
        return this;
    }

    off(type: string, handler: EventHandler) {
        if (this.handlersMap[type]) {
            this.handlersMap[type].splice(this.handlersMap[type].indexOf(handler) >>> 0, 1);
        }
        return this;
    }

    emit(type: string, ...data) {
        if (this.handlersMap[type]) {
            this.handlersMap[type].slice().forEach(handler => handler(...data));
        }
        return this;
    }
}

export default EventEmitter;