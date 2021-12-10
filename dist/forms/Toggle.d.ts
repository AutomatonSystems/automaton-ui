import "./Toggle.css";
import { BasicElement } from "../BasicElement";
export declare class Toggle extends BasicElement {
    constructor(v: boolean, changeCallback: (value: boolean) => {});
    get value(): boolean;
    set value(b: boolean);
}
