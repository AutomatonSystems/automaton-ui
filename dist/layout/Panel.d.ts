import "./Panel.css";
import { BasicElement } from "../BasicElement";
import { Appendable } from "../utils.js";
export type PanelOptions = {
    title?: string;
    clazz?: string | string[];
    buttons?: string;
    header?: boolean | Appendable;
    footer?: boolean | Appendable;
};
export declare class Panel extends BasicElement {
    constructor(content?: Appendable, options?: PanelOptions);
    get content(): HTMLElement;
    append(...elements: Appendable[]): void;
    header(...elements: Appendable[]): void;
    footer(...elements: Appendable[]): void;
}
