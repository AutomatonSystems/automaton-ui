import "./ContextMenu.css";

import { htmlToElement } from "./utils.js";
import { BasicElement } from "./BasicElement.js";

type ContextItem = {
	element: HTMLElement
	hide?: (ele:HTMLElement)=>boolean
}

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
	target: HTMLElement;

	items: ContextItem[] = [];

	//
	#attachments = new WeakMap();

	constructor(element: HTMLElement = null){
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
	for(element: HTMLElement){
		let listener = (event: any)=>{
			
			// prevent the default contextmenu
			event.preventDefault();

			this.renderMenu(element, event.pageX, event.pageY)
			// setup the hide behaviour
		};
		element.addEventListener("contextmenu", listener);
		element.setAttribute("context-menu", '');
		this.#attachments.set(element, listener);
		return this;
	}

	renderMenu(element: HTMLElement, x: number, y:number){
		this.target = element;
			
		// work out where to place the menu
		let w = window.innerWidth;
		let h = window.innerHeight;

		let right = x < w*0.75;
		let down = y < h*0.5;

		// show the menu
		this.style.left = right?(x + "px"):null;
		this.style.right = right?null:((w-x) + "px");
		this.style.top = down?(y + "px"):null;
		this.style.bottom = down?null:((h-y) + "px");

		let hasItem = false;
		for(let item of this.items){
			item.element.hidden = item.hide && item.hide(element);
			hasItem = hasItem || !item.element.hidden;
		}

		if(hasItem)
			this.show();
	}

	detach(element: HTMLElement){
		let listener = this.#attachments.get(element);
		if(listener){
			element.removeAttribute("context-menu");
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
	addItem(text: string, action: (ele:HTMLElement)=>void, hide?: (ele:HTMLElement)=>boolean){
		let item = <HTMLElement>htmlToElement(`<div class="menu-item">${text}</div>`);
		this.items.push({
			element: item,
			hide: hide
		});
		item.addEventListener('click', ()=>{action(this.target); this.hide()});
		this.firstElementChild.appendChild(item);
		return this;
	}

	addSubMenu(text: string, hide?: (ele:HTMLElement)=>boolean){
		let item = <HTMLElement>htmlToElement(`<div class="menu-item has-sub-menu">${text}<div class="sub-menu"></div></div>`);
		let subMenuEle = item.querySelector('.sub-menu');
		this.items.push({
			element: item,
			hide: hide
		});
		item.addEventListener('click', ()=>{item.classList.toggle("show")});
		this.firstElementChild.appendChild(item);		
		const subMenu = {
			addItem: (text: string, action: (ele:HTMLElement)=>void)=>{
				let item = <HTMLElement>htmlToElement(`<div class="menu-item">${text}</div>`);
				item.addEventListener('click', (event)=>{event.stopPropagation(); action(this.target); this.hide(); item.classList.toggle("show", false)});
				subMenuEle.append(item);
				return subMenu;
			}
		};
		return subMenu;
	}

	/**
	 * Add a line break to the context menu
	 */
	addBreak(){
		this.firstElementChild.appendChild(htmlToElement(`<hr/>`));
		return this;
	}

	clearMenuItems(){
		this.items = [];
		this.firstElementChild.innerHTML = "";
	}

}
customElements.define('ui-context', ContextMenu);