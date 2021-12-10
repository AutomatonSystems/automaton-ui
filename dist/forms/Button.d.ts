import "./Button.css";
import { BasicElement } from "../BasicElement.js";
import { Appendable } from "../utils.js";
export declare type ButtonOptions = {
    icon?: string;
    style?: 'button' | 'text' | string;
    color?: string;
};
export declare class Button extends BasicElement {
    /**
     *
     * @param {String|HTMLElement} content
     * @param {EventListenerOrEventListenerObject|String} callback callback when the button is clicked
     * @param {{icon?: String, style?: String, color?: String|boolean}} options
     */
    constructor(content?: Appendable, callback?: EventListenerOrEventListenerObject | String, options?: ButtonOptions);
}
