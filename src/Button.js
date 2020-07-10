import "Button.css";

import { BasicElement } from "./BasicElement.js";

export class Button extends BasicElement {

    /**
     *
     * @param {String|HTMLElement} content
     * @param {EventListenerOrEventListenerObject} callback callback when the button is clicked
     * @param {{icon?: String, style?: String, color?: String|boolean}} options
     */
	constructor(content, callback, { icon = '', style = 'button', color = false } = {}) {
		super(content);

		this.addEventListener('click', callback);

		this.classList.add(style);
		if (color)
			this.classList.add(color + "-color");

		icon = icon || this.attributes.getNamedItem("icon")?.value;
		if (icon) {
			let i = document.createElement('i');
			i.classList.add("fa", icon.trim());
			this.prepend(i);
		}
	}

}
customElements.define('ui-button', Button);