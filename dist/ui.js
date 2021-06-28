const sleep = (time, value)=>new Promise(r=>setTimeout(()=>r(value),time));
window['sleep'] = sleep;

/**
 * Add items onto a element
 * 
 * @param {Element} element 
 * @param {Element|String|Element[]} content 
 */
function append(element, content){
	if(!element || content === undefined || content === null)
		return;
	if(typeof content == 'string' || typeof content == 'number'){
		element.innerHTML = content;
	}else if(Array.isArray(content)){
		content = content.filter(c=>c!==null && c!==undefined);
		element.append(...content);
	}else {
		element.appendChild(content);
	}
}

const IDs = new Set();

function uuid(){
	let id = null;
	do{
		id = "ui-" + Math.random().toString(16).slice(2);
	}while(IDs.has(id) || document.querySelector('#'+id));
	IDs.add(id);
	return id;
}

/**
 * Convert html text to a HTMLElement
 * 
 * @param {String} html 
 * 
 * @returns {HTMLElement}
 */
function htmlToElement(html, wrapper='div'){
	let d = document.createElement(wrapper);
	d.innerHTML = html;
	return d.firstElementChild;
}

/**
 *
 * @param  {...Element} elements
 *
 * @returns {HTMLElement[]}
 */
function castHtmlElements(...elements) {
	return /** @type {HTMLElement[]} */ ([...elements]);
}

/**
 * shuffle the contents of an array
 * 
 * @param {*[]} array 
 */
