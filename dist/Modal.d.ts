export class Modal extends Splash {
    constructor(content: any, { title, clazz, buttons, dismissable, header, footer }?: {
        title?: string;
        clazz?: string;
        buttons?: string;
        dismissable?: boolean;
        header?: boolean;
        footer?: boolean;
    });
    /**
     * @type {Panel}
     */
    get panel(): Panel;
    #private;
}
import { Splash } from "./Splash";
import { Panel } from "./layout/Panel";
