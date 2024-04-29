/**
 * all constants
 * cSpell:ignore mengshou
 */

import type HighlightSource from '@src/model/source';
import type { ERROR } from '@src/types';
import camel from '@src/util/camel';
import EventEmitter from '@src/util/event.emitter';

export const ID_DIVISION = ';';
export const LOCAL_STORE_KEY = 'highlight-mengshou';
export const STYLESHEET_ID = 'highlight-mengshou-style';

export const DATASET_IDENTIFIER = 'highlight-id';
export const DATASET_IDENTIFIER_EXTRA = 'highlight-id-extra';
export const DATASET_SPLIT_TYPE = 'highlight-split-type';
export const CAMEL_DATASET_IDENTIFIER = camel(DATASET_IDENTIFIER);
export const CAMEL_DATASET_IDENTIFIER_EXTRA = camel(DATASET_IDENTIFIER_EXTRA);
export const CAMEL_DATASET_SPLIT_TYPE = camel(DATASET_SPLIT_TYPE);

const DEFAULT_WRAP_TAG = 'span';

export const getDefaultOptions = () => ({
    $root: document || document.documentElement,
    rootDocument: document,
    exceptSelectors: null,
    wrapTag: DEFAULT_WRAP_TAG,
    verbose: false,
    style: {
        className: 'highlight-wrap',
    },
    window,
});

export const getStylesheet = () => `
    .${getDefaultOptions().style.className} {
    }
    .${getDefaultOptions().style.className}.active {
        background: #ffb;
    }
`;

export const ROOT_IDX = -2;
export const UNKNOWN_IDX = -1;
export const INTERNAL_ERROR_EVENT = 'error';

interface EventHandlerMap {
    [key: string]: (...args: any[]) => void;
    error: (data: { type: ERROR; detail?: HighlightSource; error?: any }) => void;
}
class ErrorEventEmitter extends EventEmitter<EventHandlerMap> {}

export const eventEmitter = new ErrorEventEmitter();
