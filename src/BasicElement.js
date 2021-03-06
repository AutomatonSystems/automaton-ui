import * as utils from './utils.js';

export class BasicElement extends HTMLElement {
	constructor(content, {clazz=''}={}) {
		super();

		this.self = this;

		if(content != null){
			if(Array.isArray(content)){
				utils.append(this, content);
			}else if (typeof content == 'string') {
				this.innerHTML = content;
			}else{
				this.append(content);
			}
		}

		if (clazz) {
			this.classList.add(...clazz.split(" "));
		}

		this.remove = this.remove.bind(this);

		this.intervals = [];
	}

	/**
	 * Starts a interval timer that will stop when this element is no longer on the DOM
	 * 
	 * @param {*} callback 
	 * @param {Number} time in ms
	 * 
	 * @returns {Number} interval id.
	 */
	setInterval(callback, time){
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
	css(variable) {
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
	cssNumber(variable) {
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

	setCss(name, value){
		this.style.setProperty(name, value);
	}

	getCss(name){
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

	show(parent = null) {
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

	remove() {
		this.self.parentElement?.removeChild(this.self);
		return this;
	}

    /**
     * Walk up dom tree looking for a closable element
     */
	close() {
		let ele = this.parentElement;
		while (ele['close'] == null) {
			ele = ele.parentElement;
			if(ele == null)
				return this;
		}
		ele['close']();
		return this;
	}

	attach(parent = null) {
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
	querySelector(string){
		return super.querySelector(string);
	}

	/**
	 * 
	 * @param {String} string 
	 * 
	 * @returns {NodeList<HTMLElement>}
	 */
	querySelectorAll(string){
		return super.querySelectorAll(string);
	}

    /**
     *
     * @param  {...Element} elements
     *
     * @returns {HTMLElement[]}
     */
	static castHtmlElements(...elements) {
		return /** @type {HTMLElement[]} */ ([...elements]);
	}


	/****** DROP LOGIC - TODO move to a behaviour class ********/

	#dropTypeSet = new Set();
	droppable = false;

	makeDraggable(type='element', data = null){
		this.draggable = true;

		this.addEventListener('dragstart', (event)=>{
			if(data == null){
				if(this.dataset['drag'] == null){
					let id = "D_"+Math.floor(1_000_000*Math.random()).toString(16);
					// TODO collision detection
					this.dataset['drag'] = id;
				}
				let selector = `[data-drag="${this.dataset['drag']}"]`;
				event.dataTransfer.setData(type, selector);
			}else{
				event.dataTransfer.setData(type, data);
			}
		});
	}

	makeDroppable(){
		this.droppable = true;
		let handler = (event)=>{
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

	onDragOver(type, behaviour){
		type = type.toLowerCase();
		if(!this.droppable)
			this.makeDroppable();
		this.#dropTypeSet.add(type);
		this.addEventListener('dragover', (event)=>{
			let data = event.dataTransfer.getData(type);
			if(data == "")
				return;
			if(data.startsWith('[data-drag')){
				data = document.querySelector(data);
			}
			behaviour(data, event);
		});
	}

	onDrop(type, behaviour){
		type = type.toLowerCase();
		if(!this.droppable)
			this.makeDroppable();
		this.#dropTypeSet.add(type);
		this.addEventListener('drop', (event)=>{
			let data = event.dataTransfer.getData(type);
			if(data == "")
				return;
			if(data.startsWith('[data-drag')){
				data = document.querySelector(data);
			}
			behaviour(data, event);
		});
	}
}
customElements.define('ui-basic', BasicElement);
