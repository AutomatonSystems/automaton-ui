import "./Toggle.css";

import { BasicElement } from "../BasicElement";

export class Toggle extends BasicElement {

	changeCallback = null;
	constructor(v, changeCallback) {
		super(`<input type="checkbox"/><div><span></span></div>`);
		this.value = v ?? (this.attributes.getNamedItem("value")?.value == "true");

		this.changeCallback = changeCallback;
		if(this.changeCallback){
			this.querySelector('input').addEventListener('change', ()=>{
				this.changeCallback(this.value);
			});
		}
	}

	get value() {
		return this.querySelector('input').checked;
	}

	set value(b) {
		this.querySelector('input').checked = b;
		if(this.changeCallback)
			this.changeCallback(this.value);
	}
}
customElements.define('ui-toggle', Toggle);
