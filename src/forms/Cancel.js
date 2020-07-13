import { BasicElement } from "../BasicElement.js";

export class Cancel extends BasicElement {
	constructor() {
		super("Cancel");

		this.addEventListener('click', this.close.bind(this));
	}
}
customElements.define('ui-cancel', Cancel);
