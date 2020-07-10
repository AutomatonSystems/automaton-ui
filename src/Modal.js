import { Panel } from "./Panel";
import { Splash } from "./Splash";





export class Modal extends Splash {
	constructor(content, { title = '', clazz = '', buttons = '', dismissable = true } = {}) {
		super('', { dismissable: dismissable });

		let panel = new Panel(content, { title, clazz, buttons });
		panel.addEventListener("mousedown", () => event.stopPropagation());
		// rebind panel to parent splash so hide/show etc call parent
		panel.self = this;
		this.appendChild(panel);
	}

	close() {
		this.self.remove();
		return this;
	}
}
customElements.define('ui-modal', Modal);
