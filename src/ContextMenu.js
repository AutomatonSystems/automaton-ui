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

	// when active the element this is active for
	target;

	items = [];

	//
	#attachments = new WeakMap();

	constructor(element = null){
		super('<section></section>');

		this.hide = this.hide.bind(this);

		this.hide();

		for(let event of ["click", "contextmenu"]){
			this.addEventListener(event, this.hide);
			this.firstElementChild.addEventListener(event, (event)=>{event.stopPropagation()});
		}

		if(element){
			this.for(element);
		}
	}

	/**
	 * Add the context menu to show on the provided element context events
	 * 
	 * @param {HTMLElement} element 
	 */
	for(element){
		let listener = (event)=>{
			this.target = element;
			// prevent the default contextmenu
			event.preventDefault();
			
			// work out where to place the menu
			let w = window.innerWidth;
			let h = window.innerHeight;

			let right = event.pageX < w*0.75;
			let down = event.pageY < h*0.5;

			// show the menu
			this.style.left = right?(event.pageX + "px"):null;
			this.style.right = right?null:((w-event.pageX) + "px");
			this.style.top = down?(event.pageY + "px"):null;
			this.style.bottom = down?null:((h-event.pageY) + "px");

			for(let item of this.items){
				item.element.hidden = item.hide && item.hide(element);
			}

			this.show();
			// setup the hide behaviour
		};
		element.addEventListener("contextmenu", listener);
		element.setAttribute("context-menu", '');
		this.#attachments.set(element, listener);
		return this;
	}

	detach(element){
		let listener = this.#attachments.get(element);
		if(listener){
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
	addItem(text, action, hide = false){
		let item = htmlToElement(`<div>${text}</div>`);
		this.items.push({
			element: item,
			hide: hide
		});
		item.addEventListener('click', ()=>{action(this.target); this.hide()});
		this.firstElementChild.appendChild(item);
		return this;
	}

	/**
	 * Add a line break to the context menu
	 */
	addBreak(){
		this.firstElementChild.appendChild(htmlToElement(`<hr/>`));
		return this;
	}
}
customElements.define('ui-context', ContextMenu);