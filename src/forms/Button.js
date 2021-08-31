import "./Button.css";

import { BasicElement } from "../BasicElement.js";

export class Button extends BasicElement {

	listeners = [];

    /**
     *
     * @param {String|HTMLElement} content
     * @param {EventListenerOrEventListenerObject|String} callback callback when the button is clicked
     * @param {{icon?: String, style?: String, color?: String|boolean}} options
     */
	constructor(content, callback, { icon = '', style = 'button', color = false } = {}) {
		super(content);

		this.setAttribute("ui-button", '');

		this.setCallback(callback);

		this.classList.add(style);
		if (color)
			this.classList.add(color);

		icon = icon || this.attributes.getNamedItem("icon")?.value;
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

	setCallback(callback){
		// remove old listeners
		for(let l of this.listeners){
			console.log(l);
			this.removeEventListener(l[0], l[1]);
		}
		// create new listeners
		if(typeof callback == "string"){
			// create link like behaviour (left click open; middle/ctrl+click new tab)
			this.listeners.push(['click', (e)=>{
					// control key
					if(e.ctrlKey){
						window.open(callback);
					}else{
						// otherwise
						location.href = callback;
					}
				}],
				['auxclick', (e)=>{
					// middle click
					if(e.button == 1){
						window.open(callback);
					}
				}],
				['mousedown',(e)=>{
					if(e.button == 1){
						// on windows middlemouse down bring up the scroll widget; disable that
						e.preventDefault();
					}
				}]
			);
		}else{
			// fire the provided event
			this.listeners.push(['click', callback]);
		}
		// attach listeners
		for(let l of this.listeners)
			this.addEventListener(l[0], l[1]);
	}
}
customElements.define('ui-button', Button);