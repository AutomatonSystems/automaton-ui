import "./Panel.css";

import { BasicElement } from "../BasicElement";
import { append, Appendable } from "../utils.js";

export type PanelOptions = {
	title?: string
	clazz?: string | string[]
	buttons?: string
	header?: boolean | Appendable
	footer?: boolean | Appendable
}

export class Panel extends BasicElement {

	constructor(content: Appendable = '', options?: PanelOptions) {
		super();

		this.setAttribute("ui-panel", '');

		if (!this.innerHTML.trim()) {
			this.innerHTML = `
				${(options?.header || options?.title)? `<header>${options?.title ?? ''}</header>` : ''}
				<content></content>
				${(options?.footer || options?.buttons)? `<footer>${options?.buttons ?? ''}</footer>` : ''}
			`;

			append(this.content, content);

			if(options?.header && options.header !== true){
				this.header(options.header);
			}
			if(options?.footer && options.footer !== true){
				this.footer(options.footer);
			}
		}

		if (options?.clazz) {
			if(Array.isArray(options.clazz))
				this.classList.add(...options.clazz);
			else
				this.classList.add(options.clazz);
		}
	}

	get content(): HTMLElement {
		return this.querySelector('content') ?? this;
	}

	override append(...elements: Appendable[]) {
		append(this.content, elements);
	}

	header(...elements: Appendable[]){
		append(this.querySelector('header'), elements);
	}

	footer(...elements: Appendable[]){
		append(this.querySelector('footer'), elements);
	}
}
customElements.define('ui-panel', Panel);