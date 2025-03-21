import { BasicElement } from "../BasicElement.js";
import "./Input.css";
type AbstractInputOptions = {
    callback?: Function;
    class?: string | string[];
    size?: number;
    color?: string;
    placeholder?: string;
};
export declare class AbstractInput<T> extends BasicElement {
    obj: any;
    key: any;
    /**
     *
     * @param obj json object/array to keep up to date
     * @param key json key/indes to keep up to date
     * @param options configuration parameters
     */
    constructor(obj: any, key: any, options?: AbstractInputOptions);
    get value(): T;
    set value(value: T);
    label(name: string): InputLabel;
    clear(): void;
}
export declare class AbstractHTMLInput extends HTMLInputElement {
    obj: any;
    key: any;
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
    clear(): void;
}
export type StringInputOptions = AbstractInputOptions & {
    options?: (() => Promise<SelectInputOption<string>[]>) | SelectInputOption<string>[];
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
type SliderInputOptions = AbstractInputOptions & {
    min?: number;
    max?: number;
    step?: number;
    displayFunc?: (value: number) => string;
};
export declare class SliderInput extends AbstractInput<number> {
    input: HTMLInputElement;
    constructor(obj: any, key: any, options: SliderInputOptions);
    update(): void;
}
type SelectInputOptions<T> = AbstractInputOptions & {
    options: (() => Promise<SelectInputOption<T>[]>) | SelectInputOption<T>[];
};
type SelectInputOption<T> = {
    value: T;
    display: any;
} | T;
export declare class SelectInput<T> extends HTMLSelectElement {
    _value: any;
    obj: any;
    key: any;
    constructor(obj: any, key: any, options?: SelectInputOptions<T>);
    getValue(): any;
    setValue(value: any): void;
    renderOptions(optionsArg: (() => Promise<SelectInputOption<T>[]>) | SelectInputOption<T>[]): Promise<void>;
    /**
     *
     * @param {String} name
     *
     * @returns {InputLabel}
     */
    label(name: string): InputLabel;
}
type MultiSelectInputOptions = {
    options: any;
    callback?: Function;
};
export declare class MultiSelectInput extends AbstractInput<string[]> {
    options: MultiSelectInputOptions;
    list: HTMLElement;
    constructor(obj: any, key: any, options: MultiSelectInputOptions);
    renderList(): void;
}
type MultiStringInputOptions = {
    clearButton?: boolean;
    callback?: Function;
};
export declare class MultiStringInput extends AbstractInput<string[]> {
    options: MultiStringInputOptions;
    list: HTMLElement;
    constructor(obj: any, key: any, options: MultiStringInputOptions);
    renderList(): void;
}
export declare class JsonInput extends AbstractInput<string> {
    constructor(obj: any, key: any);
}
export declare class TextInput extends AbstractInput<string> {
    constructor(obj: any, key: any);
}
type ToggleInputOptions = {
    allowUnset?: boolean;
};
export declare class ToggleInput extends AbstractInput<boolean> {
    options: ToggleInputOptions;
    input: HTMLInputElement;
    unset: boolean;
    constructor(obj: any, key: any, options?: ToggleInputOptions);
    get value(): boolean;
    set value(value: boolean);
    update(): void;
}
export declare class InputLabel extends HTMLLabelElement {
    input: AbstractInput<any>;
    constructor(inputElement: AbstractInput<any>, display: string, { wrapped, clearable }?: {
        wrapped?: boolean;
        clearable?: boolean;
    });
    get value(): any;
    set value(v: any);
}
type LabelledInputOptions = AbstractInputOptions & {
    name?: string;
};
export declare class LabelledInput extends InputLabel {
    constructor(json: any, key: string, type: typeof AbstractInput | typeof AbstractHTMLInput, options?: LabelledInputOptions);
}
export {};
