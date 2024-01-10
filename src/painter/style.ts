/**
 * inject styles
 */
import { STYLESHEET_ID, getStylesheet } from '@src/util/const';

export const initDefaultStylesheet = (rootDocument: Document) => {
    const styleId = STYLESHEET_ID;

    let $style: HTMLStyleElement = rootDocument.getElementById(styleId) as HTMLStyleElement;

    if (!$style) {
        const $cssNode = rootDocument.createTextNode(getStylesheet());

        $style = rootDocument.createElement('style');
        $style.id = styleId;
        $style.appendChild($cssNode);
        rootDocument.head.appendChild($style);
    }

    return $style;
};
