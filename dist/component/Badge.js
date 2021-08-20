import "./Badge.css";
import { BasicElement } from "../BasicElement.js";
export class Badge extends BasicElement {
    constructor(content, { icon = '', clazz = '' } = {}) {
        var _a;
        super(content, { clazz });
        this.setAttribute("ui-badge", '');
        icon = icon || ((_a = this.attributes.getNamedItem("icon")) === null || _a === void 0 ? void 0 : _a.value);
        if (icon) {
            let i = document.createElement('i');
            let classes = icon.trim().split(" ");
            // include the default font-awesome class if one wasn't provided
            if (!classes.includes('fa') && !classes.includes('fab') && !classes.includes('fas'))
                i.classList.add('fa');
            i.classList.add(...classes);
            this.prepend(i);
        }
    }
}
customElements.define('ui-badge', Badge);
//# sourceMappingURL=Badge.js.map