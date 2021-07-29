/**
 * @typedef {typeof AbstractInput|[typeof AbstractInput, {}]} TemplateParam
 */
/**
 * @typedef {Object.<string, (TemplateParam|Object.<string, TemplateParam>)>} Template
 */
export class Form2 extends Grid {
    /**
     *
     * @param {Template} template
     * @param {*} json
     * @param {*} options
     */
    constructor(template: Template, json: any, options: any);
    json: any;
    build(template: any, json: any): void;
    get value(): any;
    #private;
}
export type TemplateParam = typeof AbstractInput | [typeof AbstractInput, {}];
export type Template = {
    [x: string]: (TemplateParam | {
        [x: string]: TemplateParam;
    });
};
import { Grid } from "../layout/Grid.js";
import { AbstractInput } from "./Input.js";
