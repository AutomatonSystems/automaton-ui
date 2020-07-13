
export class BasicElement extends HTMLElement {
	constructor(content) {
		super();

		this.self = this;

		if (content) {
			this.innerHTML = content;
		}

		this.remove = this.remove.bind(this);
	}

    /**
     *
     * @param {String} variable
     *
     * @returns {String|Number}
     */
	css(variable) {
		let value = getComputedStyle(this).getPropertyValue(variable);
		if(!value)
			value = this.style.getPropertyValue(variable);
		// everything else
		return value;
	}

    /**
     *
     * @param {String} variable
     *
     * @returns {Number}
     */
	cssNumber(variable) {
		let value = this.css(variable);

		let number = parseFloat(value);
		// timings
		if (value.endsWith('ms')) {
			return number;
		}
		else if (value.endsWith('s')) {
			return number * 1000;
		}
		// everything else
		return number;
	}

	setCss(name,value){
		this.style.setProperty(name, value);
	}

	get visible() {
		return this.self.hidden == false;
	}

    /**
     * @param {Boolean} boolean
     */
	set visible(boolean) {
		if (boolean) {
			this.self.removeAttribute("hidden");
		}
		else {
			this.self.setAttribute("hidden", '');
		}
	}

	show(parent = null) {
		// attach to dom if I haven't already
		this.self.attach(parent);
		// and show
		this.self.visible = true;
		return this;
	}

	hide() {
		this.self.visible = false;
		return this;
	}

	remove() {
		this.self.parentElement?.removeChild(this.self);
		return this;
	}

    /**
     * Walk up dom tree looking for a closable element
     */
	close() {
		let ele = this.parentElement;
		while (ele['close'] == null) {
			ele = ele.parentElement;
			if(ele == null)
				return this;
		}
		ele['close']();
		return this;
	}

	attach(parent = null) {
		if (!this.self.parentElement) {
			if (parent == null)
				parent = document.body;
			parent.appendChild(this.self);
		}
		return this;
	}

    /**
     *
     * @param  {...Element} elements
     *
     * @returns {HTMLElement[]}
     */
	static castHtmlElements(...elements) {
		return /** @type {HTMLElement[]} */ ([...elements]);
	}
}
customElements.define('ui-basic', BasicElement);
