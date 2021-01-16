/**
 * inject styles
 */
import { STYLESHEET_ID, getStylesheet } from '@src/util/const';

export const initDefaultStylesheet = () => {
    const styleId = STYLESHEET_ID;

    let $style: HTMLStyleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!$style) {
        const $cssNode = document.createTextNode(getStylesheet());

        $style = document.createElement('style');
        $style.id = styleId;
        $style.appendChild($cssNode);
        document.head.appendChild($style);
    }

    return $style;
};
