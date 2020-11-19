import "./Badge.css";

import { BasicElement } from "../BasicElement.js";

export class Badge extends BasicElement {
	constructor(content, { icon = '' } = {}) {
		super(content);

		icon = icon || this.attributes.getNamedItem("icon")?.value;
		if (icon) {
			let i = document.createElement('i');
			let classes = icon.trim().split(" ");
			// include the default font-awesome class if one wasn't provided
			if(!classes.includes('fa') && !classes.includes('fab') && !classes.includes('fas'))
				i.classList.add('fa');
			i.classList.add(...classes);
			this.prepend(i);
		}
	}
}
customElements.define('ui-badge', Badge);
