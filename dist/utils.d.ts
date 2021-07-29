/**
 * Add items onto a element
 *
 * @param {Element} element
 * @param {Element|String|Element[]} content
 */
export function append(element: Element, content: Element | string | Element[]): void;
export function uuid(): string;
/**
 * Convert html text to a HTMLElement
 *
 * @param {String} html
 *
 * @returns {HTMLElement}
 */
export function htmlToElement(html: string, wrapper?: string): HTMLElement;
/**
 *
 * @param  {...Element} elements
 *
 * @returns {HTMLElement[]}
 */
export function castHtmlElements(...elements: Element[]): HTMLElement[];
/**
 * shuffle the contents of an array
 *
 * @param {*[]} array
 */
export function shuffle(array: any[]): any[];
/**
 * Downloads a file to the users machine - must be called from within a click event (or similar)
 *
 * @param {String} filename
 * @param {Object} json
 */
export function downloadJson(filename: string, json: Object): void;
/**
 *
 * Load a script
 *
 * @param {String} url
 *
 * @returns {Promise}
 */
export function dynamicallyLoadScript(url: string): Promise<any>;
export function sleep(time: any, value: any): Promise<any>;
