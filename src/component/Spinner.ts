import { BasicElement } from "../BasicElement";

export type SpinnerOptions = {
	size: string
}

export class Spinner extends BasicElement {
	constructor(options?: SpinnerOptions) {
		super();

		let size = options?.size ?? this.attributes.getNamedItem("size")?.value ?? "1em";
		this.style.setProperty("--size", size);
	}
}
customElements.define('ui-spinner', Spinner);
