import { Grid } from "../layout/Grid.js";
import { AbstractHTMLInput, AbstractInput } from "./Input.js";
export declare type Template = Record<string, TemplateParam | TemplateInterface>;
export declare type Form2Input = typeof AbstractInput | typeof AbstractHTMLInput;
export declare type TemplateParam = Form2Input | [Form2Input, {}];
export interface TemplateInterface extends Template {
}
export declare type Form2Options = {};
export declare class Form2 extends Grid {
    json: any;
    constructor(template: Template, json: any, options: Form2Options);
    build(template: Template, json: any): void;
    get value(): any;
}
