export class Panel extends BasicElement {
    /**
     *
     * @param {String|Element|Element[]} content
     * @param {{title?: String, clazz?: String, buttons?: String, header?: boolean, footer?: boolean}} param1
     */
    constructor(content?: string | Element | Element[], { title, clazz, buttons, header, footer }?: {
        title?: string;
        clazz?: string;
        buttons?: string;
        header?: boolean;
        footer?: boolean;
    });
    get content(): HTMLElement;
    header(...elements: any[]): void;
    footer(...elements: any[]): void;
    #private;
}
import { BasicElement } from "../BasicElement";
