import { Code } from "./Code";

export class Json extends Code {
	constructor(content) {
		super(content);
	}

	preprocess(content) {
		if (typeof content == 'object')
			return JSON.stringify(content, null, "\t");
		return JSON.stringify(JSON.parse(content), null, "\t");
	}
}
customElements.define('ui-json', Json);