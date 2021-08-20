import "./Button.css";
import { BasicElement } from "../BasicElement.js";
export class Button extends BasicElement {
    /**
     *
     * @param {String|HTMLElement} content
     * @param {EventListenerOrEventListenerObject|String} callback callback when the button is clicked
     * @param {{icon?: String, style?: String, color?: String|boolean}} options
     */
    constructor(content, callback, { icon = '', style = 'button', color = false } = {}) {
        var _a;
        super(content);
        this.setAttribute("ui-button", '');
        if (typeof callback == "string") {
            // create link like behaviour (left click open; middle/ctrl+click new tab)
            this.addEventListener('click', (e) => {
                // control key
                if (e.ctrlKey) {
                    window.open(callback);
                }
                else {
                    // otherwise
                    location.href = callback;
                }
            });
            this.addEventListener('auxclick', (e) => {
                // middle click
                if (e.button == 1) {
                    window.open(callback);
                }
            });
            this.addEventListener('mousedown', (e) => {
                if (e.button == 1) {
                    // on windows middlemouse down bring up the scroll widget; disable that
                    e.preventDefault();
                }
            });
        }
        else {
            // fire the provided event
            this.addEventListener('click', callback);
        }
        this.classList.add(style);
        if (color)
            this.classList.add(color);
        icon = icon || ((_a = this.attributes.getNamedItem("icon")) === null || _a === void 0 ? void 0 : _a.value);
        if (icon) {
            let i = document.createElement('i');
            let classes = icon.trim().split(" ");
            // include the default font-awesome class if one wasn't provided
            if (!classes.includes('fa') && !classes.includes('fab') && !classes.includes('fas'))
                i.classList.add('fa');
            i.classList.add(...classes);
            this.prepend(i);
            if (content == '')
                i.classList.add('icon-only');
        }
    }
}
customElements.define('ui-button', Button);
//# sourceMappingURL=Button.js.map