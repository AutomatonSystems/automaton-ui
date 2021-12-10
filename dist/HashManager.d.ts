import { BasicElement } from "./BasicElement.js";
import "./HashManager.css";
declare type HashVariableMapperFunction = {
    name: string;
    set: (obj: any, value: any) => void;
};
declare type HashChangeHandler = (value: string | number | boolean | object) => false | HTMLElement | [HTMLElement, number];
export declare class HashHandler {
    /** @type {RegExp}*/
    path: RegExp;
    /** @type {} */
    pathVariables: HashVariableMapperFunction[];
    func: HashChangeHandler;
    constructor(path: string, func: HashChangeHandler);
    /**
     *
     * @param {Number|Boolean|Object} input
     *
     * @returns {{name: String, set: Function}}
     */
    static v(input: string): HashVariableMapperFunction;
    handle(path: string, oldPath: string): Promise<HTMLElement | [HTMLElement, number] | false>;
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
export declare class HashManager extends BasicElement {
    key: string;
    hash: string;
    depth: number;
    eventlistener: () => Promise<void>;
    handlers: HashHandler[];
    position: number[];
    static DIRECTION: {
        NONE: number;
        LEFT: number;
        RIGHT: number;
        BOTTOM: number;
        TOP: number;
        RANDOM: number;
    };
    static Handler: typeof HashHandler;
    constructor(key?: string);
    static read(pathlike: string): any;
    remove(): this;
    get value(): string;
    handler(path: string, func: HashChangeHandler): this;
    addHandler(h: HashHandler): void;
    set(value: any): void;
    hashChange(): Promise<void>;
    /**
     *
     * @param {*} body
     * @param {Number|[Number,Number]} direction
     */
    swapContent(body: HTMLElement, direction?: number): Promise<HTMLElement>;
}
export {};
