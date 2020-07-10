import { BasicElement } from "./BasicElement";

export class Spinner extends BasicElement {
	constructor() {
		super();

		let size = this.attributes.getNamedItem("size")?.value || "1em";
		this.style.setProperty("--size", size);
	}
}
customElements.define('ui-spinner', Spinner);
