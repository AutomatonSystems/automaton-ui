import "./Badge.css";
import { BasicElement } from "../BasicElement.js";
import { Appendable } from "../utils.js";
export declare class Badge extends BasicElement {
    constructor(content?: Appendable, { icon, clazz }?: {
        icon?: string;
        clazz?: string;
    });
}
