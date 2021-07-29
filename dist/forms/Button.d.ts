export class Button extends BasicElement {
    /**
     *
     * @param {String|HTMLElement} content
     * @param {EventListenerOrEventListenerObject|String} callback callback when the button is clicked
     * @param {{icon?: String, style?: String, color?: String|boolean}} options
     */
    constructor(content: string | HTMLElement, callback: EventListenerOrEventListenerObject | string, { icon, style, color }?: {
        icon?: string;
        style?: string;
        color?: string | boolean;
    });
    #private;
}
import { BasicElement } from "../BasicElement.js";
