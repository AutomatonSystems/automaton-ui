var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import UI from "../ui.js";
import { BasicElement } from "../BasicElement.js";
import "./Input.css";
export class AbstractInput extends BasicElement {
    /**
     *
     * @param {*} obj json object/array to keep up to date
     * @param {*} key json key/indes to keep up to date
     * @param {{callback?: Function, size?:Number, color?:String, placeholder?:string}} params configuration parameters
     */
    constructor(obj, key, params) {
        super();
        this.obj = obj;
        this.key = key;
        this.setAttribute("ui-input", '');
    }
    get value() {
        return Reflect.get(this.obj, this.key);
    }
    set value(value) {
        Reflect.set(this.obj, this.key, value);
    }
    /**
     *
     * @param {String} name
     *
     * @returns {InputLabel}
     */
    label(name) {
        return new InputLabel(this, name, { wrapped: true });
    }
}
export class AbstractHTMLInput extends HTMLInputElement {
    /**
     *
     * @param {*} obj json object/array to keep up to date
     * @param {*} key json key/indes to keep up to date
     * @param {{callback?: Function, size?:Number, color?:String, placeholder?:string}} params configuration parameters
     */
    constructor(obj, key, params) {
        super();
        this.setAttribute("ui-input", '');
    }
    /**
     *
     * @param {String} name
     *
     * @returns {InputLabel}
     */
    label(name) {
        return new InputLabel(this, name, { wrapped: true });
    }
}
export class StringInput extends AbstractHTMLInput {
    /**
     *
     * @param {*} obj json object/array to keep up to date
     * @param {*} key json key/indes to keep up to date
     * @param {{callback?: Function, size?:Number, color?:String, placeholder?:string}} params configuration parameters
     */
    constructor(obj, key, { callback = null, size = null, color = null, placeholder = null } = {}) {
        var _a;
        super();
        this.type = "text";
        this.value = (_a = Reflect.get(obj, key)) !== null && _a !== void 0 ? _a : null;
        if (size)
            this.style.width = (size * 24) + "px";
        if (color)
            this.style.setProperty('--color', color);
        if (placeholder)
            this.setAttribute('placeholder', placeholder);
        this.addEventListener('change', () => {
            let value = this.value;
            Reflect.set(obj, key, value);
            if (callback)
                callback(value);
        });
    }
}
customElements.define('ui-stringinput', StringInput, { extends: 'input' });
/**
 * A number input that keeps a json object
 * up to date with it's value
 *
 */
