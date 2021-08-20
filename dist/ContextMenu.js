var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ContextMenu_attachments;
import "./ContextMenu.css";
import { htmlToElement } from "./utils.js";
import { BasicElement } from "./BasicElement.js";
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
    constructor(element = null) {
        super('<section></section>');
        this.items = [];
        //
        _ContextMenu_attachments.set(this, new WeakMap());
        this.hide = this.hide.bind(this);
        this.hide();
        for (let event of ["click", "contextmenu"]) {
            this.addEventListener(event, this.hide);
            this.firstElementChild.addEventListener(event, (event) => { event.stopPropagation(); });
        }
        if (element) {
            this.for(element);
        }
    }
    /**
     * Add the context menu to show on the provided element context events
     *
     * @param {HTMLElement} element
     */
    for(element) {
        let listener = (event) => {
            // prevent the default contextmenu
            event.preventDefault();
            this.renderMenu(element, event.pageX, event.pageY);
            // setup the hide behaviour
        };
        element.addEventListener("contextmenu", listener);
        element.setAttribute("context-menu", '');
        __classPrivateFieldGet(this, _ContextMenu_attachments, "f").set(element, listener);
        return this;
    }
    renderMenu(element, x, y) {
        this.target = element;
        // work out where to place the menu
        let w = window.innerWidth;
        let h = window.innerHeight;
        let right = x < w * 0.75;
        let down = y < h * 0.5;
        // show the menu
        this.style.left = right ? (x + "px") : null;
        this.style.right = right ? null : ((w - x) + "px");
        this.style.top = down ? (y + "px") : null;
        this.style.bottom = down ? null : ((h - y) + "px");
        let hasItem = false;
        for (let item of this.items) {
            item.element.hidden = item.hide && item.hide(element);
            hasItem = hasItem || !item.element.hidden;
        }
        if (hasItem)
            this.show();
    }
    detach(element) {
        let listener = __classPrivateFieldGet(this, _ContextMenu_attachments, "f").get(element);
        if (listener) {
            element.removeAttribute("context-menu", '');
            element.removeEventListener("contextmenu", listener);
        }
    }
    /**
     * Add a new item to the context menu
     *
     * @param {String} text
     * @param {Function} action
     * @param {Function} hide
     */
    addItem(text, action, hide = false) {
        let item = htmlToElement(`<div>${text}</div>`);
        this.items.push({
            element: item,
            hide: hide
        });
        item.addEventListener('click', () => { action(this.target); this.hide(); });
        this.firstElementChild.appendChild(item);
        return this;
    }
    /**
     * Add a line break to the context menu
     */
    addBreak() {
        this.firstElementChild.appendChild(htmlToElement(`<hr/>`));
        return this;
    }
    clearMenuItems() {
        this.items = [];
        this.firstElementChild.innerHTML = "";
    }
}
_ContextMenu_attachments = new WeakMap();
customElements.define('ui-context', ContextMenu);
//# sourceMappingURL=ContextMenu.js.map