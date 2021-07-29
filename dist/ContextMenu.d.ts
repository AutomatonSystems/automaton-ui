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
export class ContextMenu extends BasicElement {
    constructor(element?: any);
    target: any;
    items: any[];
    /**
     * Add the context menu to show on the provided element context events
     *
     * @param {HTMLElement} element
     */
    for(element: HTMLElement): ContextMenu;
    renderMenu(element: any, x: any, y: any): void;
    detach(element: any): void;
    /**
     * Add a new item to the context menu
     *
     * @param {String} text
     * @param {Function} action
     * @param {Function} hide
     */
    addItem(text: string, action: Function, hide?: Function): ContextMenu;
    /**
     * Add a line break to the context menu
     */
    addBreak(): ContextMenu;
    clearMenuItems(): void;
    #private;
}
import { BasicElement } from "./BasicElement.js";
