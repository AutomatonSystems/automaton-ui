import { Form, FormTemplate } from "./forms/Form.js";
/**
 *
 * @param {*} template
 * @param {*} param1
 *
 * @returns {Promise<*>} returns the response from the user (the populated form json)
 */
export declare function popupForm<T>(template: FormTemplate<T> | FormTemplate<T>[], { value, title, submitText, wrapper, dismissable }?: {
    value?: {};
    title?: string;
    submitText?: string;
    wrapper?: (form: Form<T>) => HTMLElement;
    dismissable?: boolean;
}): Promise<unknown>;
export declare function info(...args: any[] | any): void;
export declare function warn(...args: any[] | any): void;
export declare function error(...args: any[] | any): void;
