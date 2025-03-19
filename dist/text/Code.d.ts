import './Code.css';
import { BasicElement } from "../BasicElement.js";
export declare class Code extends BasicElement {
    constructor(content?: string);
    preprocess(content: string): string;
    setContent(content: string): void;
}
