import "./Toggle.css";

import { BasicElement } from "../BasicElement";

export class Toggle extends BasicElement {
	constructor(v, changeCallback) {
		super(`<input type="checkbox"/><div><span></span></div>`);
		this.value = v ?? (this.attributes.getNamedItem("value")?.value == "true");

		if(changeCallback){
			this.querySelector('input').addEventListener('change', ()=>{
				changeCallback(this.value);
			});
		}
	}

	get value() {
		return this.querySelector('input').checked;
	}

	set value(b) {
		this.querySelector('input').checked = b;
	}
}
customElements.define('ui-toggle', Toggle);
