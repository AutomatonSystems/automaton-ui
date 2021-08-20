import "./Toggle.css";
import { BasicElement } from "../BasicElement";
export class Toggle extends BasicElement {
    constructor(v, changeCallback) {
        var _a;
        super(`<input type="checkbox"/><div><span></span></div>`);
        this.changeCallback = null;
        this.value = v !== null && v !== void 0 ? v : (((_a = this.attributes.getNamedItem("value")) === null || _a === void 0 ? void 0 : _a.value) == "true");
        this.changeCallback = changeCallback;
        if (this.changeCallback) {
            this.querySelector('input').addEventListener('change', () => {
                this.changeCallback(this.value);
            });
        }
    }
    get value() {
        return this.querySelector('input').checked;
    }
    set value(b) {
        this.querySelector('input').checked = b;
        if (this.changeCallback)
            this.changeCallback(this.value);
    }
}
customElements.define('ui-toggle', Toggle);
//# sourceMappingURL=Toggle.js.map