import "./Card.css";
import { BasicElement } from "../BasicElement.js";
import { append, Appendable} from "../utils.js";

export class Card extends BasicElement {

	cardInner: HTMLElement;

	constructor(content?: Appendable) {
		super();

		this.setAttribute("ui-card", '');

		let con = content || this.innerHTML;
		this.innerHTML = `<div class="card"></div>`;
		this.cardInner = this.querySelector('.card');
		this.setContent(con);

	}

	override setContent(content?: Appendable) {
		this.cardInner.innerHTML = "";
		append(this.cardInner, content);
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
