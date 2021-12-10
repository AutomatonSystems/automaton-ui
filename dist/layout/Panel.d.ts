import "./Panel.css";
import { BasicElement } from "../BasicElement";
import { Appendable } from "../utils.js";
export declare type PanelOptions = {
    title?: string;
    clazz?: string | string[];
    buttons?: string;
    header?: boolean;
    footer?: boolean;
};
export declare class Panel extends BasicElement {
    /**
     *
     * @param {String|Element|Element[]} content
     * @param {{title?: String, clazz?: String, buttons?: String, header?: boolean, footer?: boolean}} param1
     */
    constructor(content?: Appendable, options?: PanelOptions);
    get content(): HTMLElement;
    append(...elements: Appendable[]): void;
    header(...elements: Appendable[]): void;
    footer(...elements: Appendable[]): void;
}
