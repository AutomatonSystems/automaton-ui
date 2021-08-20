var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import "./Form.css";
import { BasicElement } from "../BasicElement.js";
import { Button } from "./Button.js";
import * as utils from "../utils.js";
import UI from "../ui.js";
;
;
export class Form extends BasicElement {
    constructor(template) {
        super();
        this.template = template;
        this.changeListeners = [];
        this.onChange = this.onChange.bind(this);
        this.formStyle = Form.STYLE.ROW;
        this.configuration = {
            formatting: {
                strings: {
                    trim: true
                }
            }
        };
        this.value = {};
    }
    build(json) {
        return __awaiter(this, void 0, void 0, function* () {
            this.value = json;
            this.changeListeners = [];
            let eles = yield this.jsonToHtml(this.template, json);
            this.innerHTML = "";
            this.append(...eles);
            /*// add change listeners
            let inputs = this.querySelectorAll('[data-key]');
            for (let input of inputs) {
                input.addEventListener('change', this.onChange);
            }*/
            // finally trigger them for the starting state
            this.onChange();
            return this;
        });
    }
    onChange() {
        return __awaiter(this, void 0, void 0, function* () {
            let json = this.json();
            this.value = json;
            for (let listener of this.changeListeners)
                yield listener(json);
            this.dispatchEvent(new Event('change'));
        });
    }
    json(includeHidden = false) {
        return this._readValue(this, includeHidden);
    }
    _readValue(element, includeHidden = false) {
        var _a, _b, _c;
        let json = {};
        let inputs = element.querySelectorAll('[data-key]');
        for (let input of inputs) {
            // skip hidden inputs if required
            if (!includeHidden && input.closest('[hidden]'))
                continue;
            let parent = json;
            // grab the correct place to store this value
            let keys = input['dataset']['key'].split('.');
            let key = keys.pop();
            // initialize any nesting
            for (let k of keys) {
                if (Array.isArray(parent)) {
                    let a = {};
                    parent.push(a);
                    parent = a;
                }
                if (k.includes('[]')) {
                    k = k.replace('[]', '');
                    parent[k] = (_a = parent[k]) !== null && _a !== void 0 ? _a : [];
                }
                else {
                    parent[k] = (_b = parent[k]) !== null && _b !== void 0 ? _b : {};
                }
                parent = parent[k];
            }
            // read the value
            let value = input[input['type'] == 'checkbox' ? 'checked' : 'value'];
            if (typeof value == "string") {
                if (input['type'] == 'text' || input.dataset.format == 'string') {
                    if (this.configuration.formatting.strings.trim)
                        value = value.trim();
                }
                if (input['type'] == 'number' || input.dataset.format == 'number') {
                    value = parseFloat(value);
                }
                if (input['type'] == 'datetime-local' || input.dataset.format == 'datetime') {
                    value = new Date(value);
                }
                if (input.dataset.format == 'boolean') {
                    value = Form.TRUE_STRINGS.has((value + "").toLowerCase());
                }
            }
            // if the last step is an array - init it
            if (key.includes('[]')) {
                key = key.replace('[]', '');
                parent[key] = (_c = parent[key]) !== null && _c !== void 0 ? _c : [];
                parent = parent[key];
                key = null;
            }
            // if we are dealing with an array fiddle the key
            if (Array.isArray(parent)) {
                if (key === null) {
                    // key is just the next unset entry
                    key = parent.length;
                }
                else {
                    // array of objects - add new item if empty or the last item is already populated
                    if (parent.length == 0 || parent[parent.length - 1][key] != null) {
                        parent.push({});
                    }
                    parent = parent[parent.length - 1];
                }
            }
            // finally set the value on the object (or array)
            parent[key] = value;
        }
        return json;
    }
    jsonToHtml(templates, json, jsonKey = '', options = { style: this.formStyle }) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            let elements = [];
            let templatesArray = Array.isArray(templates) ? templates : [templates];
            for (let template of templatesArray) {
                let templateJson;
                if (typeof template == "string") {
                    if (template.indexOf(":") == -1) {
                        templateJson = {
                            key: null,
                            type: template
                        };
                    }
                    else {
                        templateJson = {
                            key: template.split(':')[0],
                            type: template.split(':')[1]
                        };
                        if (json == null)
                            json = {};
                    }
                }
                else {
                    templateJson = template;
                }
                // template value
                let value = (_a = (templateJson.key ? json[templateJson.key] : json)) !== null && _a !== void 0 ? _a : templateJson.default;
                elements.push(yield this.oneItem(templateJson, value, templateJson.key ? ((jsonKey ? jsonKey + "." : '') + templateJson.key) : jsonKey, options));
            }
            if ((_b = options.style) === null || _b === void 0 ? void 0 : _b.parent) {
                let parent = document.createElement((_c = options.style) === null || _c === void 0 ? void 0 : _c.parent);
                parent.append(...elements);
                return [parent];
            }
            else {
                return elements;
            }
        });
    }
    _readJsonWithKey(json, key) {
        try {
            let keys = key.split('.');
            for (let part of keys) {
                if (json == null)
                    return null;
                if (part.endsWith('[]')) {
                    part = part.substring(0, part.length - 2);
                    json = json[part];
                    if ((json === null || json === void 0 ? void 0 : json.length) > 0)
                        json = json[0];
                    else
                        json = null;
                }
                else {
                    json = json[part];
                }
            }
            return json;
        }
        catch (e) {
            return null;
        }
    }
    oneItem(template, itemValue, jsonKey, { style = Form.STYLE.ROW } = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            let element = document.createElement(style.wrap);
            element.dataset.element = jsonKey;
            let render = (elementValue) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                let label;
                if (template.key) {
                    label = document.createElement(style.label);
                    label.innerHTML = (_a = template.name) !== null && _a !== void 0 ? _a : template.key;
                    if (template.hint) {
                        let hint = document.createElement('div');
                        hint.innerHTML = template.hint;
                        label.append(hint);
                    }
                    element.append(label);
                }
                let wrapper = document.createElement(style.value);
                wrapper.classList.add('value');
                element.append(wrapper);
                if (typeof template.type == "string" || !template.type) {
                    let html = '';
                    switch (template.type) {
                        //
                        case 'header':
                            label.setAttribute("colspan", "2");
                            label.classList.add("header");
                            wrapper.remove();
                            break;
                        case 'description':
                            wrapper.setAttribute("colspan", "2");
                            wrapper.classList.add("description");
                            wrapper.innerHTML = template.key;
                            label.remove();
                            break;
                        case 'hr':
                            wrapper.setAttribute("colspan", "2");
                            wrapper.innerHTML = "<hr/>";
                            break;
                        //
                        case 'checkbox':
                            html += `<input data-key="${jsonKey}" type="checkbox" ${elementValue ? 'checked' : ''}/>`;
                            wrapper.innerHTML = html;
                            break;
                        case 'boolean':
                        case 'toggle':
                            html += `<ui-toggle data-key="${jsonKey}" value="${elementValue !== null && elementValue !== void 0 ? elementValue : false}"></ui-toggle>`;
                            wrapper.innerHTML = html;
                            break;
                        case "dropdown":
                        case "select":
                        case 'list':
                            html += `<select data-key="${jsonKey}" data-format="${template.format}">`;
                            let parsedOptions;
                            if (!Array.isArray(template.options))
                                parsedOptions = yield template.options(this.value);
                            else
                                parsedOptions = template.options;
                            html += parsedOptions.map(v => `<option 
								${(elementValue == (v.value ? v.value : v)) ? 'selected' : ''}
								value="${v.value ? v.value : v}">${v.name ? v.name : v}</option>`).join('');
                            html += `</select>`;
                            wrapper.innerHTML = html;
                            break;
                        case 'text':
                            html += `<textarea data-key="${jsonKey}">${elementValue !== null && elementValue !== void 0 ? elementValue : ''}</textarea>`;
                            wrapper.innerHTML = html;
                            break;
                        case 'number':
                            html += `<input data-key="${jsonKey}" type="number" value="${elementValue !== null && elementValue !== void 0 ? elementValue : ''}"/>`;
                            wrapper.innerHTML = html;
                            break;
                        // complex types
                        // nested types (compound object)
                        case 'object':
                        case 'compound':
                            //
                            wrapper.append(...yield this.jsonToHtml(template.children, elementValue !== null && elementValue !== void 0 ? elementValue : {}, jsonKey));
                            break;
                        // repeating object
                        case 'array':
                            // the element repeats multiple times
                            jsonKey = jsonKey + "[]";
                            let tStyle = (_b = template.style) !== null && _b !== void 0 ? _b : 'INLINE';
                            let substyle = Form.STYLE[tStyle];
                            let contain = document.createElement('div');
                            contain.classList.add('array');
                            contain.classList.add(tStyle);
                            // add button
                            let button = new Button("Add", null, { icon: 'fa-plus' });
                            let createItem = (itemValue) => __awaiter(this, void 0, void 0, function* () {
                                let item = document.createElement('span');
                                item.classList.add('item');
                                item.append(...yield this.jsonToHtml(template.children, itemValue, jsonKey, { style: substyle }));
                                item.append(new Button("", () => {
                                    item.remove();
                                    this.onChange();
                                }, { icon: 'fa-trash', style: "text", color: "error-color" }));
                                let inputs = item.querySelectorAll('[data-key]');
                                for (let input of inputs) {
                                    input.addEventListener('change', this.onChange);
                                }
                                contain.append(item);
                            });
                            button.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
                                let item = yield createItem(Array.isArray(template.children) ? {} : null);
                                this.onChange();
                                return item;
                            }));
                            if (Array.isArray(elementValue)) {
                                for (let j of elementValue) {
                                    yield createItem(j);
                                }
                            }
                            wrapper.append(contain);
                            wrapper.append(button);
                            break;
                        case 'datetime': {
                            let input = utils.htmlToElement(`<input data-key="${jsonKey}" type="datetime-local" placeholder="${(_c = template.placeholder) !== null && _c !== void 0 ? _c : ''}"/>`);
                            input.value = elementValue !== null && elementValue !== void 0 ? elementValue : new Date().toISOString().substring(0, 16);
                            if (template.disabled)
                                input.setAttribute('disabled', '');
                            wrapper.append(input);
                            break;
                        }
                        case 'string':
                        default: {
                            let input = utils.htmlToElement(`<input data-key="${jsonKey}" type="text" placeholder="${(_d = template.placeholder) !== null && _d !== void 0 ? _d : ''}"/>`);
                            input.value = elementValue !== null && elementValue !== void 0 ? elementValue : null;
                            if (template.disabled)
                                input.setAttribute('disabled', '');
                            // Provide autocomplete options for the input
                            if (template.options) {
                                let parsedOptions;
                                if (!Array.isArray(template.options))
                                    parsedOptions = yield template.options(this.value);
                                else
                                    parsedOptions = template.options;
                                let id = utils.uuid();
                                let list = UI.html(`<datalist id="${id}">`
                                    + parsedOptions.map(v => `<option 
										${(elementValue == (v.value ? v.value : v)) ? 'selected' : ''}
										value="${v.value ? v.value : v}">${v.name ? v.name : v}</option>`).join('')
                                    + '</datalist>');
                                wrapper.append(list);
                                // by default the list component only shows the items that match the input.value, which isn't very useful for a picker
                                input.addEventListener('focus', () => input.value = '');
                                input.setAttribute('list', id);
                            }
                            wrapper.append(input);
                            break;
                        }
                    }
                }
                else if (typeof template.type == 'function') {
                    let obj = template.type;
                    if (!!obj.prototype && !!obj.prototype.constructor.name) {
                        // TODO figure out the typoescript safe way to do this...
                        // @ts-ignore
                        let input = new template.type(elementValue, jsonKey, element);
                        input.dataset['key'] = jsonKey;
                        wrapper.append(input);
                    }
                    else {
                        let input = template.type(elementValue, jsonKey, element);
                        input.dataset['key'] = jsonKey;
                        wrapper.append(input);
                    }
                }
                let inputs = element.querySelectorAll('[data-key]');
                for (let input of inputs) {
                    input.addEventListener('change', (event) => {
                        event.stopPropagation();
                        this.onChange();
                    });
                }
                if (template.afterRender) {
                    template.afterRender(element, this);
                }
            });
            yield render(itemValue);
            if (template.hidden) {
                this.changeListeners.push((json) => {
                    element.hidden = template.hidden(json, element);
                });
            }
            if (template.redraw) {
                let redraws = Array.isArray(template.redraw) ? template.redraw : [template.redraw];
                for (let redraw of redraws) {
                    // cache of the previous value
                    let lastValue = {};
                    // handle change events can filter them
                    let changeListener = (fullJson) => __awaiter(this, void 0, void 0, function* () {
                        let newJsonValue = this._readJsonWithKey(fullJson, redraw);
                        let newValue = JSON.stringify(newJsonValue);
                        if (lastValue !== newValue) {
                            // grab the current value directly from the element
                            let v = this._readValue(element);
                            let value = this._readJsonWithKey(v, jsonKey);
                            // rebuild the element
                            element.innerHTML = "";
                            yield render(value);
                            // cache the value
                            lastValue = newValue;
                        }
                    });
                    // resgister the change listener
                    this.changeListeners.push(changeListener);
                }
            }
            return element;
        });
    }
}
Form.STYLE = {
    ROW: { parent: 'table', wrap: 'tr', label: 'th', value: 'td' },
    INLINE: { parent: null, wrap: 'span', label: 'label', value: 'span' }
};
Form.TRUE_STRINGS = new Set(["true", "1", "yes", "t", "y"]);
customElements.define('ui-form', Form);
//# sourceMappingURL=Form.js.map