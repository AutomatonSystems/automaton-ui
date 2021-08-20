import { BasicElement } from "../BasicElement";
export class Spinner extends BasicElement {
    constructor() {
        var _a;
        super();
        let size = ((_a = this.attributes.getNamedItem("size")) === null || _a === void 0 ? void 0 : _a.value) || "1em";
        this.style.setProperty("--size", size);
    }
}
customElements.define('ui-spinner', Spinner);
//# sourceMappingURL=Spinner.js.map