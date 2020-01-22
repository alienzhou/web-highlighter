/**
 * all constants
 * cSpell:ignore mengshou
 */

import camel from './camel';
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
export const DEFAULT_OPTIONS = {
    $root: window.document || window.document.documentElement,
    exceptSelectors: null,
    wrapTag: DEFAULT_WRAP_TAG,
    style: {
        className: 'highlight-mengshou-wrap'
    }
};

const styles = DEFAULT_OPTIONS.style;
export const STYLESHEET_TEXT = `
    .${styles.className} {
        background: #ff9;
        cursor: pointer;
    }
    .${styles.className}.active {
        background: #ffb;
    }
`;
