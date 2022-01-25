import "./Button.css";

import { BasicElement } from "../BasicElement.js";
import { Appendable } from "../utils.js";

export type ButtonOptions = {
	icon?: string
	style?: 'button'|'text'|string
	color?: string
}

export class Button extends BasicElement {

    /**
     *
     * @param {String|HTMLElement} content
     * @param {EventListenerOrEventListenerObject|String} callback callback when the button is clicked
     * @param {{icon?: String, style?: String, color?: String|boolean}} options
     */
	constructor(content?: Appendable, callback?: EventListenerOrEventListenerObject|String, options:ButtonOptions = {}) {
		super(content);

		this.setAttribute("ui-button", '');

		if(typeof callback == "string"){
			// create link like behaviour (left click open; middle/ctrl+click new tab)
			this.addEventListener('click', (e)=>{
				// control key
				if(e.ctrlKey){
					window.open(callback);
				}else{
					// otherwise
					location.href = callback;
				}
			});
			this.addEventListener('auxclick', (e)=>{
				// middle click
				if(e.button == 1){
					window.open(callback);
				}
			});
			this.addEventListener('mousedown',(e)=>{
				if(e.button == 1){
					// on windows middlemouse down bring up the scroll widget; disable that
					e.preventDefault();
				}
			})
		}else{
			// fire the provided event
			if(callback)
				this.addEventListener('click', <any>callback);
		}

		if(options?.style)
			this.classList.add(options?.style);
		if(options?.color)
			this.classList.add(options?.color);

		let icon = options?.icon ?? this.attributes.getNamedItem("icon")?.value;
		if (icon) {
			let i = document.createElement('i');
			let classes = icon.trim().split(" ");
			// include the default font-awesome class if one wasn't provided
			if(!classes.includes('fa') && !classes.includes('fab') && !classes.includes('fas'))
				i.classList.add('fa');
			i.classList.add(...classes);
			this.prepend(i);

			if(content=='')
				i.classList.add('icon-only');
		}
	}

	// TODO reinstate setCallback
}
customElements.define('ui-button', Button);