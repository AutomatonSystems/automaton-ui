import "./Tabs.css";
import { BasicElement, BasicElementOpts } from "../BasicElement";
import { Appendable } from "../utils.js";
export type TabsOptions = {} & BasicElementOpts;
type Tab = {
    open: () => Tab;
};
export declare class Tabs extends BasicElement {
    activeTab: Tab;
    constructor(options?: TabsOptions);
    tab(title: Appendable, content: Appendable | (() => Appendable)): Tab;
}
export {};
