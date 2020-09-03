import { Panel } from "./layout/Panel";
import { Splash } from "./Splash";





export class Modal extends Splash {
	constructor(content, { title = '', clazz = '', buttons = '', dismissable = true, header = false, footer = false } = {}) {
		super('', { dismissable: dismissable });

		let panel = new Panel(content, { title, clazz, buttons, header, footer});
		panel.addEventListener("mousedown", () => event.stopPropagation());
		// rebind panel to parent splash so hide/show etc call parent
		panel.self = this;
		this.appendChild(panel);
	}

	/**
	 * @type {Panel}
	 */
	get panel(){
		return this.querySelector("ui-panel");
	}

	close() {
		this.self.remove();
		return this;
	}
}
customElements.define('ui-modal', Modal);
