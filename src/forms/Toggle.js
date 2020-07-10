import { BasicElement } from "../BasicElement";

export class Toggle extends BasicElement {
	constructor(v) {
		super(`<input type="checkbox"/><div><span></span></div>`);
		this.value = v ?? (this.attributes.getNamedItem("value")?.value == "true");
	}

	get value() {
		return this.querySelector('input').checked;
	}

	set value(b) {
		this.querySelector('input').checked = b;
	}
}
customElements.define('ui-toggle', Toggle);
