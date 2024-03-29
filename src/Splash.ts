import { BasicElement } from "./BasicElement";
import { Appendable } from "./utils.js";

export class Splash extends BasicElement {

	constructor(content?: Appendable, { dismissable = false } = {}) {
		super(content);

		this.setAttribute("ui-splash", '');

		if (dismissable) {
			this.addEventListener('mousedown', this.remove);
		}
	}
}
customElements.define('ui-splash', Splash);
