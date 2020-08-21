import { BasicElement } from "../BasicElement.js";

export class Badge extends BasicElement {
	constructor(content, { icon = '' } = {}) {
		super(content);

		icon = icon || this.attributes.getNamedItem("icon")?.value;
		if (icon) {
			let i = document.createElement('i');
			i.classList.add("fa", icon.trim());
			this.prepend(i);
		}
	}
}
customElements.define('ui-badge', Badge);
