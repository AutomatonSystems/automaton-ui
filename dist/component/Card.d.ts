export class Card extends BasicElement {
    constructor(content: any);
    setContent(content: any): void;
    flip(): Promise<any>;
    set flipped(arg: boolean);
    get flipped(): boolean;
    #private;
}
import { BasicElement } from "../BasicElement.js";
