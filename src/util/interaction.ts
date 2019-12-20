/**
 * adapter for mobile and desktop events
 */

import {IInteraction, UserInputEvent} from '../types';
import detectMobile from './is.mobile';

const isMobile = detectMobile(window.navigator.userAgent);
const interaction: IInteraction = {
    PointerEnd: isMobile ? UserInputEvent.touchend : UserInputEvent.mouseup,
    PointerTap: isMobile ? UserInputEvent.touchstart : UserInputEvent.click,
    // hover and click will be the same event in mobile
    PointerOver: isMobile ? UserInputEvent.touchstart : UserInputEvent.mouseover,
};

export default interaction;
