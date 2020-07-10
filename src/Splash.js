import { BasicElement } from "./BasicElement";

export class Splash extends BasicElement {

	constructor(content, { dismissable = false } = {}) {
		super(content);

		if (dismissable) {
			this.addEventListener('mousedown', this.remove);
		}
	}
}
customElements.define('ui-splash', Splash);
