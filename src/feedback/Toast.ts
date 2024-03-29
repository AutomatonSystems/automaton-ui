import "./Toast.css";

import { BasicElement } from "../BasicElement";

export class Toaster extends BasicElement{
	constructor(){
		super();
		this.attach();
	}
}
customElements.define('ui-toaster', Toaster);

function parseMessage(msg: any[]|any, topLevel = false): string{
	if(Array.isArray(msg) && topLevel === true){
		return msg.map(<any>parseMessage).join(' ');
	}else if(typeof msg === 'object'){
		return JSON.stringify(msg, null, '\t');
	}else{
		return ""+ msg;
	}
}

export class Toast extends BasicElement {
	constructor(message: any[]|any, { level = 'info' } = {}) {
		super(parseMessage(message, true));

		let i = document.createElement('i');
		let icon = { 'debug': 'fa-bug', 'info': 'fa-info-circle', 'warn': 'fa-exclamation-circle', 'error': 'fa-exclamation-triangle', 'success': 'fa-check-circle' }[level];
		i.classList.add("fa", icon);
		this.prepend(i);

		if (!document.querySelector('ui-toaster')) {
			new Toaster();
		}
		let toaster = document.querySelector('ui-toaster');

		this.classList.add(level);
		toaster.prepend(this);
		let count = document.querySelectorAll('ui-toast').length;
		setTimeout(() => this.style.marginTop = '10px', 10);
		setTimeout(() => { this.style.marginTop = '-50px'; this.style.opacity = '0'; }, 4800);
		setTimeout(() => this.remove(), 5000);
	}
}
customElements.define('ui-toast', Toast);