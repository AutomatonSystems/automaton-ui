import './Code.css';

import { BasicElement } from "../BasicElement.js";

// @ts-ignore
import CodeWorker from 'web-worker:./CodeWorker';

export class Code extends BasicElement {

	constructor(content?: string) {
		super(content);

		this.setContent(content || this.innerHTML);
	}

	preprocess(content: string) {
		return content;
	}

	override setContent(content: string){
		content = this.preprocess(content);
		// send the stuff off to a webworker to be prettified
		let worker = new CodeWorker();
		worker.onmessage = (event: any) => {
			this.classList.add('hljs');
			this.innerHTML = event.data;
		};
		worker.postMessage(content);
	}
}
customElements.define('ui-code', Code);
