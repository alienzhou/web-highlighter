/**
 * adapter for mobile and desktop events
 */

import type { IInteraction } from '@src/types';
import { UserInputEvent } from '@src/types';
import detectMobile from '@src/util/is.mobile';

export default (window: Window): IInteraction => {
    const isMobile = detectMobile(window.navigator.userAgent);

    const interaction: IInteraction = {
        PointerEnd: isMobile ? UserInputEvent.touchend : UserInputEvent.mouseup,
        PointerTap: isMobile ? UserInputEvent.touchstart : UserInputEvent.click,
        // hover and click will be the same event in mobile
        PointerOver: isMobile ? UserInputEvent.touchstart : UserInputEvent.mouseover,
    };

    return interaction;
};
