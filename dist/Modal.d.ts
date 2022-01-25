import { Panel } from "./layout/Panel";
import { Splash } from "./Splash";
import { Appendable } from "./utils.js";
export declare class Modal extends Splash {
    constructor(content?: Appendable, { title, clazz, buttons, dismissable, header, footer }?: {
        title?: string;
        clazz?: string;
        buttons?: string;
        dismissable?: boolean;
        header?: boolean;
        footer?: boolean;
    });
    get panel(): Panel;
    close(): this;
}
