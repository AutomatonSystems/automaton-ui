import { Draggable } from './Mixins.js';
import {append, sleep} from './utils.js';
import { Appendable } from './utils.js';

export class BasicElement extends Draggable(HTMLElement) {
	self: BasicElement;
	intervals: any[];

	constructor(content?: Appendable, {clazz=''}={}) {
		super();

		this.self = this;

		append(this, content);

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
		append(this, content);
	}

	/**
	 * Starts a interval timer that will stop when this element is no longer on the DOM
	 * 
	 * @param {*} callback 
	 * @param {Number} time in ms
	 * 
	 * @returns {Number} interval id.
	 */
	setInterval(callback: ()=>any, time: number): number{
		let id = setInterval(()=>{
			if(!document.body.contains(this)){
				this.intervals.forEach(i=>clearInterval(i));
			}else{
				callback();
			}
		}, time);
		this.intervals.push(id);
		return <number><unknown> id;
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
}
customElements.define('ui-basic', BasicElement);
