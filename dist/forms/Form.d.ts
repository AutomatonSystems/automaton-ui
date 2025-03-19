import "./Form.css";
import { BasicElement } from "../BasicElement.js";
import "./Toggle.js";
/****** FORM COMPONENTS ******/
declare type FormInputHideFunction<T> = (value: T, element: HTMLElement) => boolean;
declare type FormInputOptionsFunction<T> = (value: T) => any[] | Promise<any[]>;
declare type FormInputAfterRenderFunction<T> = (element: HTMLElement, form: Form<T>) => void;
declare type FormInputTypeFunction<T> = (value: any, key: string, parent: HTMLElement) => HTMLElement;
interface FormTemplateJSON<T> {
    key?: string;
    name?: string;
    hint?: string;
    placeholder?: string;
    default?: string | boolean | number;
    disabled?: boolean;
    type?: string | FormInputTypeFunction<T>;
    format?: string;
    hidden?: FormInputHideFunction<T>;
    redraw?: string | string[];
    options?: any[] | FormInputOptionsFunction<T>;
    style?: "INLINE" | "ROW";
    children?: FormTemplate<T> | FormTemplate<T>[];
    afterRender?: FormInputAfterRenderFunction<T>;
}
interface FormArrayTemplate<T> extends FormTemplateJSON<T> {
    type: "array";
    config?: FormArrayConfig;
}
interface FormArrayConfig {
    sortable: boolean;
}
export declare type FormTemplate<T> = FormArrayTemplate<T> | FormTemplateJSON<T> | string;
interface FormStyle {
    parent: string;
    wrap: string;
    label: string;
    value: string;
}
export declare class Form<T> extends BasicElement {
    static STYLE: Record<string, FormStyle>;
    static TRUE_STRINGS: Set<string>;
    template: FormTemplate<T> | FormTemplate<T>[];
    changeListeners: ((t: T) => Promise<void>)[];
    formStyle: FormStyle;
    configuration: {
        formatting: {
            strings: {
                trim: boolean;
            };
        };
    };
    value: T;
    constructor(template: FormTemplate<T> | FormTemplate<T>[]);
    build(json: any): Promise<this>;
    onChange(): Promise<void>;
    json(includeHidden?: boolean): T;
    _readValue(element: HTMLElement, includeHidden?: boolean): any;
    jsonToHtml(templates: FormTemplate<T> | FormTemplate<T>[], json: any, jsonKey?: string, options?: {
        style: FormStyle;
    }): Promise<HTMLElement[]>;
    _readJsonWithKey(json: any, key: string): any;
    oneItem(template: FormTemplateJSON<T>, itemValue: any, jsonKey: string, { style }?: {
        style?: FormStyle;
    }): Promise<HTMLElement>;
}
export {};
