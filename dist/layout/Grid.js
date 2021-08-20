var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _Grid_columns, _Grid_rows;
import "./Grid.css";
import { BasicElement } from "../BasicElement";
import UI from "../ui.js";
export class Grid extends BasicElement {
    /**
     * @param {{padding?: string, columnGap?: string, rowGap?: string}}
     */
    constructor({ padding, columnGap, rowGap } = {}) {
        super();
        _Grid_columns.set(this, 0);
        _Grid_rows.set(this, 0);
        this.setAttribute('ui-grid', '');
        if (padding !== undefined) {
            this.setCss('--padding', padding);
        }
        if (rowGap !== undefined) {
            this.setCss('row-gap', rowGap);
        }
        if (columnGap !== undefined) {
            this.setCss('column-gap', columnGap);
        }
    }
    get columns() {
        return __classPrivateFieldGet(this, _Grid_columns, "f");
    }
    set columns(n) {
        __classPrivateFieldSet(this, _Grid_columns, n, "f");
        this.setCss('--columns', n);
    }
    get rows() {
        return __classPrivateFieldGet(this, _Grid_rows, "f");
    }
    set rows(n) {
        __classPrivateFieldSet(this, _Grid_columns, n, "f");
        this.setCss('--rows', n);
    }
    /**
     *
     * @param {HTMLElement|HTMLElement[]} element
     * @param {Number} column
     * @param {Number} row
     * @param {Number} width
     * @param {Number} height
     */
    put(element, row, column, width = 1, height = 1) {
        // auto expand rows
        if (this.rows < row + height - 1) {
            this.rows = row + height - 1;
        }
        // auto expand rows
        if (this.columns < column + width - 1) {
            this.columns = column + width - 1;
        }
        if (Array.isArray(element)) {
            element = new UI.BasicElement(element);
            element.style.display = "flex";
        }
        element.style.setProperty('grid-area', `${row} / ${column} / span ${height} / span ${width}`);
        this.append(element);
    }
}
_Grid_columns = new WeakMap(), _Grid_rows = new WeakMap();
customElements.define('ui-grid', Grid);
//# sourceMappingURL=Grid.js.map