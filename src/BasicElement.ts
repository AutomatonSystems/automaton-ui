import * as utils from './utils.js';
import { Appendable } from './utils.js';

export class BasicElement extends HTMLElement {
	self: BasicElement;
	intervals: any[];

	constructor(content?: Appendable, {clazz=''}={}) {
		super();

		this.self = this;

		utils.append(this, content);

		if (clazz) {
			this.classList.add(...clazz.split(" "));
		}

		// ???
		this.remove = this.remove.bind(this);

		this.intervals = [];
	}

	/**
	 * 
	 * Replace the current content of this element with the provided content
	 * 
	 * @param content 
	 */
	setContent(...content: Appendable[]){
		this.innerHTML = "";
		utils.append(this, content);
	}

	/**
	 * Starts a interval timer that will stop when this element is no longer on the DOM
	 * 
	 * @param {*} callback 
	 * @param {Number} time in ms
	 * 
	 * @returns {Number} interval id.
	 */
	setInterval(callback: ()=>{}, time: number){
		let id = setInterval(()=>{
			if(!document.body.contains(this)){
				this.intervals.forEach(i=>clearInterval(i));
			}else{
				callback();
			}
		}, time);
		this.intervals.push(id);
		return id;
	}

    /**
     *
     * @param {String} variable
     *
     * @returns {String}
     */
	css(variable: string) {
		let value = getComputedStyle(this).getPropertyValue(variable);
		if(!value)
			value = this.style.getPropertyValue(variable);
		// everything else
		return value;
	}

    /**
     *
     * @param {String} variable
     *
     * @returns {Number}
     */
	cssNumber(variable: string) {
		let value = this.css(variable);

		let number = parseFloat(value);
		// timings
		if (value.endsWith('ms')) {
			return number;
		}
		else if (value.endsWith('s')) {
			return number * 1000;
		}
		// everything else
		return number;
	}

	setCss(name: string, value: string|number){
		this.style.setProperty(name, ''+value);
	}

	getCss(name: string){
		this.style.getPropertyValue(name);
	}

	get visible() {
		return this.self.hidden == false;
	}

    /**
     * @param {Boolean} boolean
     */
	set visible(boolean) {
		if (boolean) {
			this.self.removeAttribute("hidden");
		}
		else {
			this.self.setAttribute("hidden", '');
		}
	}

	show(parent?:HTMLElement) {
		// attach to dom if I haven't already
		this.self.attach(parent);
		// and show
		this.self.visible = true;
		return this;
	}

	hide() {
		this.self.visible = false;
		return this;
	}

	override remove() {
		this.self.parentElement?.removeChild(this.self);
		return this;
	}

	/**
	 * Walk up dom tree looking for a closable element
	 */
	close() {
		let ele = <BasicElement|HTMLElement> this.parentElement;
		while (!('close' in ele)) {
			ele = ele.parentElement;
			if(ele == null)
				return this;
		}
		// @ts-ignore
		ele['close']();
		return this;
	}

	attach(parent?: HTMLElement) {
		if (!this.self.parentElement) {
			if (parent == null)
				parent = document.body;
			parent.appendChild(this.self);
		}
		return this;
	}

	/**
	 * 
	 * @param {String} string 
	 * 
	 * @returns {HTMLElement}
	 */
	override querySelector(string: string): HTMLElement {
		// ???
		return super.querySelector(string);
	}

	/**
	 * 
	 * @param {String} string 
	 * 	
	 * @returns {NodeList<HTMLElement>}
	 */
	 override querySelectorAll(string: string): NodeListOf<HTMLElement>{
		// ???
		return super.querySelectorAll(string);
	}

	/****** DROP LOGIC - TODO move to a behaviour class ********/

	#dropTypeSet = new Set<string>();
	droppable = false;

	dragdata: Record<string, any> = {};

	/**
	 * 
	 * Make the element draggable
	 * 
	 * @param type a category of thing that is being dragged - eg a 'item', used to filter dropzones
	 * @param data 
	 */
	makeDraggable(type: string ='element', data: any = null){
		this.draggable = true;

		// by default the data to send is just the element itself
		type = type.toLowerCase();
		if(data == null)
			data = this;
		this.dragdata[type] = data;

		// add the event listener
		this.addEventListener('dragstart', (event)=>{
			// setup a unique drag ID
			if(this.dataset['drag'] == null){
				let id = "D_"+Math.floor(1_000_000*Math.random()).toString(16);
				// TODO collision detection
				this.dataset['drag'] = id;
			}

			// pass the drag ID as info
			let selector = `[data-drag="${this.dataset['drag']}"]`;
			event.dataTransfer.setData(type, selector);
		});
	}

	#makeDroppable(){
		this.droppable = true;
		let handler = (event: DragEvent)=>{
			let types = event.dataTransfer.types;
			for(let type of this.#dropTypeSet){
				if(types.includes(type)){
					event.preventDefault();
					return;
				}
			}
		}
		this.addEventListener('dragenter', handler);
		this.addEventListener('dragover', handler);
	}

	onDragOver(type: string, behaviour: (data: any, event: DragEvent, element: BasicElement)=>void){
		type = type.toLowerCase();
		if(!this.droppable)
			this.#makeDroppable();
		this.#dropTypeSet.add(type);
		this.addEventListener('dragover', (event)=>{
			let datakey = event.dataTransfer.getData(type);
			if(datakey == "")
				return;
			if(datakey.startsWith('[data-drag')){
				let draggedElement = <BasicElement>document.querySelector(datakey);
				let data = draggedElement.dragdata[type];
				behaviour(data, event, draggedElement);
			}else{
				// this shouldn't occur
			}
		});
	}

	onDrop(type: string, behaviour: (data: any, event: DragEvent, element: BasicElement)=>void){
		type = type.toLowerCase();
		if(!this.droppable)
			this.#makeDroppable();
		this.#dropTypeSet.add(type);
		this.addEventListener('drop', (event)=>{
			let datakey = event.dataTransfer.getData(type);
			if(datakey == "")
				return;
			if(datakey.startsWith('[data-drag')){
				let draggedElement = <BasicElement>document.querySelector(datakey);
				let data = draggedElement.dragdata[type];
				behaviour(data, event, draggedElement);
			}else{
				// this shouldn't occur
			}
		});
	}
}
customElements.define('ui-basic', BasicElement);