export class NumberInput extends AbstractHTMLInput {
    /**
     *
     * @param {*} obj json object/array to keep up to date
     * @param {*} key json key/indes to keep up to date
     * @param {{callback?: Function, size?:Number, color?:String, placeholder?:string}} params configuration parameters
     */
    constructor(obj, key, { callback = null, size = null, color = null, placeholder = null } = {}) {
        super();
        this.type = "number";
        this.value = Reflect.get(obj, key);
        if (size)
            this.style.width = (size * 24) + "px";
        if (color)
            this.style.setProperty('--color', color);
        if (placeholder)
            this.setAttribute('placeholder', placeholder);
        this.addEventListener('change', () => {
            let value = parseFloat(this.value);
            Reflect.set(obj, key, value);
            if (callback)
                callback(value);
        });
    }
}
customElements.define('ui-numberinput', NumberInput, { extends: 'input' });
export class SelectInput extends HTMLSelectElement {
    constructor(obj, key, { options = [], callback = null, size = null, color = null, placeholder = null } = {}) {
        super(obj, key);
        this._value = null;
        this.obj = obj;
        this.key = key;
        this.setAttribute("ui-input", '');
        if (size)
            this.style.width = (size * 24) + "px";
        if (color)
            this.style.setProperty('--color', color);
        if (placeholder)
            this.setAttribute('placeholder', placeholder);
        this.addEventListener('change', () => {
            let value = this.value;
            this.setValue(value);
            if (callback)
                callback(value);
        });
        this.renderOptions(options);
    }
    getValue() {
        var _a;
        return (_a = Reflect.get(this.obj, this.key)) !== null && _a !== void 0 ? _a : null;
    }
    setValue(value) {
        Reflect.set(this.obj, this.key, value);
    }
    renderOptions(options) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof options == 'function') {
                options = yield options();
            }
            let value = this.getValue();
            for (let opt of options) {
                let option = document.createElement('option');
                if (opt && opt.hasOwnProperty('value')) {
                    if (opt.value == value)
                        option.setAttribute('selected', '');
                    option.innerText = (_a = opt.display) !== null && _a !== void 0 ? _a : opt.value;
                    option.value = opt.value;
                }
                else {
                    if (opt == value)
                        option.setAttribute('selected', '');
                    option.innerText = opt;
                }
                this.append(option);
            }
        });
    }
}
customElements.define('ui-selectinput', SelectInput, { extends: 'select' });
export class MultiSelectInput extends AbstractInput {
    constructor(obj, key, { options }) {
        super(obj, key);
        if (!Array.isArray(this.value))
            this.value = [];
        let list = document.createElement("content");
        this.list = list;
        this.append(list);
        // picker
        // TODO other string picker options
        let select = document.createElement("select");
        select.innerHTML = "<option selected disabled hidden>Add...</option>" + options.map(o => `<option>${o}</option>`).join('');
        select.addEventListener("change", () => {
            this.value.push(select.value);
            select.value = "Add...";
            this.renderList();
        });
        this.append(select);
        this.renderList();
    }
    renderList() {
        this.list.innerHTML = "";
        this.list.append(...this.value.map((v, index) => {
            let badge = new UI.Badge(v);
            badge.append(new UI.Button('', () => {
                // remove this item and redraw
                this.value.splice(index, 1);
                this.renderList();
            }, { icon: 'fa-times', style: 'text', color: 'error-color' }));
            return badge;
        }));
    }
}
customElements.define('ui-multiselectinput', MultiSelectInput);
export class JsonInput extends AbstractInput {
    constructor(obj, key) {
        var _a;
        super(obj, key);
        let text = document.createElement('textarea');
        text.onkeydown = function (e) {
            if (e.key == 'Tab') {
                e.preventDefault();
                let s = this.selectionStart;
                this.value = this.value.substring(0, this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
                this.selectionEnd = s + 1;
            }
        };
        let resize = () => {
            text.style["height"] = "1px";
            text.style["height"] = text.scrollHeight + "px";
        };
        text.onkeyup = resize;
        text.addEventListener('change', () => {
            try {
                let json = JSON.parse(text.value);
                this.value = json;
                this.classList.toggle('error', false);
            }
            catch (e) {
                this.classList.toggle('error', true);
            }
        });
        text.value = JSON.stringify((_a = this.value) !== null && _a !== void 0 ? _a : "", null, "\t");
        this.append(text);
        setTimeout(resize, 10);
    }
}
customElements.define('ui-json-input', JsonInput);
export class InputLabel extends HTMLLabelElement {
    /**
     *
     * @param {AbstractInput} inputElement
     * @param {String} display
     * @param {{wrapped?:boolean}}
     */
    constructor(inputElement, display, { wrapped = false } = {}) {
        super();
        if (wrapped) {
            // wrap the item with the label
            this.innerHTML = `<span class="label">${display}</span>`;
            this.append(inputElement);
        }
        else {
            let id = inputElement.id;
            if (id == null) {
                // generate a (likely) unique id and use it
                id = "ui-" + Math.random().toString(16).slice(2);
                inputElement.id = id;
            }
            this.setAttribute('for', id);
            this.innerText = display;
        }
    }
    get value() {
        return this.input.value;
    }
    set value(v) {
        this.input.value = v;
    }
}
customElements.define('ui-label', InputLabel, { extends: 'label' });
export class LabelledInput extends InputLabel {
    /**
     *
     * @param {*} json
     * @param {String} key
     * @param {typeof AbstractInput| typeof AbstractHTMLInput} type
     * @param {*} options
     */
    constructor(json, key, type, options = {}) {
        var _a;
        super(new type(json, key, options), (_a = options.name) !== null && _a !== void 0 ? _a : key, { wrapped: true });
    }
}
customElements.define('ui-labelledinput', LabelledInput, { extends: 'label' });
//# sourceMappingURL=Input.js.map