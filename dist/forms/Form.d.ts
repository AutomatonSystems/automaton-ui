/****** FORM COMPONENTS ******/
export class Form extends BasicElement {
    static STYLE: {
        ROW: {
            parent: string;
            wrap: string;
            label: string;
            value: string;
        };
        INLINE: {
            parent: any;
            wrap: string;
            label: string;
            value: string;
        };
    };
    static TRUE_STRINGS: Set<string>;
    constructor(template: any);
    template: any;
    changeListeners: any[];
    onChange(): Promise<void>;
    formStyle: {
        parent: string;
        wrap: string;
        label: string;
        value: string;
    };
    configuration: {
        formatting: {
            strings: {
                trim: boolean;
            };
        };
    };
    value: {};
    build(json: any): Promise<Form>;
    json(includeHidden?: boolean): {};
    _readValue(element: any, includeHidden?: boolean): {};
    jsonToHtml(templates: any, json: any, jsonKey?: string, options?: {
        style: {
            parent: string;
            wrap: string;
            label: string;
            value: string;
        };
    }): Promise<HTMLElement[]>;
    _readJsonWithKey(json: any, key: any): any;
    oneItem(template: any, itemValue: any, jsonKey: any, { style }?: {
        style?: {
            parent: string;
            wrap: string;
            label: string;
            value: string;
        };
    }): Promise<HTMLElement>;
    #private;
}
import { BasicElement } from "../BasicElement.js";
