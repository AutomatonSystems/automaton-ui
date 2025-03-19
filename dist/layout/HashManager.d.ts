import { BasicElement } from "../BasicElement.js";
import "./HashManager.css";
type HashVariableMapperFunction = {
    name: string;
    set: (obj: any, value: any) => void;
};
type SlideProperty = number | [number, number];
type HashResponse = false | HTMLElement | [HTMLElement, SlideProperty];
type HashChangeHandler = (value: {
    [index: string]: string | number | boolean | object;
}) => HashResponse | Promise<HashResponse>;
type BasicHashHandler = {
    handle: (path: string, oldPath: string) => Promise<HashResponse>;
};
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
    handle(path: string, oldPath: string): Promise<HashResponse>;
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
    eventlistener: () => void;
    handlers: BasicHashHandler[];
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
    static hashPairs(): string[][];
    static read(pathlike: string): any;
    static write(pathlike: string, value: any, passive?: boolean): void;
    remove(): this;
    get value(): string;
    handler(path: string, func: HashChangeHandler): this;
    addHandler(h: BasicHashHandler): void;
    set(value: any, fireOnChange?: boolean, noHistory?: boolean): Promise<void>;
    hashChange(): Promise<void>;
    swapContent(body: HTMLElement, direction?: SlideProperty): Promise<HTMLElement>;
}
export {};
