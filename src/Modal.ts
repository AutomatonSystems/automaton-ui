import { Panel, PanelOptions } from "./layout/Panel";
import { Splash } from "./Splash";
import { Appendable } from "./utils.js";

export type ModalOptions = PanelOptions & {dismissable?: boolean};

export class Modal extends Splash {
	constructor(content?: Appendable, options?: ModalOptions) {
		super('', { dismissable: options?.dismissable ?? true });

		this.setAttribute("ui-modal", '');

		let panel = new Panel(content, options);
		panel.addEventListener("mousedown", () => event.stopPropagation());
		// rebind panel to parent splash so hide/show etc call parent
		panel.self = this;
		this.appendChild(panel);
	}

	get panel(): Panel{
		return <Panel>this.querySelector("ui-panel");
	}

	override close() {
		this.self.remove();
		return this;
	}
}
customElements.define('ui-modal', Modal);
