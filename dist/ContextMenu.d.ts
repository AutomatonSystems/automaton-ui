import "./ContextMenu.css";
import { BasicElement } from "./BasicElement.js";
declare type ContextItem = {
    element: HTMLElement;
    hide?: (ele: HTMLElement) => boolean;
};
/**
 * Context menu replacement
 *
 * ```
 * new ContextMenu(document.body)
 *      .addItem("Hello", ()=>{alert("hello")})
 *      .addBreak();
 * ```
 *
 * The returned menu can be attached to multiple elements
 * ```
 *    menu.for(extraElement);
 * ```
 *
 */
export declare class ContextMenu extends BasicElement {
    #private;
    target: HTMLElement;
    items: ContextItem[];
    constructor(element?: HTMLElement);
    /**
     * Add the context menu to show on the provided element context events
     *
     * @param {HTMLElement} element
     */
    for(element: HTMLElement): this;
    renderMenu(element: HTMLElement, x: number, y: number): void;
    detach(element: HTMLElement): void;
    /**
     * Add a new item to the context menu
     *
     * @param {String} text
     * @param {Function} action
     * @param {Function} hide
     */
    addItem(text: string, action: (ele: HTMLElement) => void, hide?: (ele: HTMLElement) => boolean): this;
    addSubMenu(text: string, hide?: (ele: HTMLElement) => boolean): {
        addItem: (text: string, action: (ele: HTMLElement) => void) => any;
    };
    /**
     * Add a line break to the context menu
     */
    addBreak(): this;
    clearMenuItems(): void;
}
export {};
