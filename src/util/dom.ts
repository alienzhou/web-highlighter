/**
 * @file dom 操作相关的通用工具类
 */

import {RootElement} from '../types';
import {
    ID_DIVISION,
    DATASET_IDENTIFIER,
    CAMEL_DATASET_IDENTIFIER,
    CAMEL_DATASET_IDENTIFIER_EXTRA
} from './const';

/**
 * whether a wrapper node
 */
export const isHighlightWrapNode = ($node: HTMLElement): boolean => (
    !!$node.dataset && !!$node.dataset[CAMEL_DATASET_IDENTIFIER]
);

/**
 * get highlight id by wrapping node
 */
export const getHighlightId = ($node: HTMLElement): string => {
    if (isHighlightWrapNode($node)) {
        return $node.dataset[CAMEL_DATASET_IDENTIFIER];
    }
    return '';
};

/**
 * get all highlight wrapping nodes nodes from a root node
 */
export const getHighlightsByRoot = (
    $roots: RootElement | Array<RootElement>,
    wrapTag: string
): Array<HTMLElement> => {
    if (!Array.isArray($roots)) {
        $roots = [$roots];
    }

    const $wraps = [];
    for (let i = 0; i < $roots.length; i++) {
        const $list = $roots[i].querySelectorAll(`${wrapTag}[data-${DATASET_IDENTIFIER}]`);
        $wraps.push.apply($wraps, $list);
    }
    return $wraps;
}

/**
 * get all highlight wrapping nodes by highlight id from a root node
 */
export const getHighlightById = (
    $root: RootElement,
    id: String,
    wrapTag: string
): Array<HTMLElement> => {
    const $highlights = [];
    const reg = new RegExp(`(${id}\\${ID_DIVISION}|\\${ID_DIVISION}?${id}$)`);
    const $list = $root.querySelectorAll(`${wrapTag}[data-${DATASET_IDENTIFIER}]`);
    for (let k = 0; k < $list.length; k++) {
        const $n = $list[k] as HTMLElement;
        const nid = $n.dataset[CAMEL_DATASET_IDENTIFIER];
        if (nid === id) {
            $highlights.push($n);
            continue;
        }
        const extraId = $n.dataset[CAMEL_DATASET_IDENTIFIER_EXTRA];
        if (reg.test(extraId)) {
            $highlights.push($n);
            continue;
        }
    }
    return $highlights;
};

export const forEach = ($nodes: NodeList, cb: Function): void => {
    for (let i = 0; i < $nodes.length; i++) {
        cb($nodes[i], i, $nodes);
    }
};

/**
 * maybe be need some polyfill methods later
 * provide unified dom methods for compatibility
 */
export const addEventListener = ($el: RootElement, evt: string, fn: EventListenerOrEventListenerObject): Function => {
    $el.addEventListener(evt, fn);
    return () => removeEventListener($el, evt, fn);
};

export const removeEventListener = ($el: RootElement, evt: string, fn: EventListenerOrEventListenerObject): void => {
    $el.removeEventListener(evt, fn);
};

export const addClass = ($el: HTMLElement, className: string): void => {
    $el.classList.add(className);
};

export const removeClass = ($el: HTMLElement, className: string): void => {
    $el.classList.remove(className);
};

export const hasClass = ($el: HTMLElement, className: string): boolean => {
    return $el.classList.contains(className);
};