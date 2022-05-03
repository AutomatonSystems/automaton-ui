import { BasicElement } from "../BasicElement.js";
import "./Input.css";
declare type AbstractInputOptions = {
    callback?: Function;
    class?: string | string[];
    size?: number;
    color?: string;
    placeholder?: string;
};
export declare class AbstractInput extends BasicElement {
    obj: any;
    key: any;
    /**
     *
     * @param obj json object/array to keep up to date
     * @param key json key/indes to keep up to date
     * @param options configuration parameters
     */
    constructor(obj: any, key: any, options?: AbstractInputOptions);
    get value(): any;
    set value(value: any);
    /**
     *
     * @param {String} name
     *
     * @returns {InputLabel}
     */
    label(name: string): InputLabel;
}
export declare class AbstractHTMLInput extends HTMLInputElement {
    /**
     *
     * @param obj json object/array to keep up to date
     * @param key json key/indes to keep up to date
     * @param options configuration parameters
     */
    constructor(obj: any, key: any, options?: AbstractInputOptions);
    /**
     *
     * @param {String} name
     *
     * @returns {InputLabel}
     */
    label(name: string): InputLabel;
}
export declare type StringInputOptions = AbstractInputOptions & {
    options?: (() => Promise<SelectInputOption[]>) | SelectInputOption[];
};
export declare class StringInput extends AbstractHTMLInput {
    /**
     *
     * @param obj json object/array to keep up to date
     * @param key json key/indes to keep up to date
     * @param options configuration parameters
     */
    constructor(obj: any, key: any, options: StringInputOptions);
    buildOptions(parsedOptions: any[]): void;
}
/**
 * A number input that keeps a json object
 * up to date with it's value
 *
 */
export declare class NumberInput extends AbstractHTMLInput {
    /**
     *
     * @param {*} obj json object/array to keep up to date
     * @param {*} key json key/indes to keep up to date
     * @param {{callback?: Function, size?:Number, color?:String, placeholder?:string}} params configuration parameters
     */
    constructor(obj: any, key: any, options: AbstractInputOptions);
}
declare type SliderInputOptions = AbstractInputOptions & {
    min?: number;
    max?: number;
    step?: number;
    displayFunc?: (value: number) => string;
};
export declare class SliderInput extends AbstractInput {
    constructor(obj: any, key: any, options: SliderInputOptions);
}
declare type SelectInputOptions = AbstractInputOptions & {
    options: (() => Promise<SelectInputOption[]>) | SelectInputOption[];
};
declare type SelectInputOption = {
    value: any;
    display: any;
} | string;
export declare class SelectInput extends HTMLSelectElement {
    _value: any;
    obj: any;
    key: any;
    constructor(obj: any, key: any, options?: SelectInputOptions);
    getValue(): any;
    setValue(value: any): void;
    renderOptions(optionsArg: (() => Promise<SelectInputOption[]>) | SelectInputOption[]): Promise<void>;
}
declare type MultiSelectInputOptions = {
    options: any;
};
export declare class MultiSelectInput extends AbstractInput {
    list: HTMLElement;
    constructor(obj: any, key: any, options: MultiSelectInputOptions);
    renderList(): void;
}
export declare class JsonInput extends AbstractInput {
    constructor(obj: any, key: any);
}
export declare class InputLabel extends HTMLLabelElement {
    input: AbstractInput;
    constructor(inputElement: AbstractInput, display: string, { wrapped }?: {
        wrapped?: boolean;
    });
    get value(): any;
    set value(v: any);
}
declare type LabelledInputOptions = AbstractInputOptions & {
    name?: string;
};
export declare class LabelledInput extends InputLabel {
    constructor(json: any, key: string, type: typeof AbstractInput | typeof AbstractHTMLInput, options?: LabelledInputOptions);
}
export {};
