import { Form, FormTemplate } from "./forms/Form.js";
/**
 *
 * @param {*} template
 * @param {*} param1
 *
 * @returns {Promise<*>} returns the response from the user (the populated form json)
 */
export declare function popupForm(template: FormTemplate, { value, title, submitText, wrapper, dismissable }?: {
    value?: {};
    title?: string;
    submitText?: string;
    wrapper?: (form: Form) => HTMLElement;
    dismissable?: boolean;
}): Promise<unknown>;
export declare function info(...args: any[] | any): void;
export declare function warn(...args: any[] | any): void;
export declare function error(...args: any[] | any): void;
