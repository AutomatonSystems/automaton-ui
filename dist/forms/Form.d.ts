import "./Form.css";
import { BasicElement } from "../BasicElement.js";
import "./Toggle.js";
/****** FORM COMPONENTS ******/
interface FormTemplateJSON {
    key?: string;
    name?: string;
    hint?: string;
    placeholder?: string;
    default?: string;
    disabled?: boolean;
    type?: string | Function;
    format?: string;
    hidden?: Function;
    redraw?: string | string[];
    options?: any[] | Function;
    style?: "INLINE" | "ROW";
    children?: FormTemplate | FormTemplate[];
    afterRender?: Function;
}
interface FormArrayTemplate extends FormTemplateJSON {
    type: "array";
    config?: FormArrayConfig;
}
interface FormArrayConfig {
    sortable: boolean;
}
export declare type FormTemplate = FormArrayTemplate | FormTemplateJSON | string;
interface FormStyle {
    parent: string;
    wrap: string;
    label: string;
    value: string;
}
export declare class Form extends BasicElement {
    static STYLE: Record<string, FormStyle>;
    static TRUE_STRINGS: Set<string>;
    template: FormTemplate | FormTemplate[];
    changeListeners: any[];
    formStyle: FormStyle;
    configuration: {
        formatting: {
            strings: {
                trim: boolean;
            };
        };
    };
    value: any;
    constructor(template: FormTemplate | FormTemplate[]);
    build(json: any): Promise<this>;
    onChange(): Promise<void>;
    json(includeHidden?: boolean): any;
    _readValue(element: HTMLElement, includeHidden?: boolean): any;
    jsonToHtml(templates: FormTemplate | FormTemplate[], json: any, jsonKey?: string, options?: {
        style: FormStyle;
    }): Promise<HTMLElement[]>;
    _readJsonWithKey(json: any, key: string): any;
    oneItem(template: FormTemplateJSON, itemValue: any, jsonKey: string, { style }?: {
        style?: FormStyle;
    }): Promise<HTMLElement>;
}
export {};
