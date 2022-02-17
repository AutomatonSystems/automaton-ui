import "./Form.css";

import { BasicElement } from "../BasicElement.js";
import { Button } from "./Button.js";
import "./Toggle.js";
import * as utils from "../utils.js";
import UI from "../ui.js";
import { htmlToElement } from "../utils.js";
import { DragHandle } from "../component/DragHandle";
import { Draggable } from "../Mixins.js";
/****** FORM COMPONENTS ******/

interface FormTemplateJSON {
	key?: string,
	name?: string,
	hint?: string,
	placeholder?: string, 
	default?: string,
	disabled?: boolean,
	type?: string | Function,
	format?: string,

	hidden?: Function,
	redraw?: string | string[]

	options?: any[] | Function,

	style?: "INLINE" | "ROW",

	children?: FormTemplate | FormTemplate[],

	afterRender?: Function
};

interface FormArrayTemplate extends FormTemplateJSON{
	type: "array"
	config?: FormArrayConfig
}

interface FormArrayConfig {
	sortable: boolean
}

export type FormTemplate = FormArrayTemplate | FormTemplateJSON | string;

interface FormStyle{ parent: string; wrap: string; label: string; value: string; };

export class Form extends BasicElement {

	static STYLE: Record<string, FormStyle> = {
		ROW: { parent: 'table', wrap: 'tr', label: 'th', value: 'td' },
		INLINE: { parent: <string> null, wrap: 'span', label: 'label', value: 'span' }
	};

	static TRUE_STRINGS = new Set(["true", "1", "yes", "t", "y"]);
	template: FormTemplate | FormTemplate[];
	changeListeners: any[];
	formStyle: FormStyle;
	configuration: {
		formatting: {
			strings: {
				trim: boolean;
			};
		};
	};

	value: any;

	constructor(template: FormTemplate|FormTemplate[]) {
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
		}

