import { Code } from "./Code";

export class Json extends Code {
	constructor(content: Object|string) {
		super(content?
			typeof content == 'object'?JSON.stringify(content, null, "\t"):JSON.stringify(JSON.parse(content), null, "\t")
			: null
		);
	}
}
customElements.define('ui-json', Json);