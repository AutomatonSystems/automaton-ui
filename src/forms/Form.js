import "./Form.css";

import { BasicElement } from "../BasicElement.js";
import { Button } from "./Button.js";
import { Toggle } from "./Toggle.js";
import * as utils from "../utils.js";
/****** FORM COMPONENTS ******/
export class Form extends BasicElement {

	static STYLE = {
		ROW: { parent: 'table', wrap: 'tr', label: 'th', value: 'td' },
		INLINE: { parent: null, wrap: 'span', label: 'label', value: 'span' }
	};


	constructor(template) {
		super();

		this.template = template;
		this.changeListeners = [];
		this.onChange = this.onChange.bind(this);

		this.formStyle = Form.STYLE.ROW;

		this.value = {};
	}

	async build(json) {
		this.value = json;

		this.changeListeners = [];
		let eles = await this.jsonToHtml(this.template, json);
		this.innerHTML = "";
		this.append(...eles);
		// add change listeners
		let inputs = this.querySelectorAll('[data-key]');
		for (let input of inputs) {
			input.addEventListener('change', this.onChange);
		}
		// finally trigger them for the starting state
		this.onChange();

		return this;
	}

	onChange() {
		let json = this.json();
		this.value = json;
		this.changeListeners.forEach(l => l(json));
	}

	json(includeHidden = false) {
		return this._readValue(this, includeHidden);
	}

	_readValue(element, includeHidden = false){
		let json = {};

		let inputs = element.querySelectorAll('[data-key]');
		for (let input of inputs) {
			// skip hidden inputs is required
			if(!includeHidden && input.closest('[hidden]'))
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
					parent[k] = parent[k] ?? [];
				}
				else {
					parent[k] = parent[k] ?? {};
				}
				parent = parent[k];
			}
			// read the value
			let value = input[input['type'] == 'checkbox' ? 'checked' : 'value'];
			if(input['type'] == 'number' || input.dataset.format == 'number'){
				value = parseFloat(value);
			}

			// if the last step is an array - init it
			if (key.includes('[]')) {
				key = key.replace('[]', '');
				parent[key] = parent[key] ?? [];
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
					// array of objects -
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

	async jsonToHtml(templates, json, jsonKey = '', options = { style: this.formStyle }) {
		let elements = [];
		if (!Array.isArray(templates))
			templates = [templates];
		for (let template of templates) {
			if (typeof template == "string") {
				if (template.indexOf(":") == -1) {
					template = {
						key: null,
						type: template
					};
				}
				else {
					template = {
						key: template.split(':')[0],
						type: template.split(':')[1]
					};
					if (json == null)
						json = {};
				}
			}

			// template value
			let value = (template.key ? json[template.key] : json) ?? template.default;
			
			elements.push(await this.oneItem(template, value, template.key ? ((jsonKey ? jsonKey + "." : '') + template.key) : jsonKey, options));
		}

		if (options.style?.parent) {
			let parent = document.createElement(options.style?.parent);
			parent.append(...elements);
			return [parent];
		}
		else {
			return elements;
		}
	}

	_readJsonWithKey(json, key){
		try{
			let keys = key.split('.');
			for(let part of keys){
				if(json == null)
					return null;
				if(part.endsWith('[]')){
					part = part.substring(0, part.length-2);
					json = json[part];
					if(json?.length > 0)
						json = json[0];
					else
						json = null;
				}else{
					json = json[part];
				}
				
			}
			return json;
		}catch(e){
			return null;
		}
	}

	async oneItem(template, itemValue, jsonKey, { style = Form.STYLE.ROW } = {}) {

		let element = document.createElement(style.wrap);

		if (template.hidden) {
			this.changeListeners.push((json) => {
				element.hidden = template.hidden(json, element);
			});
		}

		let render = async (elementValue)=>{
			let label;
			if (template.key) {
				label = document.createElement(style.label);
				label.innerHTML = template.name ?? template.key;
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

			if (typeof template.type == "string") {
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
					case 'toggle':
						html += `<ui-toggle data-key="${jsonKey}" value="${elementValue ?? false}"></ui-toggle>`;
						wrapper.innerHTML = html;
						break;
					case "dropdown":
					case "select":
					case 'list':
						html += `<select data-key="${jsonKey}" data-format="${template.format}">`;
						let options = template.options;
						if (!Array.isArray(options))
							options = await options(this.value);
						html += options.map(v => `<option 
								${(elementValue == (v.value ? v.value : v)) ? 'selected' : ''}
								value=${v.value ? v.value : v}>${v.name ? v.name : v}</option>`).join('');
						html += `</select>`;
						wrapper.innerHTML = html;
						break;
					case 'text':
						html += `<textarea data-key="${jsonKey}">${elementValue ?? ''}</textarea>`;
						wrapper.innerHTML = html;
						break;
					case 'string':
						let input = utils.htmlToElement(`<input data-key="${jsonKey}" type="text" placeholder="${template.placeholder ?? ''}"/>`);
						input.value = elementValue ?? null;
						wrapper.append(input);
						break;
					case 'number':
						html += `<input data-key="${jsonKey}" type="number" value="${elementValue ?? ''}"/>`;
						wrapper.innerHTML = html;
						break;
					// complex types
					// nested types (compound object)
					case 'compound':
						//
						wrapper.append(...await this.jsonToHtml(template.children, elementValue ?? {}, jsonKey));
						break;
					// repeating object
					case 'array':
						// the element repeats multiple times
						jsonKey = jsonKey + "[]";

						let tStyle = template.style ?? 'INLINE';

						let substyle = Form.STYLE[tStyle];

						let contain = document.createElement('div');
						contain.classList.add('array');
						contain.classList.add(tStyle);
						// add button
						let button = new Button("Add", null, { icon: 'fa-plus' });


						let createItem = async (itemValue) => {

							let item = document.createElement('span');
							item.classList.add('item');

							item.append(...await this.jsonToHtml(template.children, itemValue, jsonKey, { style: substyle }));

							item.append(new Button("", () => {
								item.remove();
							}, { icon: 'fa-trash', style: "text", color: "error" }));
							
							let inputs = item.querySelectorAll('[data-key]');
							for (let input of inputs) {
								input.addEventListener('change', this.onChange);
							}

							contain.append(item);

						};
						button.addEventListener('click', async () => {
							let item = await createItem(Array.isArray(template.children)?{}:null)
							this.onChange();
							return item;
						});

						if (Array.isArray(elementValue)) {
							for(let j of elementValue){
								await createItem(j);
							}

						}

						wrapper.append(contain);

						wrapper.append(button);

						break;
				}
			}else if (typeof template.type == 'function') {
				let input = new template.type(elementValue);
				input.dataset['key'] = jsonKey;
				wrapper.append(input);
			}
		};

		await render(itemValue);

		if(template.redraw){
			// cache of the previous value
			let lastValue = {};
			// handle change events can filter them
			let changeListener = async (fullJson) => {
				let newJsonValue = this._readJsonWithKey(fullJson, template.redraw);
				let newValue = JSON.stringify(newJsonValue);
				if(lastValue!==newValue){
					// grab the current value directly from the element
					let v = this._readValue(element);
					let value = this._readJsonWithKey(v,jsonKey);
					// rebuild the element
					element.innerHTML = "";
					await render(value);
					// cache the value
					lastValue = newValue;
				}
			};
			// resgister the change listener
			this.changeListeners.push(changeListener);
		}

		return element;
	}
}
customElements.define('ui-form', Form);