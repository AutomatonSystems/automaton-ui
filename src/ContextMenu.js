import "./ContextMenu.css";

import { htmlToElement } from "./utils.js";
import { BasicElement } from "./BasicElement.js";

/**
 * Context menu replacement
 * @example
 * 
 * ```
 * new ContextMenu()
 *      .addItem("Hello", ()=>{alert("hello")})
 *      .for(document.body);
 * ```
 */
export class ContextMenu extends BasicElement {

	#attachments = new WeakMap();

	constructor(){
		super('<section></section>');

		this.hide = this.hide.bind(this);

		this.hide();

		for(let event of ["click", "oncontextmenu"]){
			this.addEventListener(event, this.hide);
			this.firstElementChild.addEventListener(event, (event)=>{event.stopPropagation()});
		}
	}

	/**
	 * Add the context menu to show on the provided element context events
	 * 
	 * @param {HTMLElement} element 
	 */
	for(element){
		let listener = (event)=>{
			// prevent the default contextmenu
			event.preventDefault();
			// show the menu
			this.style.left = event.pageX + "px";
			this.style.top = event.pageY + "px";
			this.show();
			// setup the hide behaviour
		};
		element.addEventListener("contextmenu", listener);
		this.#attachments.set(element, listener);
		return this;
	}

	detach(element){
		let listener = this.#attachments.get(element);
		if(listener){
			element.removeEventListener("contextmenu", listener);
		}
	}

	/**
	 * Add a new item to the context menu
	 * 
	 * @param {String} text 
	 * @param {Function} action 
	 */
	addItem(text, action){
		let item = htmlToElement(`<div>${text}</div>`);
		item.addEventListener('click', ()=>{action(); this.hide()});
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