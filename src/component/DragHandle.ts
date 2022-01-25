import "./DragHandle.css";

import { BasicElement } from "../BasicElement.js";

export class DragHandle extends BasicElement {
	constructor() {
		super();

		this.classList.add("fa", "fa-grip-horizontal");

	}
}
customElements.define('ui-drag', DragHandle);
