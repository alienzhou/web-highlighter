// cSpell:ignore mengshou
import camel from './camel';
export const ID_DIVISION = ';';
export const LOCAL_STORE_KEY = 'highlight-mengshou';
export const STYLE_TAG_ID = 'highlight-mengshou-style';

export const DATASET_IDENTIFIER = 'highlight-id';
export const DATASET_IDENTIFIER_EXTRA = 'highlight-id-extra';
export const DATASET_SPLIT_TYPE = 'highlight-split-type';
export const CAMEL_DATASET_IDENTIFIER = camel(DATASET_IDENTIFIER);
export const CAMEL_DATASET_IDENTIFIER_EXTRA = camel(DATASET_IDENTIFIER_EXTRA);
export const CAMEL_DATASET_SPLIT_TYPE = camel(DATASET_SPLIT_TYPE);

export const DEFAULT_OPTIONS = {
    $root: window.document,
    exceptSelectors: null,
    style: {
        highlightClassName: 'highlight-mengshou-wrap'
    }
};

const styles = DEFAULT_OPTIONS.style;
export const STYLE_TAG_TEXT = `
    .${styles.highlightClassName} {
        background: #ff9;
        cursor: pointer;
    }
    .${styles.highlightClassName}.active {
        background: #ffb;
    }
`;