		this.value = {};
	}

	async build(json: any) {
		this.value = json;

		this.changeListeners = [];
		let eles = await this.jsonToHtml(this.template, json);
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
	}

	async onChange() {
		let json = this.json();
		this.value = json;
		for(let listener of this.changeListeners)
			await listener(json);
		this.dispatchEvent(new Event('change'));
	}

	json(includeHidden = false) {
		return this._readValue(this, includeHidden);
	}

	_readValue(element: HTMLElement, includeHidden = false){
		let json: any = {};

		let inputs = <NodeListOf<HTMLInputElement>> element.querySelectorAll('[data-key]');
		for (let input of inputs) {
			// skip hidden inputs if required
			if(!includeHidden && input.closest('[hidden]'))
				continue;
			let parent = json;
			// grab the correct place to store this value
			let keys = input['dataset']['key'].split('.');
			let key : string | number = keys.pop();
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
			let value : string | number| boolean | Date = input[input['type'] == 'checkbox' ? 'checked' : 'value'];
			if(typeof value == "string"){
				if(input['type'] == 'text' || input.dataset.format == 'string'){
					if(this.configuration.formatting.strings.trim)
						value = value.trim();
				}
				if(input['type'] == 'number' || input.dataset.format == 'number'){
					value = parseFloat(value);
				}
				if(input['type'] == 'datetime-local' || input.dataset.format == 'datetime'){
					value = new Date(value);
				}
				if(input.dataset.format == 'boolean'){
					value = Form.TRUE_STRINGS.has((value+"").toLowerCase());
				}
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
				} else {
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

	async jsonToHtml(templates: FormTemplate | FormTemplate[], json: any, jsonKey = '', options = { style: this.formStyle }) {
		let elements = [];
		let templatesArray = Array.isArray(templates)?templates:[templates];
		for (let template of templatesArray) {
			let templateJson: FormTemplateJSON;
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
			}else{
				templateJson = template;
			}

			// template value
			let value = (templateJson.key ? json[templateJson.key] : json) ?? templateJson.default;
			
			elements.push(await this.oneItem(templateJson, value, templateJson.key ? ((jsonKey ? jsonKey + "." : '') + templateJson.key) : jsonKey, options));
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

	_readJsonWithKey(json: any, key: string){
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

	async oneItem(template: FormTemplateJSON, itemValue: any, jsonKey: string, { style = Form.STYLE.ROW } = {}) {

		let element = document.createElement(style.wrap);
		element.dataset.element = jsonKey;

		let render = async (elementValue: any)=>{

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
						html += `<ui-toggle data-key="${jsonKey}" value="${elementValue ?? false}"></ui-toggle>`;
						wrapper.innerHTML = html;
						break;
					case "dropdown":
					case "select":
					case 'list':
						html += `<select data-key="${jsonKey}" data-format="${template.format}">`;
						let parsedOptions: any[];
						if (!Array.isArray(template.options))
							parsedOptions = await template.options(this.value);
						else
							parsedOptions = template.options;
						html += parsedOptions.map(v => `<option 
								${(elementValue == (v.value ? v.value : v)) ? 'selected' : ''}
								value="${v.value ? v.value : v}">${v.name ? v.name : v}</option>`).join('');
						html += `</select>`;
						wrapper.innerHTML = html;
						break;
					case 'text':
						html += `<textarea data-key="${jsonKey}">${elementValue ?? ''}</textarea>`;
						wrapper.innerHTML = html;
						break;
					case 'number':
						html += `<input data-key="${jsonKey}" type="number" value="${elementValue ?? ''}"/>`;
						wrapper.innerHTML = html;
						break;
					// complex types
					// nested types (compound object)
					case 'object':
					case 'compound':
						//
						wrapper.append(...await this.jsonToHtml(template.children, elementValue ?? {}, jsonKey));
						break;
					// repeating object
					case 'array':
						// the element repeats multiple times
						jsonKey = jsonKey + "[]";

						let inputConfig: FormArrayTemplate = <FormArrayTemplate> template;

						let tStyle = inputConfig.style ?? 'INLINE';

						let config: FormArrayConfig = inputConfig.config ?? {
							sortable: false
						};

						let substyle = Form.STYLE[tStyle];

						let contain = document.createElement('div');
						contain.classList.add('array');
						contain.classList.add(tStyle);
						// add button
						let button = new Button("Add", null, { icon: 'fa-plus' });


						let createItem = async (itemValue: any) => {

							let item = new BasicElement(null, {clazz: 'item'});

							if(config.sortable){
								let handle = new DragHandle();
								item.prepend(handle);

								item.makeDraggable(jsonKey, null, handle);
								item.onDrop(jsonKey, (draggedItem: HTMLElement)=>{
									// Work out if we are moving up or down the list
									let siblings = [...contain.childNodes];
									let indexA = siblings.indexOf(item);
									let indexB = siblings.indexOf(draggedItem);
									// and move as appropriate
									item.insertAdjacentElement(indexA < indexB?'beforebegin':'afterend', draggedItem);
								});
							}

							item.append(...await this.jsonToHtml(inputConfig.children, itemValue, jsonKey, { style: substyle }));

							item.append(new Button("", () => {
								item.remove();
								this.onChange();
							}, { icon: 'fa-trash', style: "text", color: "error-color" }));
							
							let inputs = item.querySelectorAll('[data-key]');
							for (let input of inputs) {
								input.addEventListener('change', this.onChange);
							}

							contain.append(item);

						};
						button.addEventListener('click', async () => {
							let item = await createItem(Array.isArray(inputConfig.children)?{}:null)
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
					case 'datetime':{
						let input = <HTMLInputElement> utils.htmlToElement(`<input data-key="${jsonKey}" type="datetime-local" placeholder="${template.placeholder ?? ''}"/>`);
						input.value = elementValue ?? new Date().toISOString().substring(0, 16);
						if(template.disabled)
							input.setAttribute('disabled', '');
						wrapper.append(input);
						break;
					}
					case 'string':
					default:{
						let input = <HTMLInputElement> utils.htmlToElement(`<input data-key="${jsonKey}" type="text" placeholder="${template.placeholder ?? ''}"/>`);
						input.value = elementValue ?? null;
						if(template.disabled)
							input.setAttribute('disabled', '');

						// Provide autocomplete options for the input
						if(template.options){
							let parsedOptions: any[];
							if (!Array.isArray(template.options))
								parsedOptions = await template.options(this.value);
							else
								parsedOptions = template.options;
							let id = utils.uuid();
							let list = UI.html(
								`<datalist id="${id}">`
								+ parsedOptions.map(v => `<option 
										${(elementValue == (v.value ? v.value : v)) ? 'selected' : ''}
										value="${v.value ? v.value : v}">${v.name ? v.name : v}</option>`).join('')
								+ '</datalist>');
							wrapper.append(list);
							// by default the list component only shows the items that match the input.value, which isn't very useful for a picker
							input.addEventListener('focus', ()=>input.value = '');
							input.setAttribute('list', id);
						}

						wrapper.append(input);
						break;
					}
				}
			}else if (typeof template.type == 'function') {
				let obj = template.type;
				if(!!obj.prototype && !!obj.prototype.constructor.name){
					// TODO figure out the typoescript safe way to do this...
					// @ts-ignore
					let input = new template.type(elementValue, jsonKey, element);
					input.dataset['key'] = jsonKey;
					wrapper.append(input);
				}else{
					let input = template.type(elementValue, jsonKey, element);
					input.dataset['key'] = jsonKey;
					wrapper.append(input);
				}
			}

			let inputs = element.querySelectorAll('[data-key]');
			for (let input of inputs) {
				input.addEventListener('change', (event)=>{
					event.stopPropagation();
					this.onChange();
				});
			}

			if(template.afterRender){
				template.afterRender(element, this);
			}
		};

		await render(itemValue);

		if (template.hidden) {
			this.changeListeners.push((json: any) => {
				element.hidden = template.hidden(json, element);
			});
		}

		if(template.redraw){
			let redraws = Array.isArray(template.redraw)?template.redraw:[template.redraw];
			for(let redraw of redraws){
				// cache of the previous value
				let lastValue = {};
				// handle change events can filter them
				let changeListener = async (fullJson: any) => {
					
					let newJsonValue = this._readJsonWithKey(fullJson, redraw);
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
		}

		return element;
	}
}
customElements.define('ui-form', Form);