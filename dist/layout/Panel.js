import "./Panel.css";
import { BasicElement } from "../BasicElement";
import { append } from "../utils.js";
export class Panel extends BasicElement {
    /**
     *
     * @param {String|Element|Element[]} content
     * @param {{title?: String, clazz?: String, buttons?: String, header?: boolean, footer?: boolean}} param1
     */
    constructor(content = '', { title = '', clazz = '', buttons = '', header = false, footer = false } = {}) {
        super();
        this.setAttribute("ui-panel", '');
        if (!this.innerHTML.trim()) {
            this.innerHTML = `
				${(header || title) ? `<header>${title}</header>` : ''}
				<content></content>
				${(footer || buttons) ? `<footer>${buttons}</footer>` : ''}
			`;
            append(this.content, content);
        }
        if (clazz) {
            this.classList.add(clazz);
        }
    }
    get content() {
        return this.querySelector('content');
    }
    /**
     *
     * @param  {...String|HTMLElement} elements
     */
    append(...elements) {
        append(this.content, elements);
    }
    header(...elements) {
        append(this.querySelector('header'), elements);
    }
    footer(...elements) {
        append(this.querySelector('footer'), elements);
    }
}
customElements.define('ui-panel', Panel);
//# sourceMappingURL=Panel.js.map