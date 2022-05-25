import "./Toggle.css";

import { BasicElement } from "../BasicElement";

export class Toggle extends BasicElement {
	constructor(v: boolean, changeCallback: (value: boolean)=>void) {
		super(`<input type="checkbox"/><div><span></span></div>`);
		this.value = v ?? (this.attributes.getNamedItem("value")?.value == "true");
		this.setAttribute("ui-toggle", "");

		if(changeCallback){
			this.querySelector('input').addEventListener('change', ()=>{
				changeCallback(this.value);
			});
		}
	}

	get value() {
		return (<HTMLInputElement>this.querySelector('input')).checked;
	}

	set value(b) {
		(<HTMLInputElement>this.querySelector('input')).checked = b;
	}
}
customElements.define('ui-toggle', Toggle);
