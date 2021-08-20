export class HashHandler {
    /**
     *
     * @param {Number|Boolean|Object} input
     *
     * @returns {{name: String, set: Function}}
     */
    static v(input: number | boolean | Object): {
        name: string;
        set: Function;
    };
    constructor(path: any, func: any);
    /** @type {RegExp}*/
    path: RegExp;
    /** @type {} */
    pathVariables: any;
    func: any;
    /**
     * @param {String} path
     *
     * @returns {Promise<[Element,number]|false>}
     */
    handle(path: string, oldPath: any): Promise<[Element, number] | false>;
}
/**
 * @example
 *
 * ```
 * let hash = new HashManager();
 * handler('home', ()=>new Panel("home"));
 * handler('settings', ()=>new Panel("settings"));
 * hash.attach(document.body);
 * ```
 */
export class HashManager extends BasicElement {
    static DIRECTION: {
        NONE: number;
        LEFT: number;
        RIGHT: number;
        BOTTOM: number;
        TOP: number;
        RANDOM: number;
    };
    static Handler: typeof HashHandler;
    static read(pathlike: any): string;
    constructor(key?: any);
    key: any;
    hash: any;
    depth: number;
    eventlistener: any;
    /** @type {HashHandler[]} */
    handlers: HashHandler[];
    position: number[];
    get value(): any;
    handler(path: any, func: any): HashManager;
    addHandler(h: any): void;
    set(value: any, fireOnChange?: boolean): Promise<void>;
    hashChange(): Promise<void>;
    /**
     *
     * @param {*} body
     * @param {Number|[Number,Number]} direction
     */
    swapContent(body: any, direction?: number | [number, number]): Promise<HTMLElement>;
    #private;
}
import { BasicElement } from "./BasicElement.js";
