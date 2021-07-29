export class AbstractInput extends BasicElement {
    /**
     *
     * @param {*} obj json object/array to keep up to date
     * @param {*} key json key/indes to keep up to date
     * @param {{callback?: Function, size?:Number, color?:String, placeholder?:string}} params configuration parameters
     */
    constructor(obj: any, key: any, params: {
        callback?: Function;
        size?: number;
        color?: string;
        placeholder?: string;
    });
    obj: any;
    key: any;
    set value(arg: any);
    get value(): any;
    /**
     *
     * @param {String} name
     *
     * @returns {InputLabel}
     */
    label(name: string): InputLabel;
    #private;
}
export class AbstractHTMLInput extends HTMLInputElement {
    /**
     *
     * @param {*} obj json object/array to keep up to date
     * @param {*} key json key/indes to keep up to date
     * @param {{callback?: Function, size?:Number, color?:String, placeholder?:string}} params configuration parameters
     */
    constructor(obj: any, key: any, params: {
        callback?: Function;
        size?: number;
        color?: string;
        placeholder?: string;
    });
    /**
     *
     * @param {String} name
     *
     * @returns {InputLabel}
     */
    label(name: string): InputLabel;
}
export class StringInput extends AbstractHTMLInput {
    /**
     *
     * @param {*} obj json object/array to keep up to date
     * @param {*} key json key/indes to keep up to date
     * @param {{callback?: Function, size?:Number, color?:String, placeholder?:string}} params configuration parameters
     */
    constructor(obj: any, key: any, { callback, size, color, placeholder }?: {
        callback?: Function;
        size?: number;
        color?: string;
        placeholder?: string;
    });
}
/**
 * A number input that keeps a json object
 * up to date with it's value
 *
 */
export class NumberInput extends AbstractHTMLInput {
    /**
     *
     * @param {*} obj json object/array to keep up to date
     * @param {*} key json key/indes to keep up to date
     * @param {{callback?: Function, size?:Number, color?:String, placeholder?:string}} params configuration parameters
     */
    constructor(obj: any, key: any, { callback, size, color, placeholder }?: {
        callback?: Function;
        size?: number;
        color?: string;
        placeholder?: string;
    });
}
export class SelectInput extends HTMLSelectElement {
    constructor(obj: any, key: any, { options, callback, size, color, placeholder }?: {
        options?: any[];
        callback?: any;
        size?: any;
        color?: any;
        placeholder?: any;
    });
    _value: any;
    obj: any;
    key: any;
    getValue(): any;
    setValue(value: any): void;
    renderOptions(options: any): Promise<void>;
}
export class MultiSelectInput extends AbstractInput {
    constructor(obj: any, key: any, { options }: {
        options: any;
    });
    list: HTMLElement;
    renderList(): void;
    #private;
}
export class JsonInput extends AbstractInput {
    constructor(obj: any, key: any);
    #private;
}
export class InputLabel extends HTMLLabelElement {
    /**
     *
     * @param {AbstractInput} inputElement
     * @param {String} display
     * @param {{wrapped?:boolean}}
     */
    constructor(inputElement: AbstractInput, display: string, { wrapped }?: {
        wrapped?: boolean;
    });
    /** @type {AbstractInput} */
    input: AbstractInput;
    set value(arg: any);
    get value(): any;
}
export class LabelledInput extends InputLabel {
    /**
     *
     * @param {*} json
     * @param {String} key
     * @param {typeof AbstractInput| typeof AbstractHTMLInput} type
     * @param {*} options
     */
    constructor(json: any, key: string, type: typeof AbstractInput | typeof AbstractHTMLInput, options?: any);
}
import { BasicElement } from "../BasicElement.js";
