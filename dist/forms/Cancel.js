import { BasicElement } from "../BasicElement.js";
export class Cancel extends BasicElement {
    constructor() {
        super();
        this.innerHTML = this.innerHTML || "Cancel";
        this.addEventListener('click', this.close.bind(this));
    }
}
customElements.define('ui-cancel', Cancel);
//# sourceMappingURL=Cancel.js.map