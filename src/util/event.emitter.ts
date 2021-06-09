/**
 * tiny event emitter
 * modify from mitt
 */

import type { CreateFrom, ERROR, EventType } from '@src/types';
import type Highlighter from '@src/index';
import type HighlightSource from '@src/model/source';

type EventHandler = (...data: unknown[]) => void;

interface EventHandlerMap {
    [key: string]: (...args: any[]) => void;
    [EventType.CLICK]: (data: { id: string }, h: Highlighter, e: MouseEvent | TouchEvent) => void;
    [EventType.HOVER]: (data: { id: string }, h: Highlighter, e: MouseEvent | TouchEvent) => void;
    [EventType.HOVER_OUT]: (data: { id: string }, h: Highlighter, e: MouseEvent | TouchEvent) => void;
    [EventType.CREATE]: (data: { sources: HighlightSource[]; type: CreateFrom }, h: Highlighter) => void;
    [EventType.REMOVE]: (data: { ids: string[] }, h: Highlighter) => void;
    error: (data: { type: ERROR; detail?: HighlightSource; error?: any }) => void;
}

class EventEmitter {
    private handlersMap: Record<keyof EventHandlerMap, EventHandler[]> = Object.create(null);

    on<T extends keyof EventHandlerMap>(type: T, handler: EventHandlerMap[T]) {
        if (!this.handlersMap[type]) {
            this.handlersMap[type] = [];
        }

        this.handlersMap[type].push(handler);

        return this;
    }

    off<T extends keyof EventHandlerMap>(type: T, handler: EventHandlerMap[T]) {
        if (this.handlersMap[type]) {
            this.handlersMap[type].splice(this.handlersMap[type].indexOf(handler) >>> 0, 1);
        }

        return this;
    }

    emit<T extends keyof EventHandlerMap>(type: T, ...data: Parameters<EventHandlerMap[T]>) {
        if (this.handlersMap[type]) {
            this.handlersMap[type].slice().forEach(handler => {
                handler(...data);
            });
        }

        return this;
    }
}

export default EventEmitter;
