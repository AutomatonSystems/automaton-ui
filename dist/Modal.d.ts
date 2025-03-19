import { Panel, PanelOptions } from "./layout/Panel";
import { Splash } from "./Splash";
import { Appendable } from "./utils.js";
export type ModalOptions = PanelOptions & {
    dismissable?: boolean;
};
export declare class Modal extends Splash {
    constructor(content?: Appendable, options?: ModalOptions);
    get panel(): Panel;
    close(): this;
}
