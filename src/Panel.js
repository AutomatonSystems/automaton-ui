import { BasicElement } from "./BasicElement";
import { append } from "./utils.js";

export class Panel extends BasicElement {

    /**
     *
     * @param {String} content
     * @param {{title?: String, clazz?: String, buttons?: String}} param1
     */
	constructor(content = '', { title = '', clazz = '', buttons = '' } = {}) {
		super();
		if (!this.innerHTML.trim()) {
			this.innerHTML = `
				${title ? `<header>${title}</header>` : ''}
				<content></content>
				${buttons ? `<footer>${buttons}</footer>` : ''}
			`;

			append(this.querySelector('content'), content);
		}

		if (clazz) {
			this.classList.add(clazz);
		}
	}

	append(...elements) {
		append(this.querySelector('content'), elements);
	}
}
customElements.define('ui-panel', Panel);