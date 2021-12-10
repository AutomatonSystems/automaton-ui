import "./Card.css";
import { BasicElement } from "../BasicElement.js";
import { Appendable } from "../utils.js";
export declare class Card extends BasicElement {
    constructor(content?: Appendable);
    setContent(content?: Appendable): void;
    flip(): Promise<unknown>;
    get flipped(): boolean;
    set flipped(bool: boolean);
}