function shuffle(array) {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

/**
 * Downloads a file to the users machine - must be called from within a click event (or similar)
 * 
 * @param {String} filename 
 * @param {Object} json 
 */
function downloadJson(filename, json){
	const a = document.createElement('a');
	a.href = URL.createObjectURL( new Blob([JSON.stringify(json, null, '\t')], { type:`text/json` }) );
	a.download = filename;
	a.click();
}

/**
 * 
 * Load a script
 * 
 * @param {String} url 
 * 
 * @returns {Promise}
 */
async function dynamicallyLoadScript(url) {
	return new Promise(res=>{
		var script = document.createElement('script');  // create a script DOM node
		script.src = url;  // set its src to the provided URL
		script.onreadystatechange = res;
		script.onload = res;
		document.head.appendChild(script);  
	});
}

var utils = /*#__PURE__*/Object.freeze({
	__proto__: null,
	sleep: sleep,
	append: append,
	uuid: uuid,
	htmlToElement: htmlToElement,
	castHtmlElements: castHtmlElements,
	shuffle: shuffle,
	downloadJson: downloadJson,
	dynamicallyLoadScript: dynamicallyLoadScript
});

class BasicElement extends HTMLElement {
	constructor(content, {clazz=''}={}) {
		super();

		this.self = this;

		if(content != null){
			if(Array.isArray(content)){
				append(this, content);
			}else if (typeof content == 'string') {
				this.innerHTML = content;
			}else {
				this.append(content);
			}
		}

		if (clazz) {
			this.classList.add(...clazz.split(" "));
		}

		this.remove = this.remove.bind(this);

		this.intervals = [];
	}

	/**
	 * Starts a interval timer that will stop when this element is no longer on the DOM
	 * 
	 * @param {*} callback 
	 * @param {Number} time in ms
	 * 
	 * @returns {Number} interval id.
	 */
	setInterval(callback, time){
		let id = setInterval(()=>{
			if(!document.body.contains(this)){
				this.intervals.forEach(i=>clearInterval(i));
			}else {
				callback();
			}
		}, time);
		this.intervals.push(id);
		return id;
	}

    /**
     *
     * @param {String} variable
     *
     * @returns {String}
     */
	css(variable) {
		let value = getComputedStyle(this).getPropertyValue(variable);
		if(!value)
			value = this.style.getPropertyValue(variable);
		// everything else
		return value;
	}

    /**
     *
     * @param {String} variable
     *
     * @returns {Number}
     */
	cssNumber(variable) {
		let value = this.css(variable);

		let number = parseFloat(value);
		// timings
		if (value.endsWith('ms')) {
			return number;
		}
		else if (value.endsWith('s')) {
			return number * 1000;
		}
		// everything else
		return number;
	}

	setCss(name, value){
		this.style.setProperty(name, value);
	}

	getCss(name){
		this.style.getPropertyValue(name);
	}

	get visible() {
		return this.self.hidden == false;
	}

    /**
     * @param {Boolean} boolean
     */
	set visible(boolean) {
		if (boolean) {
			this.self.removeAttribute("hidden");
		}
		else {
			this.self.setAttribute("hidden", '');
		}
	}

	show(parent = null) {
		// attach to dom if I haven't already
		this.self.attach(parent);
		// and show
		this.self.visible = true;
		return this;
	}

	hide() {
		this.self.visible = false;
		return this;
	}

	remove() {
		this.self.parentElement?.removeChild(this.self);
		return this;
	}

    /**
     * Walk up dom tree looking for a closable element
     */
	close() {
		let ele = this.parentElement;
		while (ele['close'] == null) {
			ele = ele.parentElement;
			if(ele == null)
				return this;
		}
		ele['close']();
		return this;
	}

	attach(parent = null) {
		if (!this.self.parentElement) {
			if (parent == null)
				parent = document.body;
			parent.appendChild(this.self);
		}
		return this;
	}

	/**
	 * 
	 * @param {String} string 
	 * 
	 * @returns {HTMLElement}
	 */
	querySelector(string){
		return super.querySelector(string);
	}

	/**
	 * 
	 * @param {String} string 
	 * 
	 * @returns {NodeList<HTMLElement>}
	 */
	querySelectorAll(string){
		return super.querySelectorAll(string);
	}

    /**
     *
     * @param  {...Element} elements
     *
     * @returns {HTMLElement[]}
     */
	static castHtmlElements(...elements) {
		return /** @type {HTMLElement[]} */ ([...elements]);
	}


	/****** DROP LOGIC - TODO move to a behaviour class ********/

	#dropTypeSet = new Set();
	droppable = false;

	makeDraggable(type='element', data = null){
		this.draggable = true;

		this.addEventListener('dragstart', (event)=>{
			if(data == null){
				if(this.dataset['drag'] == null){
					let id = "D_"+Math.floor(1_000_000*Math.random()).toString(16);
					// TODO collision detection
					this.dataset['drag'] = id;
				}
				let selector = `[data-drag="${this.dataset['drag']}"]`;
				event.dataTransfer.setData(type, selector);
			}else {
				event.dataTransfer.setData(type, data);
			}
		});
	}

	makeDroppable(){
		this.droppable = true;
		let handler = (event)=>{
			let types = event.dataTransfer.types;
			for(let type of this.#dropTypeSet){
				if(types.includes(type)){
					event.preventDefault();
					return;
				}
			}
		};
		this.addEventListener('dragenter', handler);
		this.addEventListener('dragover', handler);
	}

	onDragOver(type, behaviour){
		type = type.toLowerCase();
		if(!this.droppable)
			this.makeDroppable();
		this.#dropTypeSet.add(type);
		this.addEventListener('dragover', (event)=>{
			let data = event.dataTransfer.getData(type);
			if(data == "")
				return;
			if(data.startsWith('[data-drag')){
				data = document.querySelector(data);
			}
			behaviour(data, event);
		});
	}

	onDrop(type, behaviour){
		type = type.toLowerCase();
		if(!this.droppable)
			this.makeDroppable();
		this.#dropTypeSet.add(type);
		this.addEventListener('drop', (event)=>{
			let data = event.dataTransfer.getData(type);
			if(data == "")
				return;
			if(data.startsWith('[data-drag')){
				data = document.querySelector(data);
			}
			behaviour(data, event);
		});
	}
}
customElements.define('ui-basic', BasicElement);

class Button extends BasicElement {

    /**
     *
     * @param {String|HTMLElement} content
     * @param {EventListenerOrEventListenerObject|String} callback callback when the button is clicked
     * @param {{icon?: String, style?: String, color?: String|boolean}} options
     */
	constructor(content, callback, { icon = '', style = 'button', color = false } = {}) {
		super(content);

		if(typeof callback == "string"){
			// create link like behaviour (left click open; middle/ctrl+click new tab)
			this.addEventListener('click', (e)=>{
				// control key
				if(e.ctrlKey){
					window.open(callback);
				}else {
					// otherwise
					location.href = callback;
				}
			});
			this.addEventListener('auxclick', (e)=>{
				// middle click
				if(e.button == 1){
					window.open(callback);
				}
			});
			this.addEventListener('mousedown',(e)=>{
				if(e.button == 1){
					// on windows middlemouse down bring up the scroll widget; disable that
					e.preventDefault();
				}
			});
		}else {
			// fire the provided event
			this.addEventListener('click', callback);
		}

		this.classList.add(style);
		if (color)
			this.classList.add(color);

		icon = icon || this.attributes.getNamedItem("icon")?.value;
		if (icon) {
			let i = document.createElement('i');
			let classes = icon.trim().split(" ");
			// include the default font-awesome class if one wasn't provided
			if(!classes.includes('fa') && !classes.includes('fab') && !classes.includes('fas'))
				i.classList.add('fa');
			i.classList.add(...classes);
			this.prepend(i);

			if(content=='')
				i.classList.add('icon-only');
		}
		
	}

}
customElements.define('ui-button', Button);

class Toggle extends BasicElement {
	constructor(v, changeCallback) {
		super(`<input type="checkbox"/><div><span></span></div>`);
		this.value = v ?? (this.attributes.getNamedItem("value")?.value == "true");

		if(changeCallback){
			this.querySelector('input').addEventListener('change', ()=>{
				changeCallback(this.value);
			});
		}
	}

	get value() {
		return this.querySelector('input').checked;
	}

	set value(b) {
		this.querySelector('input').checked = b;
	}
}
customElements.define('ui-toggle', Toggle);

/****** FORM COMPONENTS ******/
class Form extends BasicElement {

	static STYLE = {
		ROW: { parent: 'table', wrap: 'tr', label: 'th', value: 'td' },
		INLINE: { parent: null, wrap: 'span', label: 'label', value: 'span' }
	};

	static TRUE_STRINGS = new Set("true", "1", "yes", "t", "y");


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

	async build(json) {
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

	_readValue(element, includeHidden = false){
		let json = {};

		let inputs = element.querySelectorAll('[data-key]');
		for (let input of inputs) {
			// skip hidden inputs if required
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
			if(input['type'] == 'text' || input.dataset.format == 'string'){
				if(this.configuration.formatting.strings.trim)
					value = value.trim();
			}
			if(input['type'] == 'number' || input.dataset.format == 'number'){
				value = parseFloat(value);
			}
			if(input.dataset.format == 'boolean'){
				value = TRUE_STRINGS.has(value?.toLowercase());
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
				}else {
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
		element.dataset.element = jsonKey;

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
						let options = template.options;
						if (!Array.isArray(options))
							options = await options(this.value);
						html += options.map(v => `<option 
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
								this.onChange();
							}, { icon: 'fa-trash', style: "text", color: "error-color" }));
							
							let inputs = item.querySelectorAll('[data-key]');
							for (let input of inputs) {
								input.addEventListener('change', this.onChange);
							}

							contain.append(item);

						};
						button.addEventListener('click', async () => {
							let item = await createItem(Array.isArray(template.children)?{}:null);
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
					case 'string':
					default:
						let input = htmlToElement(`<input data-key="${jsonKey}" type="text" placeholder="${template.placeholder ?? ''}"/>`);
						input.value = elementValue ?? null;
						if(template.disabled)
							input.setAttribute('disabled', '');

						// Provide autocomplete options for the input
						if(template.options){
							let options = template.options;
							if (!Array.isArray(options))
								options = await options(this.value);
							let id = uuid();
							let list = UI.html(
								`<datalist id="${id}">`
								+ options.map(v => `<option 
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
			}else if (typeof template.type == 'function') {
				let obj = template.type;
				if(!!obj.prototype && !!obj.prototype.constructor.name){
					let input = new template.type(elementValue, jsonKey, element);
					input.dataset['key'] = jsonKey;
					wrapper.append(input);
				}else {
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
				template.afterRender(element, this.value, this);
			}
		};

		await render(itemValue);

		if (template.hidden) {
			this.changeListeners.push((json) => {
				element.hidden = template.hidden(json, element);
			});
		}

		if(template.redraw){
			let redraws = Array.isArray(template.redraw)?template.redraw:[template.redraw];
			for(let redraw of redraws){
				// cache of the previous value
				let lastValue = {};
				// handle change events can filter them
				let changeListener = async (fullJson) => {
					
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

class Panel extends BasicElement {

    /**
     *
     * @param {String|Element|Element[]} content
     * @param {{title?: String, clazz?: String, buttons?: String, header?: boolean, footer?: boolean}} param1
     */
	constructor(content = '', { title = '', clazz = '', buttons = '', header = false, footer = false} = {}) {
		super();

		this.setAttribute("ui-panel", '');

		if (!this.innerHTML.trim()) {
			this.innerHTML = `
				${(header || title)? `<header>${title}</header>` : ''}
				<content></content>
				${(footer || buttons)? `<footer>${buttons}</footer>` : ''}
			`;

			append(this.content, content);
		}

		if (clazz) {
			this.classList.add(clazz);
		}
	}

	get content(){
		return this.querySelector('content');
	}

	/**
	 * 
	 * @param  {...String|HTMLElement} elements 
	 */
	append(...elements) {
		append(this.content, elements);
	}

	header(...elements){
		append(this.querySelector('header'), elements);
	}

	footer(...elements){
		append(this.querySelector('footer'), elements);
	}
}
customElements.define('ui-panel', Panel);

class Splash extends BasicElement {

	constructor(content, { dismissable = false } = {}) {
		super(content);

		if (dismissable) {
			this.addEventListener('mousedown', this.remove);
		}
	}
}
customElements.define('ui-splash', Splash);

class Modal extends Splash {
	constructor(content, { title = '', clazz = '', buttons = '', dismissable = true, header = false, footer = false } = {}) {
		super('', { dismissable: dismissable });

		this.setAttribute("ui-modal", '');

		let panel = new Panel(content, { title, clazz, buttons, header, footer});
		panel.addEventListener("mousedown", () => event.stopPropagation());
		// rebind panel to parent splash so hide/show etc call parent
		panel.self = this;
		this.appendChild(panel);
	}

	/**
	 * @type {Panel}
	 */
	get panel(){
		return this.querySelector("ui-panel");
	}

	close() {
		this.self.remove();
		return this;
	}
}
customElements.define('ui-modal', Modal);

class Toaster extends BasicElement{
	constructor(){
		super();
		this.attach();
	}
}
customElements.define('ui-toaster', Toaster);

function parseMessage(msg, topLevel = false){
	if(Array.isArray(msg) && topLevel === true){
		return msg.map(parseMessage).join(' ');
	}else if(typeof msg === 'object'){
		return JSON.stringify(msg, null, '\t');
	}else {
		return ""+ msg;
	}
}

class Toast extends BasicElement {
	constructor(message, { level = 'info' } = {}) {
		super(parseMessage(message, true));

		let i = document.createElement('i');
		let icon = { 'debug': 'fa-bug', 'info': 'fa-info-circle', 'warn': 'fa-exclamation-circle', 'error': 'fa-exclamation-triangle', 'success': 'fa-check-circle' }[level];
		i.classList.add("fa", icon);
		this.prepend(i);

		if (!document.querySelector('ui-toaster')) {
			new Toaster();
		}
		let toaster = document.querySelector('ui-toaster');

		this.classList.add(level);
		toaster.prepend(this);
		let count = document.querySelectorAll('ui-toast').length;
		setTimeout(() => this.style.marginTop = '10px', 10);
		setTimeout(() => { this.style.marginTop = '-50px'; this.style.opacity = '0'; }, 4800);
		setTimeout(() => this.remove(), 5000);
	}
}
customElements.define('ui-toast', Toast);

// ! utility methods for common patterns

/**
 * 
 * @param {*} template 
 * @param {*} param1 
 * 
 * @returns {Promise<*>} returns the response from the user (the populated form json)
 */
async function popupForm(template, {
		value = {},
		title = null,
		submitText = "Submit",
		wrapper = null,
		dismissable = true
}={}){
	return new Promise(res=>{
		let form = new Form(template);
		form.build(value).then(()=>{
			let body = form;
			if(wrapper)
				body = wrapper(body);
			let modal = new Modal(body, {
				title: title, 
				buttons: '<ui-cancel></ui-cancel><ui-spacer></ui-spacer>',
				dismissable: dismissable
			});
			modal.close = ()=>{
				modal.self.remove();
				res(null);
			};
			modal.panel.footer(new Button(submitText, ()=>{
				modal.self.remove();
				res(form.json());
			}));
			modal.show();
		});
	})
}

function info(...args){
	new Toast(args, {level: 'info'});
}

function warn(...args){
	new Toast(args, {level: 'warn'});
}

function error(...args){
	new Toast(args, {level: 'error'});
}

var factory = /*#__PURE__*/Object.freeze({
	__proto__: null,
	popupForm: popupForm,
	info: info,
	warn: warn,
	error: error
});

class Badge extends BasicElement {
	constructor(content, { icon = '', clazz = ''} = {}) {
		super(content, {clazz});

		icon = icon || this.attributes.getNamedItem("icon")?.value;
		if (icon) {
			let i = document.createElement('i');
			let classes = icon.trim().split(" ");
			// include the default font-awesome class if one wasn't provided
			if(!classes.includes('fa') && !classes.includes('fab') && !classes.includes('fas'))
				i.classList.add('fa');
			i.classList.add(...classes);
			this.prepend(i);
		}

	}
}
customElements.define('ui-badge', Badge);

class Cancel extends BasicElement {
	constructor() {
		super();

		this.innerHTML = this.innerHTML || "Cancel";

		this.addEventListener('click', this.close.bind(this));
	}
}
customElements.define('ui-cancel', Cancel);

class Card extends BasicElement {
	constructor(content) {
		super();

		this.setAttribute("ui-card", '');

		let con = content || this.innerHTML;
		this.innerHTML = `<div class="card"></div>`;
		this.setContent(con);

	}

	setContent(content) {
		if (typeof content == 'string') {
			this.querySelector('.card').innerHTML = content ?? '';
		}else {
			this.querySelector('.card').append(content);
		}
	}


	async flip() {
		this.flipped = !this.flipped;
		let v = this.cssNumber('--duration');
		return new Promise(res => setTimeout(res, v));
	}

	get flipped() {
		return this.getAttribute("flipped") == null;
	}

	set flipped(bool) {
		if (bool) {
			this.removeAttribute("flipped");
		}
		else {
			this.setAttribute("flipped", '');
		}
	}
}
customElements.define('ui-card', Card);

function createURLWorkerFactory(url) {
    return function WorkerFactory(options) {
        return new Worker(url, options);
    };
}

var WorkerFactory = createURLWorkerFactory('web-worker-0.js');
/* eslint-enable */

class Code extends BasicElement {

	constructor(content) {
		super(content);

		this.setContent(content || this.innerHTML);
	}

	preprocess(content) {
		return content;
	}

	setContent(content){
		content = this.preprocess(content);
		// send the stuff off to a webworker to be prettified
		let worker = new WorkerFactory();
		worker.onmessage = (event) => {
			this.classList.add('hljs');
			this.innerHTML = event.data;
		};
		worker.postMessage(content);
	}
}
customElements.define('ui-code', Code);

/**
 * Context menu replacement
 * 
 * ```
 * new ContextMenu(document.body)
 *      .addItem("Hello", ()=>{alert("hello")})
 *      .addBreak();
 * ```
 * 
 * The returned menu can be attached to multiple elements
 * ```
 *    menu.for(extraElement);
 * ```
 * 
 */
class ContextMenu extends BasicElement {

	// when active the element this is active for
	target;

	items = [];

	//
	#attachments = new WeakMap();

	constructor(element = null){
		super('<section></section>');

		this.hide = this.hide.bind(this);

		this.hide();

		for(let event of ["click", "contextmenu"]){
			this.addEventListener(event, this.hide);
			this.firstElementChild.addEventListener(event, (event)=>{event.stopPropagation();});
		}

		if(element){
			this.for(element);
		}
	}

	/**
	 * Add the context menu to show on the provided element context events
	 * 
	 * @param {HTMLElement} element 
	 */
	for(element){
		let listener = (event)=>{
			
			// prevent the default contextmenu
			event.preventDefault();

			this.renderMenu(element, event.pageX, event.pageY);
			// setup the hide behaviour
		};
		element.addEventListener("contextmenu", listener);
		element.setAttribute("context-menu", '');
		this.#attachments.set(element, listener);
		return this;
	}

	renderMenu(element, x,y){
		this.target = element;
			
		// work out where to place the menu
		let w = window.innerWidth;
		let h = window.innerHeight;

		let right = x < w*0.75;
		let down = y < h*0.5;

		// show the menu
		this.style.left = right?(x + "px"):null;
		this.style.right = right?null:((w-x) + "px");
		this.style.top = down?(y + "px"):null;
		this.style.bottom = down?null:((h-y) + "px");

		let hasItem = false;
		for(let item of this.items){
			item.element.hidden = item.hide && item.hide(element);
			hasItem = hasItem || !item.element.hidden;
		}

		if(hasItem)
			this.show();
	}

	detach(element){
		let listener = this.#attachments.get(element);
		if(listener){
			element.removeAttribute("context-menu", '');
			element.removeEventListener("contextmenu", listener);
		}
	}

	/**
	 * Add a new item to the context menu
	 * 
	 * @param {String} text 
	 * @param {Function} action 
	 * @param {Function} hide
	 */
	addItem(text, action, hide = false){
		let item = htmlToElement(`<div>${text}</div>`);
		this.items.push({
			element: item,
			hide: hide
		});
		item.addEventListener('click', ()=>{action(this.target); this.hide();});
		this.firstElementChild.appendChild(item);
		return this;
	}

	/**
	 * Add a line break to the context menu
	 */
	addBreak(){
		this.firstElementChild.appendChild(htmlToElement(`<hr/>`));
		return this;
	}

	clearMenuItems(){
		this.items = [];
		this.firstElementChild.innerHTML = "";
	}

}
customElements.define('ui-context', ContextMenu);

class Grid extends BasicElement{

	#columns = 0;
	#rows = 0;

	/**
	 * @param {{padding?: string, columnGap?: string, rowGap?: string}}
	 */
	constructor({padding, columnGap, rowGap}= {}){
		super();

		this.setAttribute('ui-grid', '');
		
		if(padding !== undefined){
			this.setCss('--padding', padding);
		}

		if(rowGap !== undefined){
			this.setCss('row-gap', rowGap);
		}

		if(columnGap !== undefined){
			this.setCss('column-gap', columnGap);
		}
	}

	get columns(){
		return this.#columns;
	}

	set columns(n){
		this.#columns = n;
		this.setCss('--columns', n);
	}

	get rows(){
		return this.#rows;
	}

	set rows(n){
		this.#columns = n;
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
	put(element, row, column, width=1, height=1){
		// auto expand rows
		if(this.rows < row + height - 1){
			this.rows = row + height - 1;
		}
		// auto expand rows
		if(this.columns < column + width - 1){
			this.columns = column + width - 1;
		}
		if(Array.isArray(element)){
			element = new UI.BasicElement(element);
			element.style.display = "flex";
		}
		element.style.setProperty('grid-area', `${row} / ${column} / span ${height} / span ${width}`);
		this.append(element);
	}
}
customElements.define('ui-grid', Grid);

class AbstractInput extends BasicElement{

	/**
	 * 
	 * @param {*} obj json object/array to keep up to date
	 * @param {*} key json key/indes to keep up to date
	 * @param {{callback?: Function, size?:Number, color?:String, placeholder?:string}} params configuration parameters 
	 */
	constructor(obj, key, params){
		super();

		this.obj = obj;
		this.key = key;

		this.setAttribute("ui-input", '');
	}

	get value(){
		return Reflect.get(this.obj, this.key);
	}

	set value(value){
		Reflect.set(this.obj, this.key, value);
	}

	/**
	 * 
	 * @param {String} name 
	 * 
	 * @returns {InputLabel}
	 */
	label(name){
		return new InputLabel(this, name, {wrapped: true});
	}
}

class AbstractHTMLInput extends HTMLInputElement{


	/**
	 * 
	 * @param {*} obj json object/array to keep up to date
	 * @param {*} key json key/indes to keep up to date
	 * @param {{callback?: Function, size?:Number, color?:String, placeholder?:string}} params configuration parameters 
	 */
	constructor(obj, key, params){
		super();

		this.setAttribute("ui-input", '');
	}

	/**
	 * 
	 * @param {String} name 
	 * 
	 * @returns {InputLabel}
	 */
	label(name){
		return new InputLabel(this, name, {wrapped: true});
	}
}

class StringInput extends AbstractHTMLInput{

	/**
	 * 
	 * @param {*} obj json object/array to keep up to date
	 * @param {*} key json key/indes to keep up to date
	 * @param {{callback?: Function, size?:Number, color?:String, placeholder?:string}} params configuration parameters 
	 */
	constructor(obj, key, {callback=null, size=null, color=null, placeholder=null} = {}){
		super();

		this.type = "text";
		
		this.value = Reflect.get(obj, key) ?? null;

		if(size)
			this.style.width = (size*24)+"px";
		
		if(color)
			this.style.setProperty('--color', color);

		if(placeholder)
			this.setAttribute('placeholder', placeholder);

		this.addEventListener('change', ()=>{
			let value = this.value;
			Reflect.set(obj, key, value);
			if(callback)
				callback(value);
		});
	}
}
customElements.define('ui-stringinput', StringInput, {extends:'input'});


/**
 * A number input that keeps a json object 
 * up to date with it's value
 * 
 */
class NumberInput extends AbstractHTMLInput{

	/**
	 * 
	 * @param {*} obj json object/array to keep up to date
	 * @param {*} key json key/indes to keep up to date
	 * @param {{callback?: Function, size?:Number, color?:String, placeholder?:string}} params configuration parameters 
	 */
	constructor(obj, key, {callback=null, size=null, color=null, placeholder=null} = {}){
		super();

		this.type = "number";
		
		this.value = Reflect.get(obj, key);

		if(size)
			this.style.width = (size*24)+"px";
		
		if(color)
			this.style.setProperty('--color', color);

		if(placeholder)
			this.setAttribute('placeholder', placeholder);

		this.addEventListener('change', ()=>{
			let value = parseFloat(this.value);
			Reflect.set(obj, key, value);
			if(callback)
				callback(value);
		});
	}
	
}
customElements.define('ui-numberinput', NumberInput, {extends:'input'});

class SelectInput extends HTMLSelectElement{

	_value = null;

	constructor(obj, key, {options=[], callback=null, size=null, color=null, placeholder=null} = {}){
		super(obj, key);
		this.obj = obj;
		this.key = key;

		this.setAttribute("ui-input", '');

		if(size)
			this.style.width = (size*24)+"px";
		
		if(color)
			this.style.setProperty('--color', color);

		if(placeholder)
			this.setAttribute('placeholder', placeholder);

		this.addEventListener('change', ()=>{
			let value = this.value;
			this.setValue(value);
			if(callback)
				callback(value);
		});

		this.renderOptions(options);
	}

	getValue(){
		return Reflect.get(this.obj, this.key) ?? null;
	}

	setValue(value){
		Reflect.set(this.obj, this.key, value);
	}
	async renderOptions(options){
		if(typeof options == 'function'){
			options = await options();
		}
		let value = this.getValue();
		for(let opt of options){
			let option = document.createElement('option');
			if(opt && opt.hasOwnProperty('value')){
				if(opt.value == value)
					option.setAttribute('selected', '');
				option.innerText = opt.display ?? opt.value;
			}else {
				if(opt == value)
					option.setAttribute('selected', '');
				option.innerText = opt;
			}
			this.append(option);
		}
	}
}
customElements.define('ui-selectinput', SelectInput, {extends:'select'});

class MultiSelectInput extends AbstractInput{
	constructor(obj, key, {options}){
		super(obj, key);

		if(!Array.isArray(this.value))
			this.value = [];

		let list = document.createElement("content");
		this.list = list;
		this.append(list);

		// picker
		// TODO other string picker options
		let select = document.createElement("select");
		select.innerHTML = "<option selected disabled hidden>Add...</option>"+options.map(o=>`<option>${o}</option>`).join('');
		select.addEventListener("change", ()=>{
			this.value.push(select.value);
			select.value = "Add...";
			this.renderList();
		});
		this.append(select);

		this.renderList();
	}

	renderList(){
		this.list.innerHTML = "";
		this.list.append(...this.value.map((v, index)=>{
			let badge = new UI.Badge(v);
			badge.append(new UI.Button('', ()=>{
				// remove this item and redraw
				this.value.splice(index, 1);
				this.renderList();
			}, {icon: 'fa-times', style: 'text', color: 'error-color'}));
			return badge;
		}));
	}
}
customElements.define('ui-multiselectinput', MultiSelectInput);

class JsonInput extends AbstractInput{

	constructor(obj, key){
		super(obj, key);

		let text = document.createElement('textarea');
		text.onkeydown = function(e){
			if(e.key=='Tab'){
				e.preventDefault();
				let s = this.selectionStart;
				this.value = this.value.substring(0,this.selectionStart) + "\t" + this.value.substring(this.selectionEnd);
				this.selectionEnd = s+1; 
			}
		};
		let resize = ()=>{
			text.style["height"] = "1px";
			text.style["height"] = text.scrollHeight+"px";
		};
		text.onkeyup = resize;
		text.addEventListener('change', ()=>{
			try{
				let json = JSON.parse(text.value);
				this.value = json;
				this.classList.toggle('error', false);
			}catch(e){
				this.classList.toggle('error', true);
			}
		});
		text.value = JSON.stringify(this.value ?? "", null, "\t");
		this.append(text);

		setTimeout(resize, 10);
	}


}
customElements.define('ui-json-input', JsonInput);

class InputLabel extends HTMLLabelElement{

	/** @type {AbstractInput} */
	input;

	/**
	 * 
	 * @param {AbstractInput} inputElement 
	 * @param {String} display 
	 * @param {{wrapped?:boolean}}
	 */
	constructor(inputElement, display, {wrapped = false}= {}){
		super();

		if(wrapped){
			// wrap the item with the label
			this.innerHTML = `<span class="label">${display}</span>`;
			this.append(inputElement);
		}else {

			let id = inputElement.id;
			if(id==null){
				// generate a (likely) unique id and use it
				id =  "ui-" + Math.random().toString(16).slice(2);
				inputElement.id = id;
			}

			this.setAttribute('for', id);

			this.innerText = display;
		}
	}

	get value(){
		return this.input.value;
	}

	set value(v){
		this.input.value = v;
	}
}
customElements.define('ui-label', InputLabel, {extends:'label'});

class LabelledInput extends InputLabel{

	/**
	 * 
	 * @param {*} json 
	 * @param {String} key 
	 * @param {typeof AbstractInput| typeof AbstractHTMLInput} type 
	 * @param {*} options 
	 */
	constructor(json, key, type, options={}){
		super(new type(json, key, options), options.name ?? key, {wrapped: true});
	}
}
customElements.define('ui-labelledinput', LabelledInput, {extends:'label'});

/**
 * @typedef {typeof AbstractInput|[typeof AbstractInput, {}]} TemplateParam
 */

/**
 * @typedef {Object.<string, (TemplateParam|Object.<string, TemplateParam>)>} Template
 */

class Form2 extends Grid {

	json;

	/**
	 * 
	 * @param {Template} template 
	 * @param {*} json 
	 * @param {*} options 
	 */
	constructor(template, json, options){
		super();

		this.json = json;

		this.build(template, json);
	}

	build(template, json){
		console.log("build", template, json);
		for(let key of Object.keys(template)){
			let pattern = template[key];
			
			if(typeof pattern == 'function'){
				// shorthand - a direct type declaration
				this.append(new LabelledInput(json, key, pattern));
			}else if(Array.isArray(pattern)){
				// a component has been named to deal with this - handover to it
				this.append(new LabelledInput(json, key, pattern[0], pattern[1]));
			}else {
				// compounded type....
				let subJson = Reflect.get(json, key);
				// initalize nulls
				if(subJson == null){
					subJson = {};
					Reflect.set(json, key, subJson);
				}
				// build a component for this pattern
				this.build(pattern, subJson);
			}
		}
	}

	get value(){
		return this.json;
	}

}
customElements.define('ui-form2', Form2);

class HashHandler{

	/** @type {RegExp}*/
	path;

	/** @type {} */
	pathVariables = [];

	func;

	constructor(path, func){
		// extract path args
		while(path.includes('{')){
			let variable = path.substring(path.indexOf('{'), path.indexOf('}')+1);
			path = path.replace(variable, "([^/]*)");
			this.pathVariables.push(HashHandler.v(variable.substring(1,variable.length-1)));
		}
		
		this.path = new RegExp(path);
	
		this.func = func;
	}

	/**
	 * 
	 * @param {Number|Boolean|Object} input 
	 * 
	 * @returns {{name: String, set: Function}}
	 */
	static v(input){
		let [name,type] = input.split(':');
		return {
			name: name,
			set: (obj, value)=>{
				if(!value)
					return;
				switch(type){
					case 'number':
						value = parseFloat(value);
						break;
					case 'boolean':
						value = (value.toLowerCase() == 'true');	
						break;
					case 'json':
						value = JSON.parse(value);	
						break;
				}
				obj[name] = value;
			}
		}
		
	}

	/**
	 * @param {String} path 
	 * 
	 * @returns {Promise<[Element,number]|false>}
	 */
	async handle(path, oldPath){

		let parts = path.match(this.path);
		// if no match or it didn't match the whole string
		if(!parts || parts[0].length != path.length)
			return false;

		// compute vars
		let args = {};
		parts.shift();
		for(let v of this.pathVariables)
			v.set(args, parts.shift());

		// and call the function
		return await this.func(args);
	}
}

/**
 * @example
 * 
 * ```
 * let hash = new HashManager();
 * handler('home', ()=>new Panel("home"));
 * handler('settings', ()=>new Panel("settings"));
 * hash.attach(document.body);
 * ```
 */
class HashManager extends BasicElement {


	key = null;
	hash = null;
	depth = 0;

	eventlistener;

	/** @type {HashHandler[]} */
	handlers = [];

	position = [0,0];

	static DIRECTION = {
		NONE: 0,

		LEFT: 1,
		RIGHT: 2,
		BOTTOM: 3,
		TOP: 4,

		RANDOM: 100
	};


	static Handler = HashHandler;

	constructor(key=null) {
		super();
		this.key = key;

		this.eventlistener = () => this.hashChange();

		window.addEventListener('hashchange', this.eventlistener);
	}

	static read(pathlike){
		let [path, type] = pathlike.split(':');
		let hash = window.location.hash.substring(1);
		let pairs = hash.split('|').filter(i=>i!='').map(pair=>pair.includes('=')?pair.split('=',2):[null,pair]);
		let pair = pairs.find(i=>i[0]==path);

		let value = pair?.[1];

		if(value){
			switch(type){
				case 'number':
					value = parseFloat(value);
					break;
				case 'boolean':
					value = (value.toLowerCase() == 'true');	
					break;
				case 'json':
					value = JSON.parse(value);	
					break;
			}
		}

		return value;
	}

	remove(){
		super.remove();
		window.removeEventListener('hashchange', this.eventlistener);
		return this;
	}
	
	get value(){
		return this.hash;
	}

	handler(path, func){
		this.handlers.push(new HashHandler(path, func));
		return this;
	}

	addHandler(h) {
		this.handlers.push(h);
	}

	set(value){
		let hash = window.location.hash.substring(1);
		let pairs = hash.split('|').filter(i=>i!='').map(pair=>pair.includes('=')?pair.split('=',2):[null,pair]);
		let pair = pairs.find(i=>i[0]==this.key);
		if(pair == null){
			pair = [this.key,null];
			pairs.push(pair);
		}
		pair[1] = value;

		window.location.hash = pairs.map(p=>p[0]?p.join('='):p[1]).join('|');
	}

	async hashChange() {
		let hash = window.location.hash.substring(1);
		let pairs = hash.split('|').map(pair=>pair.includes('=')?pair.split('=',2):[null,pair]);

		let pair = pairs.find(i=>i[0]==this.key);
		if(pair == null)
			pair = [this.key,""];
		let newHash = pair[1];
		let oldHash = this.hash;
		
		this.hash = newHash;

		if(this.hash == oldHash)
			return;

		// work out the new content
		for (let handler of this.handlers) {
			let result = await handler.handle(newHash, oldHash);
			if (result) {
				if(Array.isArray(result)){
					await this.swapContent(result[0], result[1]);
				}else {
					await this.swapContent(result, null);
				}
				break;
			}
		}

	}

	/**
	 * 
	 * @param {*} body 
	 * @param {Number|[Number,Number]} direction 
	 */
	async swapContent(body, direction = HashManager.DIRECTION.RIGHT) {
		let content = document.createElement('content');

		append(content, body);

		if (this.firstElementChild == null)
			return this.appendChild(content);

		if(direction == null){
			this.firstElementChild.remove();
			this.appendChild(content);
			return;
		}

		let enter, exit;
		if (direction == HashManager.DIRECTION.RANDOM) {
			let dirs = [HashManager.DIRECTION.RIGHT, HashManager.DIRECTION.LEFT, HashManager.DIRECTION.TOP, HashManager.DIRECTION.BOTTOM];
			direction = dirs[Math.floor(Math.random() * dirs.length)];
		}
		if(Array.isArray(direction)){
			console.log(this.position, direction);
			let newPosition = direction;
			// positional slide mode
			if(this.position[0] != direction[0]){
				if(this.position[0] > direction[0]){
					direction = HashManager.DIRECTION.LEFT;
				}else {
					direction = HashManager.DIRECTION.RIGHT;
				}
			}else if(this.position[1] != direction[1]){
				if(this.position[1] < direction[1]){
					direction = HashManager.DIRECTION.BOTTOM;
				}else {
					direction = HashManager.DIRECTION.TOP;
				}
			}else {
				// both the same... thanks
				direction = HashManager.DIRECTION.RIGHT;
			}
			this.position = newPosition;
		}
		switch (direction) {
			case HashManager.DIRECTION.RIGHT:
				[enter, exit] = ['right', 'left'];
				break;
			case HashManager.DIRECTION.LEFT:
				[enter, exit] = ['left', 'right'];
				break;
			case HashManager.DIRECTION.TOP:
				[enter, exit] = ['top', 'bottom'];
				break;
			case HashManager.DIRECTION.BOTTOM:
				[enter, exit] = ['bottom', 'top'];
				break;
		}

		// how long the animation will take is defined in css
		let timing = this.cssNumber('--timing');

		// add new content in start position
		content.classList.add(enter);
		this.appendChild(content);

		// later...
		sleep(50).then(() => {
			// slide in new content
			content.classList.remove(enter);

			// and slide old content out
			this.firstElementChild.classList.add(exit);

			// remove old content once done
			setTimeout(() => this.firstElementChild.remove(), timing);
		});

	}
}

customElements.define('ui-hash', HashManager);

class Json extends Code {
	constructor(content) {
		super(content);
	}

	preprocess(content) {
		if (typeof content == 'object')
			return JSON.stringify(content, null, "\t");
		return JSON.stringify(JSON.parse(content), null, "\t");
	}
}
customElements.define('ui-json', Json);

let uuid$1 = 0;


/**
 * @callback itemElement
 * @param {Object} item
 * @returns {HTMLElement}
 */

/**
 * @callback attributeValue
 * @param {Object} item
 * @returns {Number|String}
 */

/**
 * @callback attributeDisplayValue
 * @param {Object} item
 * @returns {String}
 */

/** @typedef {Object} Attr
 *  @property {Number} id
 * 	@property {String} name
 *  @property {attributeValue} value
 *  @property {attributeDisplayValue} value
 */

class List extends BasicElement{

	// weakmap will ensure that we don't hold elements after they have fallen out of both the DOM and the data list
	/** @type {WeakMap<Object,HTMLElement>} */
	elementMap = new WeakMap();

	static ASC = true;
	static DESC = false;

	/** @type {boolean} indictes if the item display state is out of date */
	dirty = true;

	/** @type {{attr: Attr, asc: Boolean}|null} */
	_sort = null;

	/** @type {Object.<String, Attr>} */
	attrs = {};

	static ITEMS_COLUMNS_KEY = "--item-columns";
	static ITEMS_PER_PAGE_KEY = "--items-per-page";

	/**
	 * 
	 * @param {itemElement} itemDisplay 
	 * @param {{itemColumns?:number, itemsPerPage?: number}} options 
	 */
	constructor(itemDisplay, options = {}) {
		super();

		this.setAttribute("ui-list", '');

		this.innerHTML = this.listLayout;

		this.listBody = /** @type {HTMLElement} */ (this.querySelector('.list'));

		this._sort = null;

		this._data = [];
		this.display = [];

		this.lookup = {};

		this._filterFunc = null;

		this._itemDisplayFunc = itemDisplay;

		this.pageNumber = 0;

		if(options.itemColumns)
			this.itemColumns = options.itemColumns;
		if(options.itemsPerPage)
			this.itemsPerPage = options.itemsPerPage;
	}

	set itemColumns(value){
		this.setCss(List.ITEMS_COLUMNS_KEY, value);
	}

	get itemsPerPage(){
		let n =  this.cssNumber(List.ITEMS_PER_PAGE_KEY);
		return n || 24;
	}

	set itemsPerPage(value){
		this.setCss(List.ITEMS_PER_PAGE_KEY, value);
	}

	get listLayout(){
		return `
	<!-- pagination -->
	<header>
		<span><span class="sort"></span></span>
		<ui-spacer></ui-spacer>
		<span class="paging top"></span>
	</header>

	<content class="list">
	</content>

	<!-- pagination -->
	<footer>
		<ui-spacer></ui-spacer>
		<div class="paging bottom"></div>
	</footer>`
	}

	set data(data){
		this._data = data;
		for (let item of this._data) {
			if (item.__id == null)
				item.__id = item.id ? item.id : ('' + uuid$1++);
		}
		this.dirty = true;
	}

	get data(){
		return this._data;
	}

	/**
	 * 
	 * @param {String} name 
	 * @param {*} valueFunc 
	 * @param {*} displayFunc 
	 * @param {*} width 
	 */
	addAttribute(name, valueFunc = (i)=>i[name], displayFunc = valueFunc, width = null) {
		this.attrs[name] = {
			"id": uuid$1++,
			"name": name,
			"width": width,
			"value": (typeof valueFunc == "string") ? i => i[valueFunc] : valueFunc,
			"displayFunc": (typeof displayFunc == "string") ? i => i[displayFunc] : displayFunc
		};
		this.dirty = true;
		return this;
	}

	_filtered(item) {
		return this._filterFunc == null || this._filterFunc(item);
	}

	filter(func=this._filterFunc){
		this._filterFunc = func;
		this.dirty = true;
		this.page(0);
	}

	/**
	 * Display the sorting headers
	 */
	sortDisplay(){
		let wrapper = this.querySelector('.sort');

		let select = document.createElement('select');

		select.innerHTML = Object.values(this.attrs).map(attr=>
			attr.value?
			`<option value="${attr.name}:asc" >▲ ${attr.name}</option>
			<option value="${attr.name}:desc">▼ ${attr.name}</option>`:'').join('');
		select.value = this._sort?`${this._sort.attr.name}:${this._sort.asc?'asc':'desc'}`:null;
		select.onchange = ()=>{
			let vs = select.value.split(':');
			this.sort(vs[0], vs[1]=='asc');
		};

		wrapper.innerHTML = "";
		wrapper.appendChild(select);

		if(Object.values(this.attrs).length==0)
			wrapper.style.display = "none";
	}

	async render(forceRedraw=false) {
		// TODO render busy spinner?
		if(forceRedraw){
			this.dirty = true;
		}
		//render headers
		this.sortDisplay();
		
		// setup paging
		await this.page();
	}

	async getItemElement(item){
		if(!this.elementMap.has(item)){
			let ele = await this.renderItem(item);
			if(typeof item == "string"){
				// TODO support caching of string based item elements....
				return ele;
			}
			this.elementMap.set(item, ele);
		}
		return this.elementMap.get(item);
	}

	async renderItem(item){
		return await this._itemDisplayFunc(item);
	}

	/**
	 * 
	 * @param {Attr|String} attribute name of the attribute to sort on
	 * @param {Boolean} asc ASC of DESC sort
	 */
	async sort(attribute = this._sort?.attr, asc = !this._sort?.asc) {
		this.dirty = true;

		let attr = (typeof attribute == 'string')?this.attrs[attribute]:attribute;

		if(attribute == null){
			this._sort = null;
		}else {
			this._sort = {
				attr: attr,
				asc: asc
			};
		}

		if (this.data.length == 0)
			return;

		// render
		await this.render();
	}

	/**
	 * 
	 * @param {Number} page ZERO-INDEXED page number
	 */
	async page(page = this.pageNumber) {

		// rebuild the display list if dirty
		if(this.dirty){
			// grab raw data
			this.display = [...this.data];
			// filter
			this.display = this.display.filter(i=>this._filtered(i));
			// sort
			if(this._sort){
				this.display = this.display.sort((_a, _b) => {
					let a = _a?this._sort.attr.value(_a):null;
					let b = _b?this._sort.attr.value(_b):null;
					if(a == b)
						return 0;
					let asc = (this._sort.asc ? 1 : -1);
					if(b == null)
						return asc;
					if(a == null)
						return -asc;
					return asc*(''+a).localeCompare(''+b, "en", {sensitivity: 'base', ignorePunctuation: 'true', numeric: true});
				});
			}
			this.dirty = false;
			this.pageNumber = 0;
		}
		
		// compute paging numbers
		let visibleCount = this.display.length;
		let pages = Math.ceil(visibleCount / this.itemsPerPage);
		let needsPaging = pages > 1;
		this.pageNumber = isNaN(page)?0:Math.max(Math.min(page, pages-1), 0);

		// render the paging if needed
		if (needsPaging) {
			let paging = this.pagingMarkup(this.pageNumber, pages, visibleCount);
			this.querySelector('.paging.top').innerHTML = paging;
			this.querySelector('.paging.bottom').innerHTML = paging;

			// add auto paging callback 
			BasicElement.castHtmlElements(...this.querySelectorAll('[data-page]')).forEach(ele => ele.addEventListener('click', () => {
				this.page(parseInt(ele.dataset['page']));
			}));
		}else {
			this.querySelector('.paging.top').innerHTML = "";
			this.querySelector('.paging.bottom').innerHTML = "";
		}

		// finally actually add the items to the page
		this.listBody.innerHTML = "";
		for(let index = this.pageNumber*this.itemsPerPage; index < (this.pageNumber+1)*this.itemsPerPage && index < visibleCount; index++){
			let item = this.display[index];
			let ele = (await this.getItemElement(item));
			if(ele instanceof BasicElement){
				ele.attach(this.listBody);
			}else {
				this.listBody.appendChild(ele);
			}
		}
	}

	pagingMarkup(page, pages, visibleCount){
		let html = '';
		let extraButtons = 1;
		html += `${visibleCount} items`;
		html += `<ui-button data-page="0" class="near ${page==0?'active':''}">1</ui-button>`;
		let start = page - extraButtons;
		let end = page + extraButtons + 1;
		if(start < 1){
			end += 1-start;
			start = 1;
		}
		if(end > pages-1){
			start -= (end - pages)+1;
			end = pages -1;
			start = Math.max(1, start);
		}
		if(start > 1){
			html += `<span>...</span>`;
		}
		for (let p = start; p < end; p++) {
			html += `<ui-button data-page="${p}" class="${p == page ? 'active' : ''}">${p + 1}</ui-button>`;
		}
		if(end < pages-1){
			html += `<span>...</span>`;
		}
		html += `<ui-button data-page="${pages - 1}" class="near ${page==pages-1?'active':''}">${pages}</ui-button>`;
		return html;
	}
}
customElements.define('ui-list', List);

/**
 * Table is a special case of List with a more automatic layout
 */
class Table extends List{

	/**
	 * 
	 * @param {{itemsPerPage?: number}} options 
	 */
	constructor(options={}) {
		super(async (item)=>{
			let tr = document.createElement('tr');
			tr.dataset['tableId'] = item.__id;
			// render item (possible hidden)
			for (let header of Object.values(this.attrs)) {
				let cell = document.createElement('td');
				let content = await header.displayFunc(item);
				append(cell, content);
				tr.append(cell);
			}
			return tr;
		}, options);

		this.setAttribute("ui-table", '');
	}

	get listLayout(){
		return `<table>
<thead>
	<!-- pagination -->
	<tr><td class="paging top" colspan="100"></td></tr>

	<tr class="headers"></tr>
	<!-- filters -->
</thead>
<tbody class="list">
</tbody>
<tfoot>
	<!-- pagination -->
	<tr><td class="paging bottom" colspan="100"></td></tr>
</tfoot>
</table>`
	}

	/**
	 * Display the sorting headers
	 */
	sortDisplay(){
		let header = this.querySelector('thead tr.headers');
		let headers =  Object.values(this.attrs);
		let html = '';
		for (let header of headers) {
			html += `<th data-table-id="${header.id}" ${this.attrs[header.name].value?`data-sort="${header.name}"`:''} style="${header.width ? `width:${header.width}` : ''}">${header.name}</th>`;
		}
		header.innerHTML = html;
		header.querySelectorAll('th').forEach(
			ele=>{
				// if it's a sortable column add the click behaviour
				if(ele.dataset.sort){
					ele.onclick = (event)=>{
						this.sort(ele.dataset.sort);
					};
				}
			}
		);

		// highlight the sorted header
		if (this._sort)
			this.querySelector(`thead tr.headers th[data-table-id='${this._sort.attr.id}']`).classList.add(this._sort.asc ? 'asc' : 'desc');
	}
}
customElements.define('ui-table', Table);

class Spacer extends BasicElement {
	constructor() {
		super();
	}
}
customElements.define('ui-spacer', Spacer);

class Spinner extends BasicElement {
	constructor() {
		super();

		let size = this.attributes.getNamedItem("size")?.value || "1em";
		this.style.setProperty("--size", size);
	}
}
customElements.define('ui-spinner', Spinner);

class Viewport extends BasicElement{

	#view = {
		parent: null,
		// what position the top left corner maps to
		x: 0, 
		y: 0,
		zoom: 1, // 1 pixel = 1 pixel

		/** @type {Number} */
		get width(){
			return this.parent.element.width / this.zoom;
		},

		/** @type {Number} */
		get height(){
			return this.parent.element.height / this.zoom;
		}
	};

	attachments = [];

	constructor({flipY=false}={}){
		super();
		this.#view.parent = this;
		this.canvas = document.createElement('canvas');
		this.append(this.canvas);
	}
	
	addAttachment(element, update = true){
		this.attachments.push(element);
		this.append(element);
		if(update){
			this.updateAttachments();
		}
	}

	removeAttachment(element, update = true){
		this.attachments = this.attachments.filter(e=>e!=element);
		this.removeChild(element);
		if(update){
			this.updateAttachments();
		}
	}

	/**
	 * @deprecated use setZoom instead
	 * 
	 * Move the view so vx,vy is in the center of the viewport
	 * 
	 * @param {Number} vx 
	 * @param {Number} vy 
	 */
	center(vx,vy){
		this.setCenter(vx, vy);
	}

	/**
	 * Move the view so vx,vy is in the center of the viewport
	 * 
	 * @param {Number} vx 
	 * @param {Number} vy 
	 */
	setCenter(vx,vy){
		this.#view.x = vx - (this.#view.width/2);
		this.#view.y = vy - (this.#view.height/2);
	}

	/**
	 * Get the current worldspace coordinate at the center of the viewport
	 * 
	 * @returns {{x,y}} 
	 */
	getCenter(){
		return this.toView(this.#view.width/2, this.#view.height/2);
	}

	/**
	 * @deprecated use setZoom instead
	 * 
	 * Zoom on a point in screen space, keeping that point in the same place
	 * 
	 * @param {Number} vz target zoom level
	 * @param {Number} vx point to keep in the same position on screen
	 * @param {Number} vy point to keep in the same position on screen
	 */
	zoom(vz, vx,vy){
		this.setZoom(vz, vx, vy);
	}

	/**
	 * 
	 * Zoom on a point in screen space, keeping that point in the same place
	 * 
	 * @param {Number} vz target zoom level
	 * @param {Number?} vx point to keep in the same position on screen
	 * @param {Number?} vy point to keep in the same position on screen
	 */
	setZoom(vz, vx = null, vy = null){
		if(vx==null){
			let vxy = this.getCenter();
			vx = vxy.x;
			vy = vxy.y;
		}
		let s1 = this.toScreen(vx, vy);
		this.#view.zoom = vz;
		let s2 = this.toScreen(vx, vy);
		let px = s2.x-s1.x;
		let py = s2.y-s1.y;
		this.panScreen(px, py);
	}

	/**
	 * 
	 * @param {Number} rsx 
	 * @param {Number} rsy 
	 */
	pan(rsx, rsy){
		this.panScreen(rsx, rsy);
	}

	/**
	 * 
	 * @param {Number} rsx 
	 * @param {Number} rsy 
	 */
	panScreen(rsx, rsy){
		this.#view.x += rsx / this.#view.zoom;
		this.#view.y += rsy / this.#view.zoom;
	}

	/**
	 * convert the element-relative screen cordinates to the location
	 * in the viewspace
	 * 
	 * @param {Number} sx 
	 * @param {Number} sy 
	 * 
	 * @returns {{x:number,y:number, out: boolean}}
	 */
	toView(sx,sy){
		let v = this.#view;
		let e = this.element;
		let xy = {
			x: (sx-e.x)/v.zoom + v.x,
			y: (sy-e.y)/v.zoom + v.y,
		};
		xy.out = xy.x < v.x || xy.x > v.x + v.width 
			|| xy.y < v.y || xy.y > v.y + v.height;
		return xy;
	}

	/**
	 * convert the viewport cordinates to screen co-ordinates
	 * 
	 * @param {Number} sx 
	 * @param {Number} sy 
	 * 
	 * @returns {{x:number,y:number}}
	 */
	toScreen(vx, vy){
		let v = this.#view;
		return {
			x: (vx - v.x)*v.zoom,
			y: (vy - v.y)*v.zoom
		}
	}

	get element(){
		return this.getBoundingClientRect();
	}

	#lastV;

	grid = [
		{step: 1, offset: 1, color: "#7772"},
		{step: 6, offset: 6, color: "#7772"},
		{step: 12, offset: 0, color: "#7774"},
		{step: Infinity, offset: 0, color: "#999"}
	]

	render(){
		let v = this.#view;
		let lv = JSON.stringify({x:v.x,y:v.y,w:v.width,h:v.height,z:v.zoom});
		if(!(this.#lastV == null || this.#lastV != lv)){
			this.#lastV = lv;
			this.updateAttachments();
			return;
		}
		this.#lastV = lv;

		let element = this.element;
		if(this.canvas.width!=element.width || this.canvas.height!=element.height){
			this.canvas.width=element.width;
			this.canvas.height=element.height;
		}		

		// clear the canvas
		let context = this.canvas.getContext("2d");
		context.resetTransform();
		context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// set correct position
		let xOff = -v.x * v.zoom;
		let yOff = -v.y * v.zoom;

		let xmin = 0;
		let xmax = v.width * v.zoom;

		let ymin = 0;
		let ymax = v.height * v.zoom;

		context.lineWidth = 1;
		// grid
		for(let grid of this.grid){
			if(v.zoom*grid.step < 10){
				continue;
			}
			context.beginPath();
			context.strokeStyle = grid.color;
			// TODO sort this out!
			for(let offset = grid.offset??0; offset < 1000*grid.step; offset+=grid.step){
				let offStep = offset * v.zoom;
				if(offStep+yOff > ymin && offStep+yOff < ymax){
					context.moveTo(xmin, offStep + yOff);
					context.lineTo(xmax, offStep + yOff);
				}
				if(-offStep+yOff > ymin && -offStep+yOff < ymax){
					context.moveTo(xmin, -offStep + yOff);
					context.lineTo(xmax, -offStep + yOff);
				}
				if(offStep+xOff > xmin && offStep+xOff < xmax){
					context.moveTo(offStep + xOff, ymin);
					context.lineTo(offStep + xOff, ymax);
				}
				if(-offStep+xOff > xmin && -offStep+xOff < xmax){
					context.moveTo(-offStep + xOff, ymin);
					context.lineTo(-offStep + xOff, ymax);
				}
			}
			context.stroke();
		}

		this.updateAttachments();
	}

	updateAttachments(){
		let v = this.#view;
		for(let attachment of this.attachments){
			if(attachment.render){
				attachment.render(this);
			}else {
				let scale = attachment.scalar ?? 1;
				let x = (attachment.x ?? 0)*scale - v.x;
				let y = (attachment.y ?? 0)*scale - v.y;
				let t = `translate(${x * v.zoom}px, ${y * v.zoom}px) scale(${v.zoom * scale})`;
				attachment.style.transform = t;
			}
		}
	}

	/***********/

	bindMouse(){
		const LEFT_MOUSE = 0;
		const MIDDLE_MOUSE = 1;
		const RIGHT_MOUSE = 2;
		let drag = null;

		this.addEventListener('contextmenu', (e)=>{
			e.preventDefault();
		});
		this.addEventListener('wheel', (e)=>{
			let v = this.toView(e.x, e.y);

			// this looks funky but give a nice UX
			let zoom = Math.exp((Math.log(this.#view.zoom)*480 - e.deltaY)/480);

			this.setZoom(zoom, v.x, v.y);
			this.render();
		});
		document.addEventListener('mousedown', (e)=>{
			if(e.button==MIDDLE_MOUSE){
				drag = [e.x, e.y];
			}

			if(e.button==LEFT_MOUSE);
			
			if(e.button==RIGHT_MOUSE);
		});
		document.addEventListener('mousemove', (e)=>{
			if(drag){
				let ndrag = [e.x, e.y];
				this.panScreen(drag[0]-ndrag[0],drag[1]-ndrag[1]);
				drag = ndrag;
				this.render();
			}
		});
		document.addEventListener('mouseup', (e)=>{
			
			if(e.button==MIDDLE_MOUSE){
				let ndrag = [e.x, e.y];
				this.panScreen(drag[0]-ndrag[0],drag[1]-ndrag[1]);
				drag = null;
				this.render();
			}

			if(e.button==LEFT_MOUSE);
			if(e.button==RIGHT_MOUSE);
		});
	}
}
customElements.define('ui-viewport', Viewport);

// @ts-ignore
let URL$1 = import.meta.url;
let css = [
    URL$1 + "/../ui.css",
    "https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,200;0,300;0,400;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,600;1,700;1,800;1,900&display=swap",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.css"
];
let h = document.createElement('head');
h.innerHTML = css.map(url => `<link href="${url}" rel="stylesheet">`).join('');
// push them to the start of the head so that same-specificity rules (eg [ui-panel]{} 
// in a client css file) override the defaults
document.head.prepend(...h.childNodes);
const UI = {
    BasicElement,
    Badge,
    Button,
    Cancel,
    Card,
    Code,
    ContextMenu,
    Form, Form2,
    Grid,
    HashManager,
    InputLabel,
    Json,
    JsonInput,
    LabelledInput,
    List,
    Modal,
    MultiSelectInput,
    NumberInput,
    Panel,
    SelectInput,
    Spacer,
    Spinner,
    Splash,
    StringInput,
    Table,
    Toast,
    Toggle,
    Viewport,
    info: info,
    warn: warn,
    error: error,
    html: htmlToElement,
    uuid: uuid,
    sleep: sleep,
    utils,
    factory
};
// @ts-ignore
window["UI"] = UI;
let createElement = htmlToElement;

export default UI;
export { Badge, BasicElement, Button, Cancel, Card, Code, ContextMenu, Form, Grid, HashManager, InputLabel, Json, LabelledInput, List, Modal, MultiSelectInput, NumberInput, Panel, Spacer, Spinner, Splash, StringInput, Table, Toast, Toggle, Viewport, createElement, factory, utils };
//# sourceMappingURL=ui.js.map
