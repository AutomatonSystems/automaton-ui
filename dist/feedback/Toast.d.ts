import "./Toast.css";
import { BasicElement } from "../BasicElement";
export declare class Toaster extends BasicElement {
    constructor();
}
export declare class Toast extends BasicElement {
    constructor(message: any[] | any, { level }?: {
        level?: string;
    });
}
