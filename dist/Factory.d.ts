/**
 *
 * @param {*} template
 * @param {*} param1
 *
 * @returns {Promise<*>} returns the response from the user (the populated form json)
 */
export function popupForm(template: any, { value, title, submitText, wrapper, dismissable }?: any): Promise<any>;
export function info(...args: any[]): void;
export function warn(...args: any[]): void;
export function error(...args: any[]): void;
