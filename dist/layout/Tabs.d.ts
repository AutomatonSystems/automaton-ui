import "./Tabs.css";
import { BasicElement, BasicElementOpts } from "../BasicElement";
import { Appendable } from "../utils.js";
export declare type TabsOptions = {} & BasicElementOpts;
declare type Tab = {
    open: () => Tab;
};
export declare class Tabs extends BasicElement {
    activeTab: Tab;
    constructor(options?: TabsOptions);
    tab(title: Appendable, content: Appendable | (() => Appendable)): Tab;
}
export {};
