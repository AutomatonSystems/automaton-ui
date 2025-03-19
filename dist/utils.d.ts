export declare const sleep: (time: number, value?: any) => Promise<unknown>;
export type Appendable = Node | string | number | boolean | Appendable[];
/**
 * Add items onto a element
 *
 * @param element
 * @param content
 */
export declare function append(element: HTMLElement, content: Appendable): void;
export declare let random: () => number;
export declare function setRandom(rng: () => number): void;
export declare function uuid(): string;
/**
 * Convert html text to a HTMLElement
 *
 * @param html
 *
 * @returns
 */
export declare function htmlToElement(html: string, wrapper?: string): HTMLElement;
/**
 *
 * @param  {...Element} elements
 *
 * @returns {HTMLElement[]}
 */
export declare function castHtmlElements(...elements: any[]): HTMLElement[];
/**
 * shuffle the contents of an array
 *
 * @param {*[]} array
 */
export declare function shuffle<T>(array: T[]): T[];
/**
 * Downloads a file to the users machine - must be called from within a click event (or similar)
 *
 * @param {String} filename
 * @param {Object} json
 */
export declare function downloadJson(filename: string, json: any): void;
/**
 *
 * Load a script
 *
 * @param {String} url
 *
 * @returns {Promise}
 */
export declare function dynamicallyLoadScript(url: string): Promise<unknown>;
