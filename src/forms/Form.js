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
		this.changeListeners = [];
		let eles = await this.jsonToHtml(this.template, json);
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
		this.changeListeners.forEach(l => l(json));
		this.value = json;
	}

	json(includeHidden = true) {
		let json = {};

		let inputs = this.querySelectorAll('[data-key]');
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
			if(input['type'] == 'number'){
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


	async jsonToHtml(template, json, jsonKey = '', options = { style: this.formStyle }) {
		let elements = [];
		if (!Array.isArray(template))
			template = [template];
		for (let item of template) {
			if (typeof item == "string") {
				if (item.indexOf(":") == -1) {
					item = {
						key: null,
						type: item
					};
				}
				else {
					item = {
						key: item.split(':')[0],
						type: item.split(':')[1]
					};
					if (json == null)
						json = {};
				}
			}
			elements.push(await this.oneItem(item, item.key ? json[item.key] : json, item.key ? ((jsonKey ? jsonKey + "." : '') + item.key) : jsonKey, options));
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

	async oneItem(template, json, jsonKey, { style = Form.STYLE.ROW } = {}) {

		let element = document.createElement(style.wrap);

		if (template.hidden) {
			this.changeListeners.push((json) => {
				element.hidden = template.hidden(json, element);
			});
		}

		let render = async ()=>{
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
						html += `<input data-key="${jsonKey}" type="checkbox" ${json ? 'checked' : ''}/>`;
						wrapper.innerHTML = html;
						break;
					case 'toggle':
						html += `<ui-toggle data-key="${jsonKey}" value="${json ?? false}"></ui-toggle>`;
						wrapper.innerHTML = html;
						break;
					case 'list':
						html += `<select data-key="${jsonKey}">`;
						let options = template.options;
						if (!Array.isArray(options))
							options = await options();
						html += options.map(v => `<option 
								${(json == (v.value ? v.value : v)) ? 'selected' : ''}
								value=${v.value ? v.value : v}>${v.name ? v.name : v}</option>`).join('');
						html += `</select>`;
						wrapper.innerHTML = html;
						break;
					case 'text':
						html += `<textarea data-key="${jsonKey}">${json ?? ''}</textarea>`;
						wrapper.innerHTML = html;
						break;
					case 'string':
						let input = utils.htmlToElement(`<input data-key="${jsonKey}" type="text" placeholder="${template.placeholder ?? ''}"/>`);
						input.value = json ?? null;
						wrapper.append(input);
						break;
					case 'number':
						html += `<input data-key="${jsonKey}" type="number" value="${json ?? ''}"/>`;
						wrapper.innerHTML = html;
						break;
					// complex types
					// nested types (compound object)
					case 'compound':
						//
						wrapper.append(...await this.jsonToHtml(template.children, json ?? {}, jsonKey));
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


						let createItem = async (json) => {

							let item = document.createElement('span');
							item.classList.add('item');

							item.append(...await this.jsonToHtml(template.children, json, jsonKey, { style: substyle }));

							item.append(new Button("", () => {
								item.remove();
							}, { icon: 'fa-remove', style: "text", color: "error" }));
							
							let inputs = item.querySelectorAll('[data-key]');
							for (let input of inputs) {
								input.addEventListener('change', this.onChange);
							}

							contain.append(item);
						};
						button.addEventListener('click', () => createItem(Array.isArray(template.children)?{}:null));

						if (Array.isArray(json)) {
							for(let j of json){
								await createItem(j);
							}

						}

						wrapper.append(contain);

						wrapper.append(button);

						break;
				}
			}
			else if (typeof template.type == 'function') {
				let input = new template.type(json);
				input.dataset['key'] = jsonKey;
				wrapper.append(input);
			}

			/*if (element.children.length == 1)
				return element.firstElementChild;*/

			return element;
		};

		if(template.redraw){
			let lastValue = this.value[template.redraw];

			this.changeListeners.push(async (fullJson) => {
				let newValue = fullJson[template.redraw];
				if(lastValue!=newValue){
					element.innerHTML = "";
					await render();
					lastValue = newValue;
				}
			});
		}

		return await render();
	}
}
customElements.define('ui-form', Form);