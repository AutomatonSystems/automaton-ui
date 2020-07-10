import './Code.css';

import { BasicElement } from "../BasicElement.js";

// @ts-ignore
import CodeWorker from 'web-worker:./CodeWorker';

export class Code extends BasicElement {

	constructor(content) {
		super(content);

		content = this.preprocess(content || this.innerHTML);
		// send the stuff off to a webworker to be prettified
		let worker = new CodeWorker();
		worker.onmessage = (event) => {
			this.classList.add('hljs');
			this.innerHTML = event.data;
		};
		worker.postMessage(content);
	}

	preprocess(content) {
		return content;
	}
}
customElements.define('ui-code', Code);
