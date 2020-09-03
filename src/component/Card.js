import "./Card.css";
import { BasicElement } from "../BasicElement.js";

export class Card extends BasicElement {
	constructor(content) {
		super();

		this.setAttribute("ui-card", '');

		let con = content || this.innerHTML;
		this.innerHTML = `<div class="card"></div>`;
		this.setContent(con);

	}

	setContent(content) {
		if (typeof content == 'string') {
			this.querySelector('.card').innerHTML = content ?? '';
		}else {
			this.querySelector('.card').append(content);
		}
	}


	async flip() {
		this.flipped = !this.flipped;
		let v = this.cssNumber('--duration');
		return new Promise(res => setTimeout(res, v));
	}

	get flipped() {
		return this.getAttribute("flipped") == null;
	}

	set flipped(bool) {
		if (bool) {
			this.removeAttribute("flipped");
		}
		else {
			this.setAttribute("flipped", '');
		}
	}
}
customElements.define('ui-card', Card);
