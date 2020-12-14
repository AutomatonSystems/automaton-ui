class BasicElement extends HTMLElement {
	constructor(content) {
		super();

		this.self = this;

		if(content){
			if (typeof content == 'string') {
				this.innerHTML = content;
			}else {
				this.append(content);
			}
		}

		this.remove = this.remove.bind(this);

		this.intervals = [];
	}

	/**
	 * Starts a interval timer that will stop when this element is no longer on the DOM
	 * 
	 * @param {*} callback 
	 * @param {Number} time in ms
	 */
	setInterval(callback, time){
		this.intervals.push(setInterval(()=>{
			if(!document.body.contains(this)){
				this.intervals.forEach(i=>clearInterval(i));
			}else {
				callback();
			}
		}, time));
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
		element.append(...content);
	}else {
		element.appendChild(content);
	}
}

/**
 * Convert html text to a HTMLElement
 * 
 * @param {String} html 
 * 
 * @returns {HTMLElement}
 */
function htmlToElement(html){
	let d = document.createElement('div');
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
	htmlToElement: htmlToElement,
	castHtmlElements: castHtmlElements,
	shuffle: shuffle,
	downloadJson: downloadJson,
	dynamicallyLoadScript: dynamicallyLoadScript
});

class Button extends BasicElement {

    /**
     *
     * @param {String|HTMLElement} content
     * @param {EventListenerOrEventListenerObject} callback callback when the button is clicked
     * @param {{icon?: String, style?: String, color?: String|boolean}} options
     */
	constructor(content, callback, { icon = '', style = 'button', color = false } = {}) {
		super(content);

		this.addEventListener('click', callback);

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
						let input = htmlToElement(`<input data-key="${jsonKey}" type="text" placeholder="${template.placeholder ?? ''}"/>`);
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

			append(this.querySelector('content'), content);
		}

		if (clazz) {
			this.classList.add(clazz);
		}
	}

	/**
	 * 
	 * @param  {...String|HTMLElement} elements 
	 */
	append(...elements) {
		append(this.querySelector('content'), elements);
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
		submitText = "Submit"
}={}){
	return new Promise(res=>{
		let form = new Form(template);
		form.build(value).then(()=>{
			let modal = new Modal(form, {title: title, buttons: '<ui-cancel></ui-cancel><ui-spacer></ui-spacer>'});
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

var Factory = /*#__PURE__*/Object.freeze({
	__proto__: null,
	popupForm: popupForm
});

class Badge extends BasicElement {
	constructor(content, { icon = '' } = {}) {
		super(content);

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

function decodeBase64(base64, enableUnicode) {
    var binaryString = atob(base64);
    if (enableUnicode) {
        var binaryView = new Uint8Array(binaryString.length);
        for (var i = 0, n = binaryString.length; i < n; ++i) {
            binaryView[i] = binaryString.charCodeAt(i);
        }
        return String.fromCharCode.apply(null, new Uint16Array(binaryView.buffer));
    }
    return binaryString;
}

function createURL(base64, sourcemapArg, enableUnicodeArg) {
    var sourcemap = sourcemapArg === undefined ? null : sourcemapArg;
    var enableUnicode = enableUnicodeArg === undefined ? false : enableUnicodeArg;
    var source = decodeBase64(base64, enableUnicode);
    var start = source.indexOf('\n', 10) + 1;
    var body = source.substring(start) + (sourcemap ? '\/\/# sourceMappingURL=' + sourcemap : '');
    var blob = new Blob([body], { type: 'application/javascript' });
    return URL.createObjectURL(blob);
}

function createBase64WorkerFactory(base64, sourcemapArg, enableUnicodeArg) {
    var url;
    return function WorkerFactory(options) {
        url = url || createURL(base64, sourcemapArg, enableUnicodeArg);
        return new Worker(url, options);
    };
}

var WorkerFactory = createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwovLyBAdHMtbm9jaGVjawpvbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHsKCWhsanMuY29uZmlndXJlKHt9KTsKCWNvbnN0IHJlc3VsdCA9IGhsanMuaGlnaGxpZ2h0QXV0byhldmVudC5kYXRhKTsKCXBvc3RNZXNzYWdlKHJlc3VsdC52YWx1ZSk7Cn07CgovKgogIEhpZ2hsaWdodC5qcyAxMC4xLjAgKDc0ZGU2ZWFhKQogIExpY2Vuc2U6IEJTRC0zLUNsYXVzZQogIENvcHlyaWdodCAoYykgMjAwNi0yMDIwLCBJdmFuIFNhZ2FsYWV2CiovCnZhciBobGpzPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShuKXtPYmplY3QuZnJlZXplKG4pO3ZhciB0PSJmdW5jdGlvbiI9PXR5cGVvZiBuO3JldHVybiBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhuKS5mb3JFYWNoKChmdW5jdGlvbihyKXshT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwobixyKXx8bnVsbD09PW5bcl18fCJvYmplY3QiIT10eXBlb2YgbltyXSYmImZ1bmN0aW9uIiE9dHlwZW9mIG5bcl18fHQmJigiY2FsbGVyIj09PXJ8fCJjYWxsZWUiPT09cnx8ImFyZ3VtZW50cyI9PT1yKXx8T2JqZWN0LmlzRnJvemVuKG5bcl0pfHxlKG5bcl0pO30pKSxufWNsYXNzIG57Y29uc3RydWN0b3IoZSl7dm9pZCAwPT09ZS5kYXRhJiYoZS5kYXRhPXt9KSx0aGlzLmRhdGE9ZS5kYXRhO31pZ25vcmVNYXRjaCgpe3RoaXMuaWdub3JlPSEwO319ZnVuY3Rpb24gdChlKXtyZXR1cm4gZS5yZXBsYWNlKC8mL2csIiZhbXA7IikucmVwbGFjZSgvPC9nLCImbHQ7IikucmVwbGFjZSgvPi9nLCImZ3Q7IikucmVwbGFjZSgvIi9nLCImcXVvdDsiKS5yZXBsYWNlKC8nL2csIiYjeDI3OyIpfWZ1bmN0aW9uIHIoZSwuLi5uKXt2YXIgdD17fTtmb3IoY29uc3QgbiBpbiBlKXRbbl09ZVtuXTtyZXR1cm4gbi5mb3JFYWNoKChmdW5jdGlvbihlKXtmb3IoY29uc3QgbiBpbiBlKXRbbl09ZVtuXTt9KSksdH1mdW5jdGlvbiBhKGUpe3JldHVybiBlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCl9dmFyIGk9T2JqZWN0LmZyZWV6ZSh7X19wcm90b19fOm51bGwsZXNjYXBlSFRNTDp0LGluaGVyaXQ6cixub2RlU3RyZWFtOmZ1bmN0aW9uKGUpe3ZhciBuPVtdO3JldHVybiBmdW5jdGlvbiBlKHQscil7Zm9yKHZhciBpPXQuZmlyc3RDaGlsZDtpO2k9aS5uZXh0U2libGluZykzPT09aS5ub2RlVHlwZT9yKz1pLm5vZGVWYWx1ZS5sZW5ndGg6MT09PWkubm9kZVR5cGUmJihuLnB1c2goe2V2ZW50OiJzdGFydCIsb2Zmc2V0OnIsbm9kZTppfSkscj1lKGksciksYShpKS5tYXRjaCgvYnJ8aHJ8aW1nfGlucHV0Lyl8fG4ucHVzaCh7ZXZlbnQ6InN0b3AiLG9mZnNldDpyLG5vZGU6aX0pKTtyZXR1cm4gcn0oZSwwKSxufSxtZXJnZVN0cmVhbXM6ZnVuY3Rpb24oZSxuLHIpe3ZhciBpPTAscz0iIixvPVtdO2Z1bmN0aW9uIGwoKXtyZXR1cm4gZS5sZW5ndGgmJm4ubGVuZ3RoP2VbMF0ub2Zmc2V0IT09blswXS5vZmZzZXQ/ZVswXS5vZmZzZXQ8blswXS5vZmZzZXQ/ZTpuOiJzdGFydCI9PT1uWzBdLmV2ZW50P2U6bjplLmxlbmd0aD9lOm59ZnVuY3Rpb24gYyhlKXtzKz0iPCIrYShlKStbXS5tYXAuY2FsbChlLmF0dHJpYnV0ZXMsKGZ1bmN0aW9uKGUpe3JldHVybiAiICIrZS5ub2RlTmFtZSsnPSInK3QoZS52YWx1ZSkrJyInfSkpLmpvaW4oIiIpKyI+Ijt9ZnVuY3Rpb24gdShlKXtzKz0iPC8iK2EoZSkrIj4iO31mdW5jdGlvbiBkKGUpeygic3RhcnQiPT09ZS5ldmVudD9jOnUpKGUubm9kZSk7fWZvcig7ZS5sZW5ndGh8fG4ubGVuZ3RoOyl7dmFyIGc9bCgpO2lmKHMrPXQoci5zdWJzdHJpbmcoaSxnWzBdLm9mZnNldCkpLGk9Z1swXS5vZmZzZXQsZz09PWUpe28ucmV2ZXJzZSgpLmZvckVhY2godSk7ZG97ZChnLnNwbGljZSgwLDEpWzBdKSxnPWwoKTt9d2hpbGUoZz09PWUmJmcubGVuZ3RoJiZnWzBdLm9mZnNldD09PWkpO28ucmV2ZXJzZSgpLmZvckVhY2goYyk7fWVsc2UgInN0YXJ0Ij09PWdbMF0uZXZlbnQ/by5wdXNoKGdbMF0ubm9kZSk6by5wb3AoKSxkKGcuc3BsaWNlKDAsMSlbMF0pO31yZXR1cm4gcyt0KHIuc3Vic3RyKGkpKX19KTtjb25zdCBzPSI8L3NwYW4+IixvPWU9PiEhZS5raW5kO2NsYXNzIGx7Y29uc3RydWN0b3IoZSxuKXt0aGlzLmJ1ZmZlcj0iIix0aGlzLmNsYXNzUHJlZml4PW4uY2xhc3NQcmVmaXgsZS53YWxrKHRoaXMpO31hZGRUZXh0KGUpe3RoaXMuYnVmZmVyKz10KGUpO31vcGVuTm9kZShlKXtpZighbyhlKSlyZXR1cm47bGV0IG49ZS5raW5kO2Uuc3VibGFuZ3VhZ2V8fChuPWAke3RoaXMuY2xhc3NQcmVmaXh9JHtufWApLHRoaXMuc3BhbihuKTt9Y2xvc2VOb2RlKGUpe28oZSkmJih0aGlzLmJ1ZmZlcis9cyk7fXZhbHVlKCl7cmV0dXJuIHRoaXMuYnVmZmVyfXNwYW4oZSl7dGhpcy5idWZmZXIrPWA8c3BhbiBjbGFzcz0iJHtlfSI+YDt9fWNsYXNzIGN7Y29uc3RydWN0b3IoKXt0aGlzLnJvb3ROb2RlPXtjaGlsZHJlbjpbXX0sdGhpcy5zdGFjaz1bdGhpcy5yb290Tm9kZV07fWdldCB0b3AoKXtyZXR1cm4gdGhpcy5zdGFja1t0aGlzLnN0YWNrLmxlbmd0aC0xXX1nZXQgcm9vdCgpe3JldHVybiB0aGlzLnJvb3ROb2RlfWFkZChlKXt0aGlzLnRvcC5jaGlsZHJlbi5wdXNoKGUpO31vcGVuTm9kZShlKXtjb25zdCBuPXtraW5kOmUsY2hpbGRyZW46W119O3RoaXMuYWRkKG4pLHRoaXMuc3RhY2sucHVzaChuKTt9Y2xvc2VOb2RlKCl7aWYodGhpcy5zdGFjay5sZW5ndGg+MSlyZXR1cm4gdGhpcy5zdGFjay5wb3AoKX1jbG9zZUFsbE5vZGVzKCl7Zm9yKDt0aGlzLmNsb3NlTm9kZSgpOyk7fXRvSlNPTigpe3JldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLnJvb3ROb2RlLG51bGwsNCl9d2FsayhlKXtyZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5fd2FsayhlLHRoaXMucm9vdE5vZGUpfXN0YXRpYyBfd2FsayhlLG4pe3JldHVybiAic3RyaW5nIj09dHlwZW9mIG4/ZS5hZGRUZXh0KG4pOm4uY2hpbGRyZW4mJihlLm9wZW5Ob2RlKG4pLG4uY2hpbGRyZW4uZm9yRWFjaChuPT50aGlzLl93YWxrKGUsbikpLGUuY2xvc2VOb2RlKG4pKSxlfXN0YXRpYyBfY29sbGFwc2UoZSl7InN0cmluZyIhPXR5cGVvZiBlJiZlLmNoaWxkcmVuJiYoZS5jaGlsZHJlbi5ldmVyeShlPT4ic3RyaW5nIj09dHlwZW9mIGUpP2UuY2hpbGRyZW49W2UuY2hpbGRyZW4uam9pbigiIildOmUuY2hpbGRyZW4uZm9yRWFjaChlPT57Yy5fY29sbGFwc2UoZSk7fSkpO319Y2xhc3MgdSBleHRlbmRzIGN7Y29uc3RydWN0b3IoZSl7c3VwZXIoKSx0aGlzLm9wdGlvbnM9ZTt9YWRkS2V5d29yZChlLG4peyIiIT09ZSYmKHRoaXMub3Blbk5vZGUobiksdGhpcy5hZGRUZXh0KGUpLHRoaXMuY2xvc2VOb2RlKCkpO31hZGRUZXh0KGUpeyIiIT09ZSYmdGhpcy5hZGQoZSk7fWFkZFN1Ymxhbmd1YWdlKGUsbil7Y29uc3QgdD1lLnJvb3Q7dC5raW5kPW4sdC5zdWJsYW5ndWFnZT0hMCx0aGlzLmFkZCh0KTt9dG9IVE1MKCl7cmV0dXJuIG5ldyBsKHRoaXMsdGhpcy5vcHRpb25zKS52YWx1ZSgpfWZpbmFsaXplKCl7cmV0dXJuICEwfX1mdW5jdGlvbiBkKGUpe3JldHVybiBlPyJzdHJpbmciPT10eXBlb2YgZT9lOmUuc291cmNlOm51bGx9Y29uc3QgZz0iKC0/KShcXGIwW3hYXVthLWZBLUYwLTldK3woXFxiXFxkKyhcXC5cXGQqKT98XFwuXFxkKykoW2VFXVstK10/XFxkKyk/KSIsaD17YmVnaW46IlxcXFxbXFxzXFxTXSIscmVsZXZhbmNlOjB9LGY9e2NsYXNzTmFtZToic3RyaW5nIixiZWdpbjoiJyIsZW5kOiInIixpbGxlZ2FsOiJcXG4iLGNvbnRhaW5zOltoXX0scD17Y2xhc3NOYW1lOiJzdHJpbmciLGJlZ2luOiciJyxlbmQ6JyInLGlsbGVnYWw6IlxcbiIsY29udGFpbnM6W2hdfSxiPXtiZWdpbjovXGIoYXxhbnx0aGV8YXJlfEknbXxpc24ndHxkb24ndHxkb2Vzbid0fHdvbid0fGJ1dHxqdXN0fHNob3VsZHxwcmV0dHl8c2ltcGx5fGVub3VnaHxnb25uYXxnb2luZ3x3dGZ8c298c3VjaHx3aWxsfHlvdXx5b3VyfHRoZXl8bGlrZXxtb3JlKVxiL30sbT1mdW5jdGlvbihlLG4sdD17fSl7dmFyIGE9cih7Y2xhc3NOYW1lOiJjb21tZW50IixiZWdpbjplLGVuZDpuLGNvbnRhaW5zOltdfSx0KTtyZXR1cm4gYS5jb250YWlucy5wdXNoKGIpLGEuY29udGFpbnMucHVzaCh7Y2xhc3NOYW1lOiJkb2N0YWciLGJlZ2luOiIoPzpUT0RPfEZJWE1FfE5PVEV8QlVHfE9QVElNSVpFfEhBQ0t8WFhYKToiLHJlbGV2YW5jZTowfSksYX0sdj1tKCIvLyIsIiQiKSx4PW0oIi9cXCoiLCJcXCovIiksRT1tKCIjIiwiJCIpO3ZhciBfPU9iamVjdC5mcmVlemUoe19fcHJvdG9fXzpudWxsLElERU5UX1JFOiJbYS16QS1aXVxcdyoiLFVOREVSU0NPUkVfSURFTlRfUkU6IlthLXpBLVpfXVxcdyoiLE5VTUJFUl9SRToiXFxiXFxkKyhcXC5cXGQrKT8iLENfTlVNQkVSX1JFOmcsQklOQVJZX05VTUJFUl9SRToiXFxiKDBiWzAxXSspIixSRV9TVEFSVEVSU19SRToiIXwhPXwhPT18JXwlPXwmfCYmfCY9fFxcKnxcXCo9fFxcK3xcXCs9fCx8LXwtPXwvPXwvfDp8O3w8PHw8PD18PD18PHw9PT18PT18PXw+Pj49fD4+PXw+PXw+Pj58Pj58PnxcXD98XFxbfFxce3xcXCh8XFxefFxcXj18XFx8fFxcfD18XFx8XFx8fH4iLFNIRUJBTkc6KGU9e30pPT57Y29uc3Qgbj0vXiMhWyBdKlwvLztyZXR1cm4gZS5iaW5hcnkmJihlLmJlZ2luPWZ1bmN0aW9uKC4uLmUpe3JldHVybiBlLm1hcChlPT5kKGUpKS5qb2luKCIiKX0obiwvLipcYi8sZS5iaW5hcnksL1xiLiovKSkscih7Y2xhc3NOYW1lOiJtZXRhIixiZWdpbjpuLGVuZDovJC8scmVsZXZhbmNlOjAsIm9uOmJlZ2luIjooZSxuKT0+ezAhPT1lLmluZGV4JiZuLmlnbm9yZU1hdGNoKCk7fX0sZSl9LEJBQ0tTTEFTSF9FU0NBUEU6aCxBUE9TX1NUUklOR19NT0RFOmYsUVVPVEVfU1RSSU5HX01PREU6cCxQSFJBU0FMX1dPUkRTX01PREU6YixDT01NRU5UOm0sQ19MSU5FX0NPTU1FTlRfTU9ERTp2LENfQkxPQ0tfQ09NTUVOVF9NT0RFOngsSEFTSF9DT01NRU5UX01PREU6RSxOVU1CRVJfTU9ERTp7Y2xhc3NOYW1lOiJudW1iZXIiLGJlZ2luOiJcXGJcXGQrKFxcLlxcZCspPyIscmVsZXZhbmNlOjB9LENfTlVNQkVSX01PREU6e2NsYXNzTmFtZToibnVtYmVyIixiZWdpbjpnLHJlbGV2YW5jZTowfSxCSU5BUllfTlVNQkVSX01PREU6e2NsYXNzTmFtZToibnVtYmVyIixiZWdpbjoiXFxiKDBiWzAxXSspIixyZWxldmFuY2U6MH0sQ1NTX05VTUJFUl9NT0RFOntjbGFzc05hbWU6Im51bWJlciIsYmVnaW46IlxcYlxcZCsoXFwuXFxkKyk/KCV8ZW18ZXh8Y2h8cmVtfHZ3fHZofHZtaW58dm1heHxjbXxtbXxpbnxwdHxwY3xweHxkZWd8Z3JhZHxyYWR8dHVybnxzfG1zfEh6fGtIenxkcGl8ZHBjbXxkcHB4KT8iLHJlbGV2YW5jZTowfSxSRUdFWFBfTU9ERTp7YmVnaW46Lyg/PVwvW14vXG5dKlwvKS8sY29udGFpbnM6W3tjbGFzc05hbWU6InJlZ2V4cCIsYmVnaW46L1wvLyxlbmQ6L1wvW2dpbXV5XSovLGlsbGVnYWw6L1xuLyxjb250YWluczpbaCx7YmVnaW46L1xbLyxlbmQ6L1xdLyxyZWxldmFuY2U6MCxjb250YWluczpbaF19XX1dfSxUSVRMRV9NT0RFOntjbGFzc05hbWU6InRpdGxlIixiZWdpbjoiW2EtekEtWl1cXHcqIixyZWxldmFuY2U6MH0sVU5ERVJTQ09SRV9USVRMRV9NT0RFOntjbGFzc05hbWU6InRpdGxlIixiZWdpbjoiW2EtekEtWl9dXFx3KiIscmVsZXZhbmNlOjB9LE1FVEhPRF9HVUFSRDp7YmVnaW46IlxcLlxccypbYS16QS1aX11cXHcqIixyZWxldmFuY2U6MH0sRU5EX1NBTUVfQVNfQkVHSU46ZnVuY3Rpb24oZSl7cmV0dXJuIE9iamVjdC5hc3NpZ24oZSx7Im9uOmJlZ2luIjooZSxuKT0+e24uZGF0YS5fYmVnaW5NYXRjaD1lWzFdO30sIm9uOmVuZCI6KGUsbik9PntuLmRhdGEuX2JlZ2luTWF0Y2ghPT1lWzFdJiZuLmlnbm9yZU1hdGNoKCk7fX0pfX0pLE49Im9mIGFuZCBmb3IgaW4gbm90IG9yIGlmIHRoZW4iLnNwbGl0KCIgIik7ZnVuY3Rpb24gdyhlLG4pe3JldHVybiBuPytuOmZ1bmN0aW9uKGUpe3JldHVybiBOLmluY2x1ZGVzKGUudG9Mb3dlckNhc2UoKSl9KGUpPzA6MX1jb25zdCBSPXQseT1yLHtub2RlU3RyZWFtOmssbWVyZ2VTdHJlYW1zOk99PWksTT1TeW1ib2woIm5vbWF0Y2giKTtyZXR1cm4gZnVuY3Rpb24odCl7dmFyIGE9W10saT17fSxzPXt9LG89W10sbD0hMCxjPS8oXig8W14+XSs+fFx0fCkrfFxuKS9nbSxnPSJDb3VsZCBub3QgZmluZCB0aGUgbGFuZ3VhZ2UgJ3t9JywgZGlkIHlvdSBmb3JnZXQgdG8gbG9hZC9pbmNsdWRlIGEgbGFuZ3VhZ2UgbW9kdWxlPyI7Y29uc3QgaD17ZGlzYWJsZUF1dG9kZXRlY3Q6ITAsbmFtZToiUGxhaW4gdGV4dCIsY29udGFpbnM6W119O3ZhciBmPXtub0hpZ2hsaWdodFJlOi9eKG5vLT9oaWdobGlnaHQpJC9pLGxhbmd1YWdlRGV0ZWN0UmU6L1xibGFuZyg/OnVhZ2UpPy0oW1x3LV0rKVxiL2ksY2xhc3NQcmVmaXg6ImhsanMtIix0YWJSZXBsYWNlOm51bGwsdXNlQlI6ITEsbGFuZ3VhZ2VzOm51bGwsX19lbWl0dGVyOnV9O2Z1bmN0aW9uIHAoZSl7cmV0dXJuIGYubm9IaWdobGlnaHRSZS50ZXN0KGUpfWZ1bmN0aW9uIGIoZSxuLHQscil7dmFyIGE9e2NvZGU6bixsYW5ndWFnZTplfTtTKCJiZWZvcmU6aGlnaGxpZ2h0IixhKTt2YXIgaT1hLnJlc3VsdD9hLnJlc3VsdDptKGEubGFuZ3VhZ2UsYS5jb2RlLHQscik7cmV0dXJuIGkuY29kZT1hLmNvZGUsUygiYWZ0ZXI6aGlnaGxpZ2h0IixpKSxpfWZ1bmN0aW9uIG0oZSx0LGEscyl7dmFyIG89dDtmdW5jdGlvbiBjKGUsbil7dmFyIHQ9RS5jYXNlX2luc2Vuc2l0aXZlP25bMF0udG9Mb3dlckNhc2UoKTpuWzBdO3JldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZS5rZXl3b3Jkcyx0KSYmZS5rZXl3b3Jkc1t0XX1mdW5jdGlvbiB1KCl7bnVsbCE9eS5zdWJMYW5ndWFnZT9mdW5jdGlvbigpe2lmKCIiIT09QSl7dmFyIGU9bnVsbDtpZigic3RyaW5nIj09dHlwZW9mIHkuc3ViTGFuZ3VhZ2Upe2lmKCFpW3kuc3ViTGFuZ3VhZ2VdKXJldHVybiB2b2lkIE8uYWRkVGV4dChBKTtlPW0oeS5zdWJMYW5ndWFnZSxBLCEwLGtbeS5zdWJMYW5ndWFnZV0pLGtbeS5zdWJMYW5ndWFnZV09ZS50b3A7fWVsc2UgZT12KEEseS5zdWJMYW5ndWFnZS5sZW5ndGg/eS5zdWJMYW5ndWFnZTpudWxsKTt5LnJlbGV2YW5jZT4wJiYoSSs9ZS5yZWxldmFuY2UpLE8uYWRkU3VibGFuZ3VhZ2UoZS5lbWl0dGVyLGUubGFuZ3VhZ2UpO319KCk6ZnVuY3Rpb24oKXtpZigheS5rZXl3b3JkcylyZXR1cm4gdm9pZCBPLmFkZFRleHQoQSk7bGV0IGU9MDt5LmtleXdvcmRQYXR0ZXJuUmUubGFzdEluZGV4PTA7bGV0IG49eS5rZXl3b3JkUGF0dGVyblJlLmV4ZWMoQSksdD0iIjtmb3IoO247KXt0Kz1BLnN1YnN0cmluZyhlLG4uaW5kZXgpO2NvbnN0IHI9Yyh5LG4pO2lmKHIpe2NvbnN0W2UsYV09cjtPLmFkZFRleHQodCksdD0iIixJKz1hLE8uYWRkS2V5d29yZChuWzBdLGUpO31lbHNlIHQrPW5bMF07ZT15LmtleXdvcmRQYXR0ZXJuUmUubGFzdEluZGV4LG49eS5rZXl3b3JkUGF0dGVyblJlLmV4ZWMoQSk7fXQrPUEuc3Vic3RyKGUpLE8uYWRkVGV4dCh0KTt9KCksQT0iIjt9ZnVuY3Rpb24gaChlKXtyZXR1cm4gZS5jbGFzc05hbWUmJk8ub3Blbk5vZGUoZS5jbGFzc05hbWUpLHk9T2JqZWN0LmNyZWF0ZShlLHtwYXJlbnQ6e3ZhbHVlOnl9fSl9ZnVuY3Rpb24gcChlKXtyZXR1cm4gMD09PXkubWF0Y2hlci5yZWdleEluZGV4PyhBKz1lWzBdLDEpOihMPSEwLDApfXZhciBiPXt9O2Z1bmN0aW9uIHgodCxyKXt2YXIgaT1yJiZyWzBdO2lmKEErPXQsbnVsbD09aSlyZXR1cm4gdSgpLDA7aWYoImJlZ2luIj09PWIudHlwZSYmImVuZCI9PT1yLnR5cGUmJmIuaW5kZXg9PT1yLmluZGV4JiYiIj09PWkpe2lmKEErPW8uc2xpY2Uoci5pbmRleCxyLmluZGV4KzEpLCFsKXtjb25zdCBuPUVycm9yKCIwIHdpZHRoIG1hdGNoIHJlZ2V4Iik7dGhyb3cgbi5sYW5ndWFnZU5hbWU9ZSxuLmJhZFJ1bGU9Yi5ydWxlLG59cmV0dXJuIDF9aWYoYj1yLCJiZWdpbiI9PT1yLnR5cGUpcmV0dXJuIGZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0scj1lLnJ1bGU7Y29uc3QgYT1uZXcgbihyKSxpPVtyLl9fYmVmb3JlQmVnaW4sclsib246YmVnaW4iXV07Zm9yKGNvbnN0IG4gb2YgaSlpZihuJiYobihlLGEpLGEuaWdub3JlKSlyZXR1cm4gcCh0KTtyZXR1cm4gciYmci5lbmRTYW1lQXNCZWdpbiYmKHIuZW5kUmU9UmVnRXhwKHQucmVwbGFjZSgvWy0vXFxeJCorPy4oKXxbXF17fV0vZywiXFwkJiIpLCJtIikpLHIuc2tpcD9BKz10OihyLmV4Y2x1ZGVCZWdpbiYmKEErPXQpLHUoKSxyLnJldHVybkJlZ2lufHxyLmV4Y2x1ZGVCZWdpbnx8KEE9dCkpLGgociksci5yZXR1cm5CZWdpbj8wOnQubGVuZ3RofShyKTtpZigiaWxsZWdhbCI9PT1yLnR5cGUmJiFhKXtjb25zdCBlPUVycm9yKCdJbGxlZ2FsIGxleGVtZSAiJytpKyciIGZvciBtb2RlICInKyh5LmNsYXNzTmFtZXx8Ijx1bm5hbWVkPiIpKyciJyk7dGhyb3cgZS5tb2RlPXksZX1pZigiZW5kIj09PXIudHlwZSl7dmFyIHM9ZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxyPW8uc3Vic3RyKGUuaW5kZXgpLGE9ZnVuY3Rpb24gZSh0LHIsYSl7bGV0IGk9ZnVuY3Rpb24oZSxuKXt2YXIgdD1lJiZlLmV4ZWMobik7cmV0dXJuIHQmJjA9PT10LmluZGV4fSh0LmVuZFJlLGEpO2lmKGkpe2lmKHRbIm9uOmVuZCJdKXtjb25zdCBlPW5ldyBuKHQpO3RbIm9uOmVuZCJdKHIsZSksZS5pZ25vcmUmJihpPSExKTt9aWYoaSl7Zm9yKDt0LmVuZHNQYXJlbnQmJnQucGFyZW50Oyl0PXQucGFyZW50O3JldHVybiB0fX1pZih0LmVuZHNXaXRoUGFyZW50KXJldHVybiBlKHQucGFyZW50LHIsYSl9KHksZSxyKTtpZighYSlyZXR1cm4gTTt2YXIgaT15O2kuc2tpcD9BKz10OihpLnJldHVybkVuZHx8aS5leGNsdWRlRW5kfHwoQSs9dCksdSgpLGkuZXhjbHVkZUVuZCYmKEE9dCkpO2Rve3kuY2xhc3NOYW1lJiZPLmNsb3NlTm9kZSgpLHkuc2tpcHx8eS5zdWJMYW5ndWFnZXx8KEkrPXkucmVsZXZhbmNlKSx5PXkucGFyZW50O313aGlsZSh5IT09YS5wYXJlbnQpO3JldHVybiBhLnN0YXJ0cyYmKGEuZW5kU2FtZUFzQmVnaW4mJihhLnN0YXJ0cy5lbmRSZT1hLmVuZFJlKSxoKGEuc3RhcnRzKSksaS5yZXR1cm5FbmQ/MDp0Lmxlbmd0aH0ocik7aWYocyE9PU0pcmV0dXJuIHN9aWYoImlsbGVnYWwiPT09ci50eXBlJiYiIj09PWkpcmV0dXJuIDE7aWYoQj4xZTUmJkI+MypyLmluZGV4KXRocm93IEVycm9yKCJwb3RlbnRpYWwgaW5maW5pdGUgbG9vcCwgd2F5IG1vcmUgaXRlcmF0aW9ucyB0aGFuIG1hdGNoZXMiKTtyZXR1cm4gQSs9aSxpLmxlbmd0aH12YXIgRT1UKGUpO2lmKCFFKXRocm93IGNvbnNvbGUuZXJyb3IoZy5yZXBsYWNlKCJ7fSIsZSkpLEVycm9yKCdVbmtub3duIGxhbmd1YWdlOiAiJytlKyciJyk7dmFyIF89ZnVuY3Rpb24oZSl7ZnVuY3Rpb24gbihuLHQpe3JldHVybiBSZWdFeHAoZChuKSwibSIrKGUuY2FzZV9pbnNlbnNpdGl2ZT8iaSI6IiIpKyh0PyJnIjoiIikpfWNsYXNzIHR7Y29uc3RydWN0b3IoKXt0aGlzLm1hdGNoSW5kZXhlcz17fSx0aGlzLnJlZ2V4ZXM9W10sdGhpcy5tYXRjaEF0PTEsdGhpcy5wb3NpdGlvbj0wO31hZGRSdWxlKGUsbil7bi5wb3NpdGlvbj10aGlzLnBvc2l0aW9uKyssdGhpcy5tYXRjaEluZGV4ZXNbdGhpcy5tYXRjaEF0XT1uLHRoaXMucmVnZXhlcy5wdXNoKFtuLGVdKSx0aGlzLm1hdGNoQXQrPWZ1bmN0aW9uKGUpe3JldHVybiBSZWdFeHAoZS50b1N0cmluZygpKyJ8IikuZXhlYygiIikubGVuZ3RoLTF9KGUpKzE7fWNvbXBpbGUoKXswPT09dGhpcy5yZWdleGVzLmxlbmd0aCYmKHRoaXMuZXhlYz0oKT0+bnVsbCk7Y29uc3QgZT10aGlzLnJlZ2V4ZXMubWFwKGU9PmVbMV0pO3RoaXMubWF0Y2hlclJlPW4oZnVuY3Rpb24oZSxuPSJ8Iil7Zm9yKHZhciB0PS9cWyg/OlteXFxcXV18XFwuKSpcXXxcKFw/P3xcXChbMS05XVswLTldKil8XFwuLyxyPTAsYT0iIixpPTA7aTxlLmxlbmd0aDtpKyspe3ZhciBzPXIrPTEsbz1kKGVbaV0pO2ZvcihpPjAmJihhKz1uKSxhKz0iKCI7by5sZW5ndGg+MDspe3ZhciBsPXQuZXhlYyhvKTtpZihudWxsPT1sKXthKz1vO2JyZWFrfWErPW8uc3Vic3RyaW5nKDAsbC5pbmRleCksbz1vLnN1YnN0cmluZyhsLmluZGV4K2xbMF0ubGVuZ3RoKSwiXFwiPT09bFswXVswXSYmbFsxXT9hKz0iXFwiKygrbFsxXStzKTooYSs9bFswXSwiKCI9PT1sWzBdJiZyKyspO31hKz0iKSI7fXJldHVybiBhfShlKSwhMCksdGhpcy5sYXN0SW5kZXg9MDt9ZXhlYyhlKXt0aGlzLm1hdGNoZXJSZS5sYXN0SW5kZXg9dGhpcy5sYXN0SW5kZXg7Y29uc3Qgbj10aGlzLm1hdGNoZXJSZS5leGVjKGUpO2lmKCFuKXJldHVybiBudWxsO2NvbnN0IHQ9bi5maW5kSW5kZXgoKGUsbik9Pm4+MCYmdm9pZCAwIT09ZSkscj10aGlzLm1hdGNoSW5kZXhlc1t0XTtyZXR1cm4gbi5zcGxpY2UoMCx0KSxPYmplY3QuYXNzaWduKG4scil9fWNsYXNzIGF7Y29uc3RydWN0b3IoKXt0aGlzLnJ1bGVzPVtdLHRoaXMubXVsdGlSZWdleGVzPVtdLHRoaXMuY291bnQ9MCx0aGlzLmxhc3RJbmRleD0wLHRoaXMucmVnZXhJbmRleD0wO31nZXRNYXRjaGVyKGUpe2lmKHRoaXMubXVsdGlSZWdleGVzW2VdKXJldHVybiB0aGlzLm11bHRpUmVnZXhlc1tlXTtjb25zdCBuPW5ldyB0O3JldHVybiB0aGlzLnJ1bGVzLnNsaWNlKGUpLmZvckVhY2goKFtlLHRdKT0+bi5hZGRSdWxlKGUsdCkpLG4uY29tcGlsZSgpLHRoaXMubXVsdGlSZWdleGVzW2VdPW4sbn1jb25zaWRlckFsbCgpe3RoaXMucmVnZXhJbmRleD0wO31hZGRSdWxlKGUsbil7dGhpcy5ydWxlcy5wdXNoKFtlLG5dKSwiYmVnaW4iPT09bi50eXBlJiZ0aGlzLmNvdW50Kys7fWV4ZWMoZSl7Y29uc3Qgbj10aGlzLmdldE1hdGNoZXIodGhpcy5yZWdleEluZGV4KTtuLmxhc3RJbmRleD10aGlzLmxhc3RJbmRleDtjb25zdCB0PW4uZXhlYyhlKTtyZXR1cm4gdCYmKHRoaXMucmVnZXhJbmRleCs9dC5wb3NpdGlvbisxLHRoaXMucmVnZXhJbmRleD09PXRoaXMuY291bnQmJih0aGlzLnJlZ2V4SW5kZXg9MCkpLHR9fWZ1bmN0aW9uIGkoZSxuKXtjb25zdCB0PWUuaW5wdXRbZS5pbmRleC0xXSxyPWUuaW5wdXRbZS5pbmRleCtlWzBdLmxlbmd0aF07Ii4iIT09dCYmIi4iIT09cnx8bi5pZ25vcmVNYXRjaCgpO31pZihlLmNvbnRhaW5zJiZlLmNvbnRhaW5zLmluY2x1ZGVzKCJzZWxmIikpdGhyb3cgRXJyb3IoIkVSUjogY29udGFpbnMgYHNlbGZgIGlzIG5vdCBzdXBwb3J0ZWQgYXQgdGhlIHRvcC1sZXZlbCBvZiBhIGxhbmd1YWdlLiAgU2VlIGRvY3VtZW50YXRpb24uIik7cmV0dXJuIGZ1bmN0aW9uIHQocyxvKXtjb25zdCBsPXM7aWYocy5jb21waWxlZClyZXR1cm4gbDtzLmNvbXBpbGVkPSEwLHMuX19iZWZvcmVCZWdpbj1udWxsLHMua2V5d29yZHM9cy5rZXl3b3Jkc3x8cy5iZWdpbktleXdvcmRzO2xldCBjPW51bGw7aWYoIm9iamVjdCI9PXR5cGVvZiBzLmtleXdvcmRzJiYoYz1zLmtleXdvcmRzLiRwYXR0ZXJuLGRlbGV0ZSBzLmtleXdvcmRzLiRwYXR0ZXJuKSxzLmtleXdvcmRzJiYocy5rZXl3b3Jkcz1mdW5jdGlvbihlLG4pe3ZhciB0PXt9O3JldHVybiAic3RyaW5nIj09dHlwZW9mIGU/cigia2V5d29yZCIsZSk6T2JqZWN0LmtleXMoZSkuZm9yRWFjaCgoZnVuY3Rpb24obil7cihuLGVbbl0pO30pKSx0O2Z1bmN0aW9uIHIoZSxyKXtuJiYocj1yLnRvTG93ZXJDYXNlKCkpLHIuc3BsaXQoIiAiKS5mb3JFYWNoKChmdW5jdGlvbihuKXt2YXIgcj1uLnNwbGl0KCJ8Iik7dFtyWzBdXT1bZSx3KHJbMF0sclsxXSldO30pKTt9fShzLmtleXdvcmRzLGUuY2FzZV9pbnNlbnNpdGl2ZSkpLHMubGV4ZW1lcyYmYyl0aHJvdyBFcnJvcigiRVJSOiBQcmVmZXIgYGtleXdvcmRzLiRwYXR0ZXJuYCB0byBgbW9kZS5sZXhlbWVzYCwgQk9USCBhcmUgbm90IGFsbG93ZWQuIChzZWUgbW9kZSByZWZlcmVuY2UpICIpO3JldHVybiBsLmtleXdvcmRQYXR0ZXJuUmU9bihzLmxleGVtZXN8fGN8fC9cdysvLCEwKSxvJiYocy5iZWdpbktleXdvcmRzJiYocy5iZWdpbj0iXFxiKCIrcy5iZWdpbktleXdvcmRzLnNwbGl0KCIgIikuam9pbigifCIpKyIpKD89XFxifFxccykiLHMuX19iZWZvcmVCZWdpbj1pKSxzLmJlZ2lufHwocy5iZWdpbj0vXEJ8XGIvKSxsLmJlZ2luUmU9bihzLmJlZ2luKSxzLmVuZFNhbWVBc0JlZ2luJiYocy5lbmQ9cy5iZWdpbikscy5lbmR8fHMuZW5kc1dpdGhQYXJlbnR8fChzLmVuZD0vXEJ8XGIvKSxzLmVuZCYmKGwuZW5kUmU9bihzLmVuZCkpLGwudGVybWluYXRvcl9lbmQ9ZChzLmVuZCl8fCIiLHMuZW5kc1dpdGhQYXJlbnQmJm8udGVybWluYXRvcl9lbmQmJihsLnRlcm1pbmF0b3JfZW5kKz0ocy5lbmQ/InwiOiIiKStvLnRlcm1pbmF0b3JfZW5kKSkscy5pbGxlZ2FsJiYobC5pbGxlZ2FsUmU9bihzLmlsbGVnYWwpKSx2b2lkIDA9PT1zLnJlbGV2YW5jZSYmKHMucmVsZXZhbmNlPTEpLHMuY29udGFpbnN8fChzLmNvbnRhaW5zPVtdKSxzLmNvbnRhaW5zPVtdLmNvbmNhdCguLi5zLmNvbnRhaW5zLm1hcCgoZnVuY3Rpb24oZSl7cmV0dXJuIGZ1bmN0aW9uKGUpe3JldHVybiBlLnZhcmlhbnRzJiYhZS5jYWNoZWRfdmFyaWFudHMmJihlLmNhY2hlZF92YXJpYW50cz1lLnZhcmlhbnRzLm1hcCgoZnVuY3Rpb24obil7cmV0dXJuIHIoZSx7dmFyaWFudHM6bnVsbH0sbil9KSkpLGUuY2FjaGVkX3ZhcmlhbnRzP2UuY2FjaGVkX3ZhcmlhbnRzOmZ1bmN0aW9uIGUobil7cmV0dXJuICEhbiYmKG4uZW5kc1dpdGhQYXJlbnR8fGUobi5zdGFydHMpKX0oZSk/cihlLHtzdGFydHM6ZS5zdGFydHM/cihlLnN0YXJ0cyk6bnVsbH0pOk9iamVjdC5pc0Zyb3plbihlKT9yKGUpOmV9KCJzZWxmIj09PWU/czplKX0pKSkscy5jb250YWlucy5mb3JFYWNoKChmdW5jdGlvbihlKXt0KGUsbCk7fSkpLHMuc3RhcnRzJiZ0KHMuc3RhcnRzLG8pLGwubWF0Y2hlcj1mdW5jdGlvbihlKXtjb25zdCBuPW5ldyBhO3JldHVybiBlLmNvbnRhaW5zLmZvckVhY2goZT0+bi5hZGRSdWxlKGUuYmVnaW4se3J1bGU6ZSx0eXBlOiJiZWdpbiJ9KSksZS50ZXJtaW5hdG9yX2VuZCYmbi5hZGRSdWxlKGUudGVybWluYXRvcl9lbmQse3R5cGU6ImVuZCJ9KSxlLmlsbGVnYWwmJm4uYWRkUnVsZShlLmlsbGVnYWwse3R5cGU6ImlsbGVnYWwifSksbn0obCksbH0oZSl9KEUpLE49IiIseT1zfHxfLGs9e30sTz1uZXcgZi5fX2VtaXR0ZXIoZik7IWZ1bmN0aW9uKCl7Zm9yKHZhciBlPVtdLG49eTtuIT09RTtuPW4ucGFyZW50KW4uY2xhc3NOYW1lJiZlLnVuc2hpZnQobi5jbGFzc05hbWUpO2UuZm9yRWFjaChlPT5PLm9wZW5Ob2RlKGUpKTt9KCk7dmFyIEE9IiIsST0wLFM9MCxCPTAsTD0hMTt0cnl7Zm9yKHkubWF0Y2hlci5jb25zaWRlckFsbCgpOzspe0IrKyxMP0w9ITE6KHkubWF0Y2hlci5sYXN0SW5kZXg9Uyx5Lm1hdGNoZXIuY29uc2lkZXJBbGwoKSk7Y29uc3QgZT15Lm1hdGNoZXIuZXhlYyhvKTtpZighZSlicmVhaztjb25zdCBuPXgoby5zdWJzdHJpbmcoUyxlLmluZGV4KSxlKTtTPWUuaW5kZXgrbjt9cmV0dXJuIHgoby5zdWJzdHIoUykpLE8uY2xvc2VBbGxOb2RlcygpLE8uZmluYWxpemUoKSxOPU8udG9IVE1MKCkse3JlbGV2YW5jZTpJLHZhbHVlOk4sbGFuZ3VhZ2U6ZSxpbGxlZ2FsOiExLGVtaXR0ZXI6Tyx0b3A6eX19Y2F0Y2gobil7aWYobi5tZXNzYWdlJiZuLm1lc3NhZ2UuaW5jbHVkZXMoIklsbGVnYWwiKSlyZXR1cm4ge2lsbGVnYWw6ITAsaWxsZWdhbEJ5Onttc2c6bi5tZXNzYWdlLGNvbnRleHQ6by5zbGljZShTLTEwMCxTKzEwMCksbW9kZTpuLm1vZGV9LHNvZmFyOk4scmVsZXZhbmNlOjAsdmFsdWU6UihvKSxlbWl0dGVyOk99O2lmKGwpcmV0dXJuIHtpbGxlZ2FsOiExLHJlbGV2YW5jZTowLHZhbHVlOlIobyksZW1pdHRlcjpPLGxhbmd1YWdlOmUsdG9wOnksZXJyb3JSYWlzZWQ6bn07dGhyb3cgbn19ZnVuY3Rpb24gdihlLG4pe249bnx8Zi5sYW5ndWFnZXN8fE9iamVjdC5rZXlzKGkpO3ZhciB0PWZ1bmN0aW9uKGUpe2NvbnN0IG49e3JlbGV2YW5jZTowLGVtaXR0ZXI6bmV3IGYuX19lbWl0dGVyKGYpLHZhbHVlOlIoZSksaWxsZWdhbDohMSx0b3A6aH07cmV0dXJuIG4uZW1pdHRlci5hZGRUZXh0KGUpLG59KGUpLHI9dDtyZXR1cm4gbi5maWx0ZXIoVCkuZmlsdGVyKEkpLmZvckVhY2goKGZ1bmN0aW9uKG4pe3ZhciBhPW0obixlLCExKTthLmxhbmd1YWdlPW4sYS5yZWxldmFuY2U+ci5yZWxldmFuY2UmJihyPWEpLGEucmVsZXZhbmNlPnQucmVsZXZhbmNlJiYocj10LHQ9YSk7fSkpLHIubGFuZ3VhZ2UmJih0LnNlY29uZF9iZXN0PXIpLHR9ZnVuY3Rpb24geChlKXtyZXR1cm4gZi50YWJSZXBsYWNlfHxmLnVzZUJSP2UucmVwbGFjZShjLGU9PiJcbiI9PT1lP2YudXNlQlI/Ijxicj4iOmU6Zi50YWJSZXBsYWNlP2UucmVwbGFjZSgvXHQvZyxmLnRhYlJlcGxhY2UpOmUpOmV9ZnVuY3Rpb24gRShlKXtsZXQgbj1udWxsO2NvbnN0IHQ9ZnVuY3Rpb24oZSl7dmFyIG49ZS5jbGFzc05hbWUrIiAiO24rPWUucGFyZW50Tm9kZT9lLnBhcmVudE5vZGUuY2xhc3NOYW1lOiIiO2NvbnN0IHQ9Zi5sYW5ndWFnZURldGVjdFJlLmV4ZWMobik7aWYodCl7dmFyIHI9VCh0WzFdKTtyZXR1cm4gcnx8KGNvbnNvbGUud2FybihnLnJlcGxhY2UoInt9Iix0WzFdKSksY29uc29sZS53YXJuKCJGYWxsaW5nIGJhY2sgdG8gbm8taGlnaGxpZ2h0IG1vZGUgZm9yIHRoaXMgYmxvY2suIixlKSkscj90WzFdOiJuby1oaWdobGlnaHQifXJldHVybiBuLnNwbGl0KC9ccysvKS5maW5kKGU9PnAoZSl8fFQoZSkpfShlKTtpZihwKHQpKXJldHVybjtTKCJiZWZvcmU6aGlnaGxpZ2h0QmxvY2siLHtibG9jazplLGxhbmd1YWdlOnR9KSxmLnVzZUJSPyhuPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImRpdiIpKS5pbm5lckhUTUw9ZS5pbm5lckhUTUwucmVwbGFjZSgvXG4vZywiIikucmVwbGFjZSgvPGJyWyAvXSo+L2csIlxuIik6bj1lO2NvbnN0IHI9bi50ZXh0Q29udGVudCxhPXQ/Yih0LHIsITApOnYociksaT1rKG4pO2lmKGkubGVuZ3RoKXtjb25zdCBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImRpdiIpO2UuaW5uZXJIVE1MPWEudmFsdWUsYS52YWx1ZT1PKGksayhlKSxyKTt9YS52YWx1ZT14KGEudmFsdWUpLFMoImFmdGVyOmhpZ2hsaWdodEJsb2NrIix7YmxvY2s6ZSxyZXN1bHQ6YX0pLGUuaW5uZXJIVE1MPWEudmFsdWUsZS5jbGFzc05hbWU9ZnVuY3Rpb24oZSxuLHQpe3ZhciByPW4/c1tuXTp0LGE9W2UudHJpbSgpXTtyZXR1cm4gZS5tYXRjaCgvXGJobGpzXGIvKXx8YS5wdXNoKCJobGpzIiksZS5pbmNsdWRlcyhyKXx8YS5wdXNoKHIpLGEuam9pbigiICIpLnRyaW0oKX0oZS5jbGFzc05hbWUsdCxhLmxhbmd1YWdlKSxlLnJlc3VsdD17bGFuZ3VhZ2U6YS5sYW5ndWFnZSxyZTphLnJlbGV2YW5jZSxyZWxhdmFuY2U6YS5yZWxldmFuY2V9LGEuc2Vjb25kX2Jlc3QmJihlLnNlY29uZF9iZXN0PXtsYW5ndWFnZTphLnNlY29uZF9iZXN0Lmxhbmd1YWdlLHJlOmEuc2Vjb25kX2Jlc3QucmVsZXZhbmNlLHJlbGF2YW5jZTphLnNlY29uZF9iZXN0LnJlbGV2YW5jZX0pO31jb25zdCBOPSgpPT57aWYoIU4uY2FsbGVkKXtOLmNhbGxlZD0hMDt2YXIgZT1kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCJwcmUgY29kZSIpO2EuZm9yRWFjaC5jYWxsKGUsRSk7fX07ZnVuY3Rpb24gVChlKXtyZXR1cm4gZT0oZXx8IiIpLnRvTG93ZXJDYXNlKCksaVtlXXx8aVtzW2VdXX1mdW5jdGlvbiBBKGUse2xhbmd1YWdlTmFtZTpufSl7InN0cmluZyI9PXR5cGVvZiBlJiYoZT1bZV0pLGUuZm9yRWFjaChlPT57c1tlXT1uO30pO31mdW5jdGlvbiBJKGUpe3ZhciBuPVQoZSk7cmV0dXJuIG4mJiFuLmRpc2FibGVBdXRvZGV0ZWN0fWZ1bmN0aW9uIFMoZSxuKXt2YXIgdD1lO28uZm9yRWFjaCgoZnVuY3Rpb24oZSl7ZVt0XSYmZVt0XShuKTt9KSk7fU9iamVjdC5hc3NpZ24odCx7aGlnaGxpZ2h0OmIsaGlnaGxpZ2h0QXV0bzp2LGZpeE1hcmt1cDp4LGhpZ2hsaWdodEJsb2NrOkUsY29uZmlndXJlOmZ1bmN0aW9uKGUpe2Y9eShmLGUpO30saW5pdEhpZ2hsaWdodGluZzpOLGluaXRIaWdobGlnaHRpbmdPbkxvYWQ6ZnVuY3Rpb24oKXt3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigiRE9NQ29udGVudExvYWRlZCIsTiwhMSk7fSxyZWdpc3Rlckxhbmd1YWdlOmZ1bmN0aW9uKGUsbil7dmFyIHI9bnVsbDt0cnl7cj1uKHQpO31jYXRjaChuKXtpZihjb25zb2xlLmVycm9yKCJMYW5ndWFnZSBkZWZpbml0aW9uIGZvciAne30nIGNvdWxkIG5vdCBiZSByZWdpc3RlcmVkLiIucmVwbGFjZSgie30iLGUpKSwhbCl0aHJvdyBuO2NvbnNvbGUuZXJyb3Iobikscj1oO31yLm5hbWV8fChyLm5hbWU9ZSksaVtlXT1yLHIucmF3RGVmaW5pdGlvbj1uLmJpbmQobnVsbCx0KSxyLmFsaWFzZXMmJkEoci5hbGlhc2VzLHtsYW5ndWFnZU5hbWU6ZX0pO30sbGlzdExhbmd1YWdlczpmdW5jdGlvbigpe3JldHVybiBPYmplY3Qua2V5cyhpKX0sZ2V0TGFuZ3VhZ2U6VCxyZWdpc3RlckFsaWFzZXM6QSxyZXF1aXJlTGFuZ3VhZ2U6ZnVuY3Rpb24oZSl7dmFyIG49VChlKTtpZihuKXJldHVybiBuO3Rocm93IEVycm9yKCJUaGUgJ3t9JyBsYW5ndWFnZSBpcyByZXF1aXJlZCwgYnV0IG5vdCBsb2FkZWQuIi5yZXBsYWNlKCJ7fSIsZSkpfSxhdXRvRGV0ZWN0aW9uOkksaW5oZXJpdDp5LGFkZFBsdWdpbjpmdW5jdGlvbihlKXtvLnB1c2goZSk7fX0pLHQuZGVidWdNb2RlPWZ1bmN0aW9uKCl7bD0hMTt9LHQuc2FmZU1vZGU9ZnVuY3Rpb24oKXtsPSEwO30sdC52ZXJzaW9uU3RyaW5nPSIxMC4xLjAiO2Zvcihjb25zdCBuIGluIF8pIm9iamVjdCI9PXR5cGVvZiBfW25dJiZlKF9bbl0pO3JldHVybiBPYmplY3QuYXNzaWduKHQsXyksdH0oe30pfSgpOyJvYmplY3QiPT10eXBlb2YgZXhwb3J0cyYmInVuZGVmaW5lZCIhPXR5cGVvZiBtb2R1bGUmJihtb2R1bGUuZXhwb3J0cz1obGpzKTsKaGxqcy5yZWdpc3Rlckxhbmd1YWdlKCJjc3MiLGZ1bmN0aW9uKCl7cmV0dXJuIGZ1bmN0aW9uKGUpe3ZhciBuPXtiZWdpbjovKD86W0EtWlxfXC5cLV0rfC0tW2EtekEtWjAtOV8tXSspXHMqOi8scmV0dXJuQmVnaW46ITAsZW5kOiI7IixlbmRzV2l0aFBhcmVudDohMCxjb250YWluczpbe2NsYXNzTmFtZToiYXR0cmlidXRlIixiZWdpbjovXFMvLGVuZDoiOiIsZXhjbHVkZUVuZDohMCxzdGFydHM6e2VuZHNXaXRoUGFyZW50OiEwLGV4Y2x1ZGVFbmQ6ITAsY29udGFpbnM6W3tiZWdpbjovW1x3LV0rXCgvLHJldHVybkJlZ2luOiEwLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJidWlsdF9pbiIsYmVnaW46L1tcdy1dKy99LHtiZWdpbjovXCgvLGVuZDovXCkvLGNvbnRhaW5zOltlLkFQT1NfU1RSSU5HX01PREUsZS5RVU9URV9TVFJJTkdfTU9ERSxlLkNTU19OVU1CRVJfTU9ERV19XX0sZS5DU1NfTlVNQkVSX01PREUsZS5RVU9URV9TVFJJTkdfTU9ERSxlLkFQT1NfU1RSSU5HX01PREUsZS5DX0JMT0NLX0NPTU1FTlRfTU9ERSx7Y2xhc3NOYW1lOiJudW1iZXIiLGJlZ2luOiIjWzAtOUEtRmEtZl0rIn0se2NsYXNzTmFtZToibWV0YSIsYmVnaW46IiFpbXBvcnRhbnQifV19fV19O3JldHVybiB7bmFtZToiQ1NTIixjYXNlX2luc2Vuc2l0aXZlOiEwLGlsbGVnYWw6L1s9XC98J1wkXS8sY29udGFpbnM6W2UuQ19CTE9DS19DT01NRU5UX01PREUse2NsYXNzTmFtZToic2VsZWN0b3ItaWQiLGJlZ2luOi8jW0EtWmEtejAtOV8tXSsvfSx7Y2xhc3NOYW1lOiJzZWxlY3Rvci1jbGFzcyIsYmVnaW46L1wuW0EtWmEtejAtOV8tXSsvfSx7Y2xhc3NOYW1lOiJzZWxlY3Rvci1hdHRyIixiZWdpbjovXFsvLGVuZDovXF0vLGlsbGVnYWw6IiQiLGNvbnRhaW5zOltlLkFQT1NfU1RSSU5HX01PREUsZS5RVU9URV9TVFJJTkdfTU9ERV19LHtjbGFzc05hbWU6InNlbGVjdG9yLXBzZXVkbyIsYmVnaW46LzooOik/W2EtekEtWjAtOVxfXC1cK1woXCkiJy5dKy99LHtiZWdpbjoiQChwYWdlfGZvbnQtZmFjZSkiLGxleGVtZXM6IkBbYS16LV0rIixrZXl3b3JkczoiQHBhZ2UgQGZvbnQtZmFjZSJ9LHtiZWdpbjoiQCIsZW5kOiJbeztdIixpbGxlZ2FsOi86LyxyZXR1cm5CZWdpbjohMCxjb250YWluczpbe2NsYXNzTmFtZToia2V5d29yZCIsYmVnaW46L0BcLT9cd1tcd10qKFwtXHcrKSovfSx7YmVnaW46L1xzLyxlbmRzV2l0aFBhcmVudDohMCxleGNsdWRlRW5kOiEwLHJlbGV2YW5jZTowLGtleXdvcmRzOiJhbmQgb3Igbm90IG9ubHkiLGNvbnRhaW5zOlt7YmVnaW46L1thLXotXSs6LyxjbGFzc05hbWU6ImF0dHJpYnV0ZSJ9LGUuQVBPU19TVFJJTkdfTU9ERSxlLlFVT1RFX1NUUklOR19NT0RFLGUuQ1NTX05VTUJFUl9NT0RFXX1dfSx7Y2xhc3NOYW1lOiJzZWxlY3Rvci10YWciLGJlZ2luOiJbYS16QS1aLV1bYS16QS1aMC05Xy1dKiIscmVsZXZhbmNlOjB9LHtiZWdpbjoieyIsZW5kOiJ9IixpbGxlZ2FsOi9cUy8sY29udGFpbnM6W2UuQ19CTE9DS19DT01NRU5UX01PREUsbl19XX19fSgpKTsKaGxqcy5yZWdpc3Rlckxhbmd1YWdlKCJkaWZmIixmdW5jdGlvbigpe3JldHVybiBmdW5jdGlvbihlKXtyZXR1cm4ge25hbWU6IkRpZmYiLGFsaWFzZXM6WyJwYXRjaCJdLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJtZXRhIixyZWxldmFuY2U6MTAsdmFyaWFudHM6W3tiZWdpbjovXkBAICtcLVxkKyxcZCsgK1wrXGQrLFxkKyArQEAkL30se2JlZ2luOi9eXCpcKlwqICtcZCssXGQrICtcKlwqXCpcKiQvfSx7YmVnaW46L15cLVwtXC0gK1xkKyxcZCsgK1wtXC1cLVwtJC99XX0se2NsYXNzTmFtZToiY29tbWVudCIsdmFyaWFudHM6W3tiZWdpbjovSW5kZXg6IC8sZW5kOi8kL30se2JlZ2luOi89ezMsfS8sZW5kOi8kL30se2JlZ2luOi9eXC17M30vLGVuZDovJC99LHtiZWdpbjovXlwqezN9IC8sZW5kOi8kL30se2JlZ2luOi9eXCt7M30vLGVuZDovJC99LHtiZWdpbjovXlwqezE1fSQvfV19LHtjbGFzc05hbWU6ImFkZGl0aW9uIixiZWdpbjoiXlxcKyIsZW5kOiIkIn0se2NsYXNzTmFtZToiZGVsZXRpb24iLGJlZ2luOiJeXFwtIixlbmQ6IiQifSx7Y2xhc3NOYW1lOiJhZGRpdGlvbiIsYmVnaW46Il5cXCEiLGVuZDoiJCJ9XX19fSgpKTsKaGxqcy5yZWdpc3Rlckxhbmd1YWdlKCJqYXZhc2NyaXB0IixmdW5jdGlvbigpe2NvbnN0IGU9WyJhcyIsImluIiwib2YiLCJpZiIsImZvciIsIndoaWxlIiwiZmluYWxseSIsInZhciIsIm5ldyIsImZ1bmN0aW9uIiwiZG8iLCJyZXR1cm4iLCJ2b2lkIiwiZWxzZSIsImJyZWFrIiwiY2F0Y2giLCJpbnN0YW5jZW9mIiwid2l0aCIsInRocm93IiwiY2FzZSIsImRlZmF1bHQiLCJ0cnkiLCJzd2l0Y2giLCJjb250aW51ZSIsInR5cGVvZiIsImRlbGV0ZSIsImxldCIsInlpZWxkIiwiY29uc3QiLCJjbGFzcyIsImRlYnVnZ2VyIiwiYXN5bmMiLCJhd2FpdCIsInN0YXRpYyIsImltcG9ydCIsImZyb20iLCJleHBvcnQiLCJleHRlbmRzIl0sbj1bInRydWUiLCJmYWxzZSIsIm51bGwiLCJ1bmRlZmluZWQiLCJOYU4iLCJJbmZpbml0eSJdLGE9W10uY29uY2F0KFsic2V0SW50ZXJ2YWwiLCJzZXRUaW1lb3V0IiwiY2xlYXJJbnRlcnZhbCIsImNsZWFyVGltZW91dCIsInJlcXVpcmUiLCJleHBvcnRzIiwiZXZhbCIsImlzRmluaXRlIiwiaXNOYU4iLCJwYXJzZUZsb2F0IiwicGFyc2VJbnQiLCJkZWNvZGVVUkkiLCJkZWNvZGVVUklDb21wb25lbnQiLCJlbmNvZGVVUkkiLCJlbmNvZGVVUklDb21wb25lbnQiLCJlc2NhcGUiLCJ1bmVzY2FwZSJdLFsiYXJndW1lbnRzIiwidGhpcyIsInN1cGVyIiwiY29uc29sZSIsIndpbmRvdyIsImRvY3VtZW50IiwibG9jYWxTdG9yYWdlIiwibW9kdWxlIiwiZ2xvYmFsIl0sWyJJbnRsIiwiRGF0YVZpZXciLCJOdW1iZXIiLCJNYXRoIiwiRGF0ZSIsIlN0cmluZyIsIlJlZ0V4cCIsIk9iamVjdCIsIkZ1bmN0aW9uIiwiQm9vbGVhbiIsIkVycm9yIiwiU3ltYm9sIiwiU2V0IiwiTWFwIiwiV2Vha1NldCIsIldlYWtNYXAiLCJQcm94eSIsIlJlZmxlY3QiLCJKU09OIiwiUHJvbWlzZSIsIkZsb2F0NjRBcnJheSIsIkludDE2QXJyYXkiLCJJbnQzMkFycmF5IiwiSW50OEFycmF5IiwiVWludDE2QXJyYXkiLCJVaW50MzJBcnJheSIsIkZsb2F0MzJBcnJheSIsIkFycmF5IiwiVWludDhBcnJheSIsIlVpbnQ4Q2xhbXBlZEFycmF5IiwiQXJyYXlCdWZmZXIiXSxbIkV2YWxFcnJvciIsIkludGVybmFsRXJyb3IiLCJSYW5nZUVycm9yIiwiUmVmZXJlbmNlRXJyb3IiLCJTeW50YXhFcnJvciIsIlR5cGVFcnJvciIsIlVSSUVycm9yIl0pO2Z1bmN0aW9uIHMoZSl7cmV0dXJuIHIoIig/PSIsZSwiKSIpfWZ1bmN0aW9uIHIoLi4uZSl7cmV0dXJuIGUubWFwKGU9PihmdW5jdGlvbihlKXtyZXR1cm4gZT8ic3RyaW5nIj09dHlwZW9mIGU/ZTplLnNvdXJjZTpudWxsfSkoZSkpLmpvaW4oIiIpfXJldHVybiBmdW5jdGlvbih0KXt2YXIgaT0iW0EtWmEteiRfXVswLTlBLVphLXokX10qIixjPXtiZWdpbjovPFtBLVphLXowLTlcXC5fOi1dKy8sZW5kOi9cL1tBLVphLXowLTlcXC5fOi1dKz58XC8+L30sbz17JHBhdHRlcm46IltBLVphLXokX11bMC05QS1aYS16JF9dKiIsa2V5d29yZDplLmpvaW4oIiAiKSxsaXRlcmFsOm4uam9pbigiICIpLGJ1aWx0X2luOmEuam9pbigiICIpfSxsPXtjbGFzc05hbWU6Im51bWJlciIsdmFyaWFudHM6W3tiZWdpbjoiXFxiKDBbYkJdWzAxXSspbj8ifSx7YmVnaW46IlxcYigwW29PXVswLTddKyluPyJ9LHtiZWdpbjp0LkNfTlVNQkVSX1JFKyJuPyJ9XSxyZWxldmFuY2U6MH0sRT17Y2xhc3NOYW1lOiJzdWJzdCIsYmVnaW46IlxcJFxceyIsZW5kOiJcXH0iLGtleXdvcmRzOm8sY29udGFpbnM6W119LGQ9e2JlZ2luOiJodG1sYCIsZW5kOiIiLHN0YXJ0czp7ZW5kOiJgIixyZXR1cm5FbmQ6ITEsY29udGFpbnM6W3QuQkFDS1NMQVNIX0VTQ0FQRSxFXSxzdWJMYW5ndWFnZToieG1sIn19LGc9e2JlZ2luOiJjc3NgIixlbmQ6IiIsc3RhcnRzOntlbmQ6ImAiLHJldHVybkVuZDohMSxjb250YWluczpbdC5CQUNLU0xBU0hfRVNDQVBFLEVdLHN1Ykxhbmd1YWdlOiJjc3MifX0sdT17Y2xhc3NOYW1lOiJzdHJpbmciLGJlZ2luOiJgIixlbmQ6ImAiLGNvbnRhaW5zOlt0LkJBQ0tTTEFTSF9FU0NBUEUsRV19O0UuY29udGFpbnM9W3QuQVBPU19TVFJJTkdfTU9ERSx0LlFVT1RFX1NUUklOR19NT0RFLGQsZyx1LGwsdC5SRUdFWFBfTU9ERV07dmFyIGI9RS5jb250YWlucy5jb25jYXQoW3tiZWdpbjovXCgvLGVuZDovXCkvLGNvbnRhaW5zOlsic2VsZiJdLmNvbmNhdChFLmNvbnRhaW5zLFt0LkNfQkxPQ0tfQ09NTUVOVF9NT0RFLHQuQ19MSU5FX0NPTU1FTlRfTU9ERV0pfSx0LkNfQkxPQ0tfQ09NTUVOVF9NT0RFLHQuQ19MSU5FX0NPTU1FTlRfTU9ERV0pLF89e2NsYXNzTmFtZToicGFyYW1zIixiZWdpbjovXCgvLGVuZDovXCkvLGV4Y2x1ZGVCZWdpbjohMCxleGNsdWRlRW5kOiEwLGNvbnRhaW5zOmJ9O3JldHVybiB7bmFtZToiSmF2YVNjcmlwdCIsYWxpYXNlczpbImpzIiwianN4IiwibWpzIiwiY2pzIl0sa2V5d29yZHM6byxjb250YWluczpbdC5TSEVCQU5HKHtiaW5hcnk6Im5vZGUiLHJlbGV2YW5jZTo1fSkse2NsYXNzTmFtZToibWV0YSIscmVsZXZhbmNlOjEwLGJlZ2luOi9eXHMqWyciXXVzZSAoc3RyaWN0fGFzbSlbJyJdL30sdC5BUE9TX1NUUklOR19NT0RFLHQuUVVPVEVfU1RSSU5HX01PREUsZCxnLHUsdC5DX0xJTkVfQ09NTUVOVF9NT0RFLHQuQ09NTUVOVCgiL1xcKlxcKiIsIlxcKi8iLHtyZWxldmFuY2U6MCxjb250YWluczpbe2NsYXNzTmFtZToiZG9jdGFnIixiZWdpbjoiQFtBLVphLXpdKyIsY29udGFpbnM6W3tjbGFzc05hbWU6InR5cGUiLGJlZ2luOiJcXHsiLGVuZDoiXFx9IixyZWxldmFuY2U6MH0se2NsYXNzTmFtZToidmFyaWFibGUiLGJlZ2luOmkrIig/PVxccyooLSl8JCkiLGVuZHNQYXJlbnQ6ITAscmVsZXZhbmNlOjB9LHtiZWdpbjovKD89W15cbl0pXHMvLHJlbGV2YW5jZTowfV19XX0pLHQuQ19CTE9DS19DT01NRU5UX01PREUsbCx7YmVnaW46cigvW3ssXG5dXHMqLyxzKHIoLygoKFwvXC8uKil8KFwvXCooLnxcbikqXCpcLykpXHMqKSovLGkrIlxccyo6IikpKSxyZWxldmFuY2U6MCxjb250YWluczpbe2NsYXNzTmFtZToiYXR0ciIsYmVnaW46aStzKCJcXHMqOiIpLHJlbGV2YW5jZTowfV19LHtiZWdpbjoiKCIrdC5SRV9TVEFSVEVSU19SRSsifFxcYihjYXNlfHJldHVybnx0aHJvdylcXGIpXFxzKiIsa2V5d29yZHM6InJldHVybiB0aHJvdyBjYXNlIixjb250YWluczpbdC5DX0xJTkVfQ09NTUVOVF9NT0RFLHQuQ19CTE9DS19DT01NRU5UX01PREUsdC5SRUdFWFBfTU9ERSx7Y2xhc3NOYW1lOiJmdW5jdGlvbiIsYmVnaW46IihcXChbXihdKihcXChbXihdKihcXChbXihdKlxcKSk/XFwpKT9cXCl8Iit0LlVOREVSU0NPUkVfSURFTlRfUkUrIilcXHMqPT4iLHJldHVybkJlZ2luOiEwLGVuZDoiXFxzKj0+Iixjb250YWluczpbe2NsYXNzTmFtZToicGFyYW1zIix2YXJpYW50czpbe2JlZ2luOnQuVU5ERVJTQ09SRV9JREVOVF9SRX0se2NsYXNzTmFtZTpudWxsLGJlZ2luOi9cKFxzKlwpLyxza2lwOiEwfSx7YmVnaW46L1woLyxlbmQ6L1wpLyxleGNsdWRlQmVnaW46ITAsZXhjbHVkZUVuZDohMCxrZXl3b3JkczpvLGNvbnRhaW5zOmJ9XX1dfSx7YmVnaW46LywvLHJlbGV2YW5jZTowfSx7Y2xhc3NOYW1lOiIiLGJlZ2luOi9ccy8sZW5kOi9ccyovLHNraXA6ITB9LHt2YXJpYW50czpbe2JlZ2luOiI8PiIsZW5kOiI8Lz4ifSx7YmVnaW46Yy5iZWdpbixlbmQ6Yy5lbmR9XSxzdWJMYW5ndWFnZToieG1sIixjb250YWluczpbe2JlZ2luOmMuYmVnaW4sZW5kOmMuZW5kLHNraXA6ITAsY29udGFpbnM6WyJzZWxmIl19XX1dLHJlbGV2YW5jZTowfSx7Y2xhc3NOYW1lOiJmdW5jdGlvbiIsYmVnaW5LZXl3b3JkczoiZnVuY3Rpb24iLGVuZDovXHsvLGV4Y2x1ZGVFbmQ6ITAsY29udGFpbnM6W3QuaW5oZXJpdCh0LlRJVExFX01PREUse2JlZ2luOml9KSxfXSxpbGxlZ2FsOi9cW3wlL30se2JlZ2luOi9cJFsoLl0vfSx0Lk1FVEhPRF9HVUFSRCx7Y2xhc3NOYW1lOiJjbGFzcyIsYmVnaW5LZXl3b3JkczoiY2xhc3MiLGVuZDovW3s7PV0vLGV4Y2x1ZGVFbmQ6ITAsaWxsZWdhbDovWzoiXFtcXV0vLGNvbnRhaW5zOlt7YmVnaW5LZXl3b3JkczoiZXh0ZW5kcyJ9LHQuVU5ERVJTQ09SRV9USVRMRV9NT0RFXX0se2JlZ2luS2V5d29yZHM6ImNvbnN0cnVjdG9yIixlbmQ6L1x7LyxleGNsdWRlRW5kOiEwfSx7YmVnaW46IihnZXR8c2V0KVxccysoPz0iK2krIlxcKCkiLGVuZDovey8sa2V5d29yZHM6ImdldCBzZXQiLGNvbnRhaW5zOlt0LmluaGVyaXQodC5USVRMRV9NT0RFLHtiZWdpbjppfSkse2JlZ2luOi9cKFwpL30sX119XSxpbGxlZ2FsOi8jKD8hISkvfX19KCkpOwpobGpzLnJlZ2lzdGVyTGFuZ3VhZ2UoImpzb24iLGZ1bmN0aW9uKCl7cmV0dXJuIGZ1bmN0aW9uKG4pe3ZhciBlPXtsaXRlcmFsOiJ0cnVlIGZhbHNlIG51bGwifSxpPVtuLkNfTElORV9DT01NRU5UX01PREUsbi5DX0JMT0NLX0NPTU1FTlRfTU9ERV0sdD1bbi5RVU9URV9TVFJJTkdfTU9ERSxuLkNfTlVNQkVSX01PREVdLGE9e2VuZDoiLCIsZW5kc1dpdGhQYXJlbnQ6ITAsZXhjbHVkZUVuZDohMCxjb250YWluczp0LGtleXdvcmRzOmV9LGw9e2JlZ2luOiJ7IixlbmQ6In0iLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJhdHRyIixiZWdpbjovIi8sZW5kOi8iLyxjb250YWluczpbbi5CQUNLU0xBU0hfRVNDQVBFXSxpbGxlZ2FsOiJcXG4ifSxuLmluaGVyaXQoYSx7YmVnaW46LzovfSldLmNvbmNhdChpKSxpbGxlZ2FsOiJcXFMifSxzPXtiZWdpbjoiXFxbIixlbmQ6IlxcXSIsY29udGFpbnM6W24uaW5oZXJpdChhKV0saWxsZWdhbDoiXFxTIn07cmV0dXJuIHQucHVzaChsLHMpLGkuZm9yRWFjaCgoZnVuY3Rpb24obil7dC5wdXNoKG4pO30pKSx7bmFtZToiSlNPTiIsY29udGFpbnM6dCxrZXl3b3JkczplLGlsbGVnYWw6IlxcUyJ9fX0oKSk7CmhsanMucmVnaXN0ZXJMYW5ndWFnZSgieG1sIixmdW5jdGlvbigpe3JldHVybiBmdW5jdGlvbihlKXt2YXIgbj17Y2xhc3NOYW1lOiJzeW1ib2wiLGJlZ2luOiImW2Etel0rO3wmI1swLTldKzt8JiN4W2EtZjAtOV0rOyJ9LGE9e2JlZ2luOiJcXHMiLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJtZXRhLWtleXdvcmQiLGJlZ2luOiIjP1thLXpfXVthLXoxLTlfLV0rIixpbGxlZ2FsOiJcXG4ifV19LHM9ZS5pbmhlcml0KGEse2JlZ2luOiJcXCgiLGVuZDoiXFwpIn0pLHQ9ZS5pbmhlcml0KGUuQVBPU19TVFJJTkdfTU9ERSx7Y2xhc3NOYW1lOiJtZXRhLXN0cmluZyJ9KSxpPWUuaW5oZXJpdChlLlFVT1RFX1NUUklOR19NT0RFLHtjbGFzc05hbWU6Im1ldGEtc3RyaW5nIn0pLGM9e2VuZHNXaXRoUGFyZW50OiEwLGlsbGVnYWw6LzwvLHJlbGV2YW5jZTowLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJhdHRyIixiZWdpbjoiW0EtWmEtejAtOVxcLl86LV0rIixyZWxldmFuY2U6MH0se2JlZ2luOi89XHMqLyxyZWxldmFuY2U6MCxjb250YWluczpbe2NsYXNzTmFtZToic3RyaW5nIixlbmRzUGFyZW50OiEwLHZhcmlhbnRzOlt7YmVnaW46LyIvLGVuZDovIi8sY29udGFpbnM6W25dfSx7YmVnaW46LycvLGVuZDovJy8sY29udGFpbnM6W25dfSx7YmVnaW46L1teXHMiJz08PmBdKy99XX1dfV19O3JldHVybiB7bmFtZToiSFRNTCwgWE1MIixhbGlhc2VzOlsiaHRtbCIsInhodG1sIiwicnNzIiwiYXRvbSIsInhqYiIsInhzZCIsInhzbCIsInBsaXN0Iiwid3NmIiwic3ZnIl0sY2FzZV9pbnNlbnNpdGl2ZTohMCxjb250YWluczpbe2NsYXNzTmFtZToibWV0YSIsYmVnaW46IjwhW2Etel0iLGVuZDoiPiIscmVsZXZhbmNlOjEwLGNvbnRhaW5zOlthLGksdCxzLHtiZWdpbjoiXFxbIixlbmQ6IlxcXSIsY29udGFpbnM6W3tjbGFzc05hbWU6Im1ldGEiLGJlZ2luOiI8IVthLXpdIixlbmQ6Ij4iLGNvbnRhaW5zOlthLHMsaSx0XX1dfV19LGUuQ09NTUVOVCgiXHgzYyEtLSIsIi0tXHgzZSIse3JlbGV2YW5jZToxMH0pLHtiZWdpbjoiPFxcIVxcW0NEQVRBXFxbIixlbmQ6IlxcXVxcXT4iLHJlbGV2YW5jZToxMH0sbix7Y2xhc3NOYW1lOiJtZXRhIixiZWdpbjovPFw/eG1sLyxlbmQ6L1w/Pi8scmVsZXZhbmNlOjEwfSx7Y2xhc3NOYW1lOiJ0YWciLGJlZ2luOiI8c3R5bGUoPz1cXHN8PikiLGVuZDoiPiIsa2V5d29yZHM6e25hbWU6InN0eWxlIn0sY29udGFpbnM6W2NdLHN0YXJ0czp7ZW5kOiI8L3N0eWxlPiIscmV0dXJuRW5kOiEwLHN1Ykxhbmd1YWdlOlsiY3NzIiwieG1sIl19fSx7Y2xhc3NOYW1lOiJ0YWciLGJlZ2luOiI8c2NyaXB0KD89XFxzfD4pIixlbmQ6Ij4iLGtleXdvcmRzOntuYW1lOiJzY3JpcHQifSxjb250YWluczpbY10sc3RhcnRzOntlbmQ6IjxcL3NjcmlwdD4iLHJldHVybkVuZDohMCxzdWJMYW5ndWFnZTpbImphdmFzY3JpcHQiLCJoYW5kbGViYXJzIiwieG1sIl19fSx7Y2xhc3NOYW1lOiJ0YWciLGJlZ2luOiI8Lz8iLGVuZDoiLz8+Iixjb250YWluczpbe2NsYXNzTmFtZToibmFtZSIsYmVnaW46L1teXC8+PFxzXSsvLHJlbGV2YW5jZTowfSxjXX1dfX19KCkpOwpobGpzLnJlZ2lzdGVyTGFuZ3VhZ2UoIm1hcmtkb3duIixmdW5jdGlvbigpe3JldHVybiBmdW5jdGlvbihuKXtjb25zdCBlPXtiZWdpbjoiPCIsZW5kOiI+IixzdWJMYW5ndWFnZToieG1sIixyZWxldmFuY2U6MH0sYT17YmVnaW46IlxcWy4rP1xcXVtcXChcXFtdLio/W1xcKVxcXV0iLHJldHVybkJlZ2luOiEwLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJzdHJpbmciLGJlZ2luOiJcXFsiLGVuZDoiXFxdIixleGNsdWRlQmVnaW46ITAscmV0dXJuRW5kOiEwLHJlbGV2YW5jZTowfSx7Y2xhc3NOYW1lOiJsaW5rIixiZWdpbjoiXFxdXFwoIixlbmQ6IlxcKSIsZXhjbHVkZUJlZ2luOiEwLGV4Y2x1ZGVFbmQ6ITB9LHtjbGFzc05hbWU6InN5bWJvbCIsYmVnaW46IlxcXVxcWyIsZW5kOiJcXF0iLGV4Y2x1ZGVCZWdpbjohMCxleGNsdWRlRW5kOiEwfV0scmVsZXZhbmNlOjEwfSxpPXtjbGFzc05hbWU6InN0cm9uZyIsY29udGFpbnM6W10sdmFyaWFudHM6W3tiZWdpbjovX3syfS8sZW5kOi9fezJ9L30se2JlZ2luOi9cKnsyfS8sZW5kOi9cKnsyfS99XX0scz17Y2xhc3NOYW1lOiJlbXBoYXNpcyIsY29udGFpbnM6W10sdmFyaWFudHM6W3tiZWdpbjovXCooPyFcKikvLGVuZDovXCovfSx7YmVnaW46L18oPyFfKS8sZW5kOi9fLyxyZWxldmFuY2U6MH1dfTtpLmNvbnRhaW5zLnB1c2gocykscy5jb250YWlucy5wdXNoKGkpO3ZhciBjPVtlLGFdO3JldHVybiBpLmNvbnRhaW5zPWkuY29udGFpbnMuY29uY2F0KGMpLHMuY29udGFpbnM9cy5jb250YWlucy5jb25jYXQoYykse25hbWU6Ik1hcmtkb3duIixhbGlhc2VzOlsibWQiLCJta2Rvd24iLCJta2QiXSxjb250YWluczpbe2NsYXNzTmFtZToic2VjdGlvbiIsdmFyaWFudHM6W3tiZWdpbjoiXiN7MSw2fSIsZW5kOiIkIixjb250YWluczpjPWMuY29uY2F0KGkscyl9LHtiZWdpbjoiKD89Xi4rP1xcbls9LV17Mix9JCkiLGNvbnRhaW5zOlt7YmVnaW46Il5bPS1dKiQifSx7YmVnaW46Il4iLGVuZDoiXFxuIixjb250YWluczpjfV19XX0sZSx7Y2xhc3NOYW1lOiJidWxsZXQiLGJlZ2luOiJeWyBcdF0qKFsqKy1dfChcXGQrXFwuKSkoPz1cXHMrKSIsZW5kOiJcXHMrIixleGNsdWRlRW5kOiEwfSxpLHMse2NsYXNzTmFtZToicXVvdGUiLGJlZ2luOiJePlxccysiLGNvbnRhaW5zOmMsZW5kOiIkIn0se2NsYXNzTmFtZToiY29kZSIsdmFyaWFudHM6W3tiZWdpbjoiKGB7Myx9KSgufFxcbikqP1xcMWAqWyBdKiJ9LHtiZWdpbjoiKH57Myx9KSgufFxcbikqP1xcMX4qWyBdKiJ9LHtiZWdpbjoiYGBgIixlbmQ6ImBgYCtbIF0qJCJ9LHtiZWdpbjoifn5+IixlbmQ6In5+fitbIF0qJCJ9LHtiZWdpbjoiYC4rP2AifSx7YmVnaW46Iig/PV4oIHs0fXxcXHQpKSIsY29udGFpbnM6W3tiZWdpbjoiXiggezR9fFxcdCkiLGVuZDoiKFxcbikkIn1dLHJlbGV2YW5jZTowfV19LHtiZWdpbjoiXlstXFwqXXszLH0iLGVuZDoiJCJ9LGEse2JlZ2luOi9eXFtbXlxuXStcXTovLHJldHVybkJlZ2luOiEwLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJzeW1ib2wiLGJlZ2luOi9cWy8sZW5kOi9cXS8sZXhjbHVkZUJlZ2luOiEwLGV4Y2x1ZGVFbmQ6ITB9LHtjbGFzc05hbWU6ImxpbmsiLGJlZ2luOi86XHMqLyxlbmQ6LyQvLGV4Y2x1ZGVCZWdpbjohMH1dfV19fX0oKSk7CmhsanMucmVnaXN0ZXJMYW5ndWFnZSgicHl0aG9uIixmdW5jdGlvbigpe3JldHVybiBmdW5jdGlvbihlKXt2YXIgbj17a2V5d29yZDoiYW5kIGVsaWYgaXMgZ2xvYmFsIGFzIGluIGlmIGZyb20gcmFpc2UgZm9yIGV4Y2VwdCBmaW5hbGx5IHByaW50IGltcG9ydCBwYXNzIHJldHVybiBleGVjIGVsc2UgYnJlYWsgbm90IHdpdGggY2xhc3MgYXNzZXJ0IHlpZWxkIHRyeSB3aGlsZSBjb250aW51ZSBkZWwgb3IgZGVmIGxhbWJkYSBhc3luYyBhd2FpdCBub25sb2NhbHwxMCIsYnVpbHRfaW46IkVsbGlwc2lzIE5vdEltcGxlbWVudGVkIixsaXRlcmFsOiJGYWxzZSBOb25lIFRydWUifSxhPXtjbGFzc05hbWU6Im1ldGEiLGJlZ2luOi9eKD4+PnxcLlwuXC4pIC99LGk9e2NsYXNzTmFtZToic3Vic3QiLGJlZ2luOi9cey8sZW5kOi9cfS8sa2V5d29yZHM6bixpbGxlZ2FsOi8jL30scz17YmVnaW46L1x7XHsvLHJlbGV2YW5jZTowfSxyPXtjbGFzc05hbWU6InN0cmluZyIsY29udGFpbnM6W2UuQkFDS1NMQVNIX0VTQ0FQRV0sdmFyaWFudHM6W3tiZWdpbjovKHV8Yik/cj8nJycvLGVuZDovJycnLyxjb250YWluczpbZS5CQUNLU0xBU0hfRVNDQVBFLGFdLHJlbGV2YW5jZToxMH0se2JlZ2luOi8odXxiKT9yPyIiIi8sZW5kOi8iIiIvLGNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEUsYV0scmVsZXZhbmNlOjEwfSx7YmVnaW46LyhmcnxyZnxmKScnJy8sZW5kOi8nJycvLGNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEUsYSxzLGldfSx7YmVnaW46LyhmcnxyZnxmKSIiIi8sZW5kOi8iIiIvLGNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEUsYSxzLGldfSx7YmVnaW46Lyh1fHJ8dXIpJy8sZW5kOi8nLyxyZWxldmFuY2U6MTB9LHtiZWdpbjovKHV8cnx1cikiLyxlbmQ6LyIvLHJlbGV2YW5jZToxMH0se2JlZ2luOi8oYnxiciknLyxlbmQ6LycvfSx7YmVnaW46LyhifGJyKSIvLGVuZDovIi99LHtiZWdpbjovKGZyfHJmfGYpJy8sZW5kOi8nLyxjb250YWluczpbZS5CQUNLU0xBU0hfRVNDQVBFLHMsaV19LHtiZWdpbjovKGZyfHJmfGYpIi8sZW5kOi8iLyxjb250YWluczpbZS5CQUNLU0xBU0hfRVNDQVBFLHMsaV19LGUuQVBPU19TVFJJTkdfTU9ERSxlLlFVT1RFX1NUUklOR19NT0RFXX0sbD17Y2xhc3NOYW1lOiJudW1iZXIiLHJlbGV2YW5jZTowLHZhcmlhbnRzOlt7YmVnaW46ZS5CSU5BUllfTlVNQkVSX1JFKyJbbExqSl0/In0se2JlZ2luOiJcXGIoMG9bMC03XSspW2xMakpdPyJ9LHtiZWdpbjplLkNfTlVNQkVSX1JFKyJbbExqSl0/In1dfSx0PXtjbGFzc05hbWU6InBhcmFtcyIsdmFyaWFudHM6W3tiZWdpbjovXChccypcKS8sc2tpcDohMCxjbGFzc05hbWU6bnVsbH0se2JlZ2luOi9cKC8sZW5kOi9cKS8sZXhjbHVkZUJlZ2luOiEwLGV4Y2x1ZGVFbmQ6ITAsY29udGFpbnM6WyJzZWxmIixhLGwscixlLkhBU0hfQ09NTUVOVF9NT0RFXX1dfTtyZXR1cm4gaS5jb250YWlucz1bcixsLGFdLHtuYW1lOiJQeXRob24iLGFsaWFzZXM6WyJweSIsImd5cCIsImlweXRob24iXSxrZXl3b3JkczpuLGlsbGVnYWw6Lyg8XC98LT58XD8pfD0+Lyxjb250YWluczpbYSxsLHtiZWdpbktleXdvcmRzOiJpZiIscmVsZXZhbmNlOjB9LHIsZS5IQVNIX0NPTU1FTlRfTU9ERSx7dmFyaWFudHM6W3tjbGFzc05hbWU6ImZ1bmN0aW9uIixiZWdpbktleXdvcmRzOiJkZWYifSx7Y2xhc3NOYW1lOiJjbGFzcyIsYmVnaW5LZXl3b3JkczoiY2xhc3MifV0sZW5kOi86LyxpbGxlZ2FsOi9bJHs9O1xuLF0vLGNvbnRhaW5zOltlLlVOREVSU0NPUkVfVElUTEVfTU9ERSx0LHtiZWdpbjovLT4vLGVuZHNXaXRoUGFyZW50OiEwLGtleXdvcmRzOiJOb25lIn1dfSx7Y2xhc3NOYW1lOiJtZXRhIixiZWdpbjovXltcdCBdKkAvLGVuZDovJC99LHtiZWdpbjovXGIocHJpbnR8ZXhlYylcKC99XX19fSgpKTsKaGxqcy5yZWdpc3Rlckxhbmd1YWdlKCJ5YW1sIixmdW5jdGlvbigpe3JldHVybiBmdW5jdGlvbihlKXt2YXIgbj0idHJ1ZSBmYWxzZSB5ZXMgbm8gbnVsbCIsYT0iW1xcdyM7Lz86QCY9KyQsLn4qXFwnKClbXFxdXSsiLHM9e2NsYXNzTmFtZToic3RyaW5nIixyZWxldmFuY2U6MCx2YXJpYW50czpbe2JlZ2luOi8nLyxlbmQ6LycvfSx7YmVnaW46LyIvLGVuZDovIi99LHtiZWdpbjovXFMrL31dLGNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEUse2NsYXNzTmFtZToidGVtcGxhdGUtdmFyaWFibGUiLHZhcmlhbnRzOlt7YmVnaW46Int7IixlbmQ6In19In0se2JlZ2luOiIleyIsZW5kOiJ9In1dfV19LGk9ZS5pbmhlcml0KHMse3ZhcmlhbnRzOlt7YmVnaW46LycvLGVuZDovJy99LHtiZWdpbjovIi8sZW5kOi8iL30se2JlZ2luOi9bXlxzLHt9W1xdXSsvfV19KSxsPXtlbmQ6IiwiLGVuZHNXaXRoUGFyZW50OiEwLGV4Y2x1ZGVFbmQ6ITAsY29udGFpbnM6W10sa2V5d29yZHM6bixyZWxldmFuY2U6MH0sdD17YmVnaW46InsiLGVuZDoifSIsY29udGFpbnM6W2xdLGlsbGVnYWw6IlxcbiIscmVsZXZhbmNlOjB9LGc9e2JlZ2luOiJcXFsiLGVuZDoiXFxdIixjb250YWluczpbbF0saWxsZWdhbDoiXFxuIixyZWxldmFuY2U6MH0sYj1be2NsYXNzTmFtZToiYXR0ciIsdmFyaWFudHM6W3tiZWdpbjoiXFx3W1xcdyA6XFwvLi1dKjooPz1bIFx0XXwkKSJ9LHtiZWdpbjonIlxcd1tcXHcgOlxcLy4tXSoiOig/PVsgXHRdfCQpJ30se2JlZ2luOiInXFx3W1xcdyA6XFwvLi1dKic6KD89WyBcdF18JCkifV19LHtjbGFzc05hbWU6Im1ldGEiLGJlZ2luOiJeLS0tcyokIixyZWxldmFuY2U6MTB9LHtjbGFzc05hbWU6InN0cmluZyIsYmVnaW46IltcXHw+XShbMC05XT9bKy1dKT9bIF0qXFxuKCAqKVtcXFMgXStcXG4oXFwyW1xcUyBdK1xcbj8pKiJ9LHtiZWdpbjoiPCVbJT0tXT8iLGVuZDoiWyUtXT8lPiIsc3ViTGFuZ3VhZ2U6InJ1YnkiLGV4Y2x1ZGVCZWdpbjohMCxleGNsdWRlRW5kOiEwLHJlbGV2YW5jZTowfSx7Y2xhc3NOYW1lOiJ0eXBlIixiZWdpbjoiIVxcdyshIithfSx7Y2xhc3NOYW1lOiJ0eXBlIixiZWdpbjoiITwiK2ErIj4ifSx7Y2xhc3NOYW1lOiJ0eXBlIixiZWdpbjoiISIrYX0se2NsYXNzTmFtZToidHlwZSIsYmVnaW46IiEhIithfSx7Y2xhc3NOYW1lOiJtZXRhIixiZWdpbjoiJiIrZS5VTkRFUlNDT1JFX0lERU5UX1JFKyIkIn0se2NsYXNzTmFtZToibWV0YSIsYmVnaW46IlxcKiIrZS5VTkRFUlNDT1JFX0lERU5UX1JFKyIkIn0se2NsYXNzTmFtZToiYnVsbGV0IixiZWdpbjoiXFwtKD89WyBdfCQpIixyZWxldmFuY2U6MH0sZS5IQVNIX0NPTU1FTlRfTU9ERSx7YmVnaW5LZXl3b3JkczpuLGtleXdvcmRzOntsaXRlcmFsOm59fSx7Y2xhc3NOYW1lOiJudW1iZXIiLGJlZ2luOiJcXGJbMC05XXs0fSgtWzAtOV1bMC05XSl7MCwyfShbVHQgXFx0XVswLTldWzAtOV0/KDpbMC05XVswLTldKXsyfSk/KFxcLlswLTldKik/KFsgXFx0XSkqKFp8Wy0rXVswLTldWzAtOV0/KDpbMC05XVswLTldKT8pP1xcYiJ9LHtjbGFzc05hbWU6Im51bWJlciIsYmVnaW46ZS5DX05VTUJFUl9SRSsiXFxiIn0sdCxnLHNdLGM9Wy4uLmJdO3JldHVybiBjLnBvcCgpLGMucHVzaChpKSxsLmNvbnRhaW5zPWMse25hbWU6IllBTUwiLGNhc2VfaW5zZW5zaXRpdmU6ITAsYWxpYXNlczpbInltbCIsIllBTUwiXSxjb250YWluczpifX19KCkpOwoK', 'data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29kZVdvcmtlci5qcyIsInNvdXJjZXMiOlsic3JjL3RleHQvQ29kZVdvcmtlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBAdHMtbm9jaGVja1xub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG5cdGhsanMuY29uZmlndXJlKHt9KVxuXHRjb25zdCByZXN1bHQgPSBobGpzLmhpZ2hsaWdodEF1dG8oZXZlbnQuZGF0YSk7XG5cdHBvc3RNZXNzYWdlKHJlc3VsdC52YWx1ZSk7XG59O1xuXG4vKlxuICBIaWdobGlnaHQuanMgMTAuMS4wICg3NGRlNmVhYSlcbiAgTGljZW5zZTogQlNELTMtQ2xhdXNlXG4gIENvcHlyaWdodCAoYykgMjAwNi0yMDIwLCBJdmFuIFNhZ2FsYWV2XG4qL1xudmFyIGhsanM9ZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBlKG4pe09iamVjdC5mcmVlemUobik7dmFyIHQ9XCJmdW5jdGlvblwiPT10eXBlb2YgbjtyZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobikuZm9yRWFjaCgoZnVuY3Rpb24ocil7IU9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG4scil8fG51bGw9PT1uW3JdfHxcIm9iamVjdFwiIT10eXBlb2YgbltyXSYmXCJmdW5jdGlvblwiIT10eXBlb2YgbltyXXx8dCYmKFwiY2FsbGVyXCI9PT1yfHxcImNhbGxlZVwiPT09cnx8XCJhcmd1bWVudHNcIj09PXIpfHxPYmplY3QuaXNGcm96ZW4obltyXSl8fGUobltyXSl9KSksbn1jbGFzcyBue2NvbnN0cnVjdG9yKGUpe3ZvaWQgMD09PWUuZGF0YSYmKGUuZGF0YT17fSksdGhpcy5kYXRhPWUuZGF0YX1pZ25vcmVNYXRjaCgpe3RoaXMuaWdub3JlPSEwfX1mdW5jdGlvbiB0KGUpe3JldHVybiBlLnJlcGxhY2UoLyYvZyxcIiZhbXA7XCIpLnJlcGxhY2UoLzwvZyxcIiZsdDtcIikucmVwbGFjZSgvPi9nLFwiJmd0O1wiKS5yZXBsYWNlKC9cIi9nLFwiJnF1b3Q7XCIpLnJlcGxhY2UoLycvZyxcIiYjeDI3O1wiKX1mdW5jdGlvbiByKGUsLi4ubil7dmFyIHQ9e307Zm9yKGNvbnN0IG4gaW4gZSl0W25dPWVbbl07cmV0dXJuIG4uZm9yRWFjaCgoZnVuY3Rpb24oZSl7Zm9yKGNvbnN0IG4gaW4gZSl0W25dPWVbbl19KSksdH1mdW5jdGlvbiBhKGUpe3JldHVybiBlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCl9dmFyIGk9T2JqZWN0LmZyZWV6ZSh7X19wcm90b19fOm51bGwsZXNjYXBlSFRNTDp0LGluaGVyaXQ6cixub2RlU3RyZWFtOmZ1bmN0aW9uKGUpe3ZhciBuPVtdO3JldHVybiBmdW5jdGlvbiBlKHQscil7Zm9yKHZhciBpPXQuZmlyc3RDaGlsZDtpO2k9aS5uZXh0U2libGluZykzPT09aS5ub2RlVHlwZT9yKz1pLm5vZGVWYWx1ZS5sZW5ndGg6MT09PWkubm9kZVR5cGUmJihuLnB1c2goe2V2ZW50Olwic3RhcnRcIixvZmZzZXQ6cixub2RlOml9KSxyPWUoaSxyKSxhKGkpLm1hdGNoKC9icnxocnxpbWd8aW5wdXQvKXx8bi5wdXNoKHtldmVudDpcInN0b3BcIixvZmZzZXQ6cixub2RlOml9KSk7cmV0dXJuIHJ9KGUsMCksbn0sbWVyZ2VTdHJlYW1zOmZ1bmN0aW9uKGUsbixyKXt2YXIgaT0wLHM9XCJcIixvPVtdO2Z1bmN0aW9uIGwoKXtyZXR1cm4gZS5sZW5ndGgmJm4ubGVuZ3RoP2VbMF0ub2Zmc2V0IT09blswXS5vZmZzZXQ/ZVswXS5vZmZzZXQ8blswXS5vZmZzZXQ/ZTpuOlwic3RhcnRcIj09PW5bMF0uZXZlbnQ/ZTpuOmUubGVuZ3RoP2U6bn1mdW5jdGlvbiBjKGUpe3MrPVwiPFwiK2EoZSkrW10ubWFwLmNhbGwoZS5hdHRyaWJ1dGVzLChmdW5jdGlvbihlKXtyZXR1cm5cIiBcIitlLm5vZGVOYW1lKyc9XCInK3QoZS52YWx1ZSkrJ1wiJ30pKS5qb2luKFwiXCIpK1wiPlwifWZ1bmN0aW9uIHUoZSl7cys9XCI8L1wiK2EoZSkrXCI+XCJ9ZnVuY3Rpb24gZChlKXsoXCJzdGFydFwiPT09ZS5ldmVudD9jOnUpKGUubm9kZSl9Zm9yKDtlLmxlbmd0aHx8bi5sZW5ndGg7KXt2YXIgZz1sKCk7aWYocys9dChyLnN1YnN0cmluZyhpLGdbMF0ub2Zmc2V0KSksaT1nWzBdLm9mZnNldCxnPT09ZSl7by5yZXZlcnNlKCkuZm9yRWFjaCh1KTtkb3tkKGcuc3BsaWNlKDAsMSlbMF0pLGc9bCgpfXdoaWxlKGc9PT1lJiZnLmxlbmd0aCYmZ1swXS5vZmZzZXQ9PT1pKTtvLnJldmVyc2UoKS5mb3JFYWNoKGMpfWVsc2VcInN0YXJ0XCI9PT1nWzBdLmV2ZW50P28ucHVzaChnWzBdLm5vZGUpOm8ucG9wKCksZChnLnNwbGljZSgwLDEpWzBdKX1yZXR1cm4gcyt0KHIuc3Vic3RyKGkpKX19KTtjb25zdCBzPVwiPC9zcGFuPlwiLG89ZT0+ISFlLmtpbmQ7Y2xhc3MgbHtjb25zdHJ1Y3RvcihlLG4pe3RoaXMuYnVmZmVyPVwiXCIsdGhpcy5jbGFzc1ByZWZpeD1uLmNsYXNzUHJlZml4LGUud2Fsayh0aGlzKX1hZGRUZXh0KGUpe3RoaXMuYnVmZmVyKz10KGUpfW9wZW5Ob2RlKGUpe2lmKCFvKGUpKXJldHVybjtsZXQgbj1lLmtpbmQ7ZS5zdWJsYW5ndWFnZXx8KG49YCR7dGhpcy5jbGFzc1ByZWZpeH0ke259YCksdGhpcy5zcGFuKG4pfWNsb3NlTm9kZShlKXtvKGUpJiYodGhpcy5idWZmZXIrPXMpfXZhbHVlKCl7cmV0dXJuIHRoaXMuYnVmZmVyfXNwYW4oZSl7dGhpcy5idWZmZXIrPWA8c3BhbiBjbGFzcz1cIiR7ZX1cIj5gfX1jbGFzcyBje2NvbnN0cnVjdG9yKCl7dGhpcy5yb290Tm9kZT17Y2hpbGRyZW46W119LHRoaXMuc3RhY2s9W3RoaXMucm9vdE5vZGVdfWdldCB0b3AoKXtyZXR1cm4gdGhpcy5zdGFja1t0aGlzLnN0YWNrLmxlbmd0aC0xXX1nZXQgcm9vdCgpe3JldHVybiB0aGlzLnJvb3ROb2RlfWFkZChlKXt0aGlzLnRvcC5jaGlsZHJlbi5wdXNoKGUpfW9wZW5Ob2RlKGUpe2NvbnN0IG49e2tpbmQ6ZSxjaGlsZHJlbjpbXX07dGhpcy5hZGQobiksdGhpcy5zdGFjay5wdXNoKG4pfWNsb3NlTm9kZSgpe2lmKHRoaXMuc3RhY2subGVuZ3RoPjEpcmV0dXJuIHRoaXMuc3RhY2sucG9wKCl9Y2xvc2VBbGxOb2Rlcygpe2Zvcig7dGhpcy5jbG9zZU5vZGUoKTspO310b0pTT04oKXtyZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5yb290Tm9kZSxudWxsLDQpfXdhbGsoZSl7cmV0dXJuIHRoaXMuY29uc3RydWN0b3IuX3dhbGsoZSx0aGlzLnJvb3ROb2RlKX1zdGF0aWMgX3dhbGsoZSxuKXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2Ygbj9lLmFkZFRleHQobik6bi5jaGlsZHJlbiYmKGUub3Blbk5vZGUobiksbi5jaGlsZHJlbi5mb3JFYWNoKG49PnRoaXMuX3dhbGsoZSxuKSksZS5jbG9zZU5vZGUobikpLGV9c3RhdGljIF9jb2xsYXBzZShlKXtcInN0cmluZ1wiIT10eXBlb2YgZSYmZS5jaGlsZHJlbiYmKGUuY2hpbGRyZW4uZXZlcnkoZT0+XCJzdHJpbmdcIj09dHlwZW9mIGUpP2UuY2hpbGRyZW49W2UuY2hpbGRyZW4uam9pbihcIlwiKV06ZS5jaGlsZHJlbi5mb3JFYWNoKGU9PntjLl9jb2xsYXBzZShlKX0pKX19Y2xhc3MgdSBleHRlbmRzIGN7Y29uc3RydWN0b3IoZSl7c3VwZXIoKSx0aGlzLm9wdGlvbnM9ZX1hZGRLZXl3b3JkKGUsbil7XCJcIiE9PWUmJih0aGlzLm9wZW5Ob2RlKG4pLHRoaXMuYWRkVGV4dChlKSx0aGlzLmNsb3NlTm9kZSgpKX1hZGRUZXh0KGUpe1wiXCIhPT1lJiZ0aGlzLmFkZChlKX1hZGRTdWJsYW5ndWFnZShlLG4pe2NvbnN0IHQ9ZS5yb290O3Qua2luZD1uLHQuc3VibGFuZ3VhZ2U9ITAsdGhpcy5hZGQodCl9dG9IVE1MKCl7cmV0dXJuIG5ldyBsKHRoaXMsdGhpcy5vcHRpb25zKS52YWx1ZSgpfWZpbmFsaXplKCl7cmV0dXJuITB9fWZ1bmN0aW9uIGQoZSl7cmV0dXJuIGU/XCJzdHJpbmdcIj09dHlwZW9mIGU/ZTplLnNvdXJjZTpudWxsfWNvbnN0IGc9XCIoLT8pKFxcXFxiMFt4WF1bYS1mQS1GMC05XSt8KFxcXFxiXFxcXGQrKFxcXFwuXFxcXGQqKT98XFxcXC5cXFxcZCspKFtlRV1bLStdP1xcXFxkKyk/KVwiLGg9e2JlZ2luOlwiXFxcXFxcXFxbXFxcXHNcXFxcU11cIixyZWxldmFuY2U6MH0sZj17Y2xhc3NOYW1lOlwic3RyaW5nXCIsYmVnaW46XCInXCIsZW5kOlwiJ1wiLGlsbGVnYWw6XCJcXFxcblwiLGNvbnRhaW5zOltoXX0scD17Y2xhc3NOYW1lOlwic3RyaW5nXCIsYmVnaW46J1wiJyxlbmQ6J1wiJyxpbGxlZ2FsOlwiXFxcXG5cIixjb250YWluczpbaF19LGI9e2JlZ2luOi9cXGIoYXxhbnx0aGV8YXJlfEknbXxpc24ndHxkb24ndHxkb2Vzbid0fHdvbid0fGJ1dHxqdXN0fHNob3VsZHxwcmV0dHl8c2ltcGx5fGVub3VnaHxnb25uYXxnb2luZ3x3dGZ8c298c3VjaHx3aWxsfHlvdXx5b3VyfHRoZXl8bGlrZXxtb3JlKVxcYi99LG09ZnVuY3Rpb24oZSxuLHQ9e30pe3ZhciBhPXIoe2NsYXNzTmFtZTpcImNvbW1lbnRcIixiZWdpbjplLGVuZDpuLGNvbnRhaW5zOltdfSx0KTtyZXR1cm4gYS5jb250YWlucy5wdXNoKGIpLGEuY29udGFpbnMucHVzaCh7Y2xhc3NOYW1lOlwiZG9jdGFnXCIsYmVnaW46XCIoPzpUT0RPfEZJWE1FfE5PVEV8QlVHfE9QVElNSVpFfEhBQ0t8WFhYKTpcIixyZWxldmFuY2U6MH0pLGF9LHY9bShcIi8vXCIsXCIkXCIpLHg9bShcIi9cXFxcKlwiLFwiXFxcXCovXCIpLEU9bShcIiNcIixcIiRcIik7dmFyIF89T2JqZWN0LmZyZWV6ZSh7X19wcm90b19fOm51bGwsSURFTlRfUkU6XCJbYS16QS1aXVxcXFx3KlwiLFVOREVSU0NPUkVfSURFTlRfUkU6XCJbYS16QS1aX11cXFxcdypcIixOVU1CRVJfUkU6XCJcXFxcYlxcXFxkKyhcXFxcLlxcXFxkKyk/XCIsQ19OVU1CRVJfUkU6ZyxCSU5BUllfTlVNQkVSX1JFOlwiXFxcXGIoMGJbMDFdKylcIixSRV9TVEFSVEVSU19SRTpcIiF8IT18IT09fCV8JT18JnwmJnwmPXxcXFxcKnxcXFxcKj18XFxcXCt8XFxcXCs9fCx8LXwtPXwvPXwvfDp8O3w8PHw8PD18PD18PHw9PT18PT18PXw+Pj49fD4+PXw+PXw+Pj58Pj58PnxcXFxcP3xcXFxcW3xcXFxce3xcXFxcKHxcXFxcXnxcXFxcXj18XFxcXHx8XFxcXHw9fFxcXFx8XFxcXHx8flwiLFNIRUJBTkc6KGU9e30pPT57Y29uc3Qgbj0vXiMhWyBdKlxcLy87cmV0dXJuIGUuYmluYXJ5JiYoZS5iZWdpbj1mdW5jdGlvbiguLi5lKXtyZXR1cm4gZS5tYXAoZT0+ZChlKSkuam9pbihcIlwiKX0obiwvLipcXGIvLGUuYmluYXJ5LC9cXGIuKi8pKSxyKHtjbGFzc05hbWU6XCJtZXRhXCIsYmVnaW46bixlbmQ6LyQvLHJlbGV2YW5jZTowLFwib246YmVnaW5cIjooZSxuKT0+ezAhPT1lLmluZGV4JiZuLmlnbm9yZU1hdGNoKCl9fSxlKX0sQkFDS1NMQVNIX0VTQ0FQRTpoLEFQT1NfU1RSSU5HX01PREU6ZixRVU9URV9TVFJJTkdfTU9ERTpwLFBIUkFTQUxfV09SRFNfTU9ERTpiLENPTU1FTlQ6bSxDX0xJTkVfQ09NTUVOVF9NT0RFOnYsQ19CTE9DS19DT01NRU5UX01PREU6eCxIQVNIX0NPTU1FTlRfTU9ERTpFLE5VTUJFUl9NT0RFOntjbGFzc05hbWU6XCJudW1iZXJcIixiZWdpbjpcIlxcXFxiXFxcXGQrKFxcXFwuXFxcXGQrKT9cIixyZWxldmFuY2U6MH0sQ19OVU1CRVJfTU9ERTp7Y2xhc3NOYW1lOlwibnVtYmVyXCIsYmVnaW46ZyxyZWxldmFuY2U6MH0sQklOQVJZX05VTUJFUl9NT0RFOntjbGFzc05hbWU6XCJudW1iZXJcIixiZWdpbjpcIlxcXFxiKDBiWzAxXSspXCIscmVsZXZhbmNlOjB9LENTU19OVU1CRVJfTU9ERTp7Y2xhc3NOYW1lOlwibnVtYmVyXCIsYmVnaW46XCJcXFxcYlxcXFxkKyhcXFxcLlxcXFxkKyk/KCV8ZW18ZXh8Y2h8cmVtfHZ3fHZofHZtaW58dm1heHxjbXxtbXxpbnxwdHxwY3xweHxkZWd8Z3JhZHxyYWR8dHVybnxzfG1zfEh6fGtIenxkcGl8ZHBjbXxkcHB4KT9cIixyZWxldmFuY2U6MH0sUkVHRVhQX01PREU6e2JlZ2luOi8oPz1cXC9bXi9cXG5dKlxcLykvLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOlwicmVnZXhwXCIsYmVnaW46L1xcLy8sZW5kOi9cXC9bZ2ltdXldKi8saWxsZWdhbDovXFxuLyxjb250YWluczpbaCx7YmVnaW46L1xcWy8sZW5kOi9cXF0vLHJlbGV2YW5jZTowLGNvbnRhaW5zOltoXX1dfV19LFRJVExFX01PREU6e2NsYXNzTmFtZTpcInRpdGxlXCIsYmVnaW46XCJbYS16QS1aXVxcXFx3KlwiLHJlbGV2YW5jZTowfSxVTkRFUlNDT1JFX1RJVExFX01PREU6e2NsYXNzTmFtZTpcInRpdGxlXCIsYmVnaW46XCJbYS16QS1aX11cXFxcdypcIixyZWxldmFuY2U6MH0sTUVUSE9EX0dVQVJEOntiZWdpbjpcIlxcXFwuXFxcXHMqW2EtekEtWl9dXFxcXHcqXCIscmVsZXZhbmNlOjB9LEVORF9TQU1FX0FTX0JFR0lOOmZ1bmN0aW9uKGUpe3JldHVybiBPYmplY3QuYXNzaWduKGUse1wib246YmVnaW5cIjooZSxuKT0+e24uZGF0YS5fYmVnaW5NYXRjaD1lWzFdfSxcIm9uOmVuZFwiOihlLG4pPT57bi5kYXRhLl9iZWdpbk1hdGNoIT09ZVsxXSYmbi5pZ25vcmVNYXRjaCgpfX0pfX0pLE49XCJvZiBhbmQgZm9yIGluIG5vdCBvciBpZiB0aGVuXCIuc3BsaXQoXCIgXCIpO2Z1bmN0aW9uIHcoZSxuKXtyZXR1cm4gbj8rbjpmdW5jdGlvbihlKXtyZXR1cm4gTi5pbmNsdWRlcyhlLnRvTG93ZXJDYXNlKCkpfShlKT8wOjF9Y29uc3QgUj10LHk9cix7bm9kZVN0cmVhbTprLG1lcmdlU3RyZWFtczpPfT1pLE09U3ltYm9sKFwibm9tYXRjaFwiKTtyZXR1cm4gZnVuY3Rpb24odCl7dmFyIGE9W10saT17fSxzPXt9LG89W10sbD0hMCxjPS8oXig8W14+XSs+fFxcdHwpK3xcXG4pL2dtLGc9XCJDb3VsZCBub3QgZmluZCB0aGUgbGFuZ3VhZ2UgJ3t9JywgZGlkIHlvdSBmb3JnZXQgdG8gbG9hZC9pbmNsdWRlIGEgbGFuZ3VhZ2UgbW9kdWxlP1wiO2NvbnN0IGg9e2Rpc2FibGVBdXRvZGV0ZWN0OiEwLG5hbWU6XCJQbGFpbiB0ZXh0XCIsY29udGFpbnM6W119O3ZhciBmPXtub0hpZ2hsaWdodFJlOi9eKG5vLT9oaWdobGlnaHQpJC9pLGxhbmd1YWdlRGV0ZWN0UmU6L1xcYmxhbmcoPzp1YWdlKT8tKFtcXHctXSspXFxiL2ksY2xhc3NQcmVmaXg6XCJobGpzLVwiLHRhYlJlcGxhY2U6bnVsbCx1c2VCUjohMSxsYW5ndWFnZXM6bnVsbCxfX2VtaXR0ZXI6dX07ZnVuY3Rpb24gcChlKXtyZXR1cm4gZi5ub0hpZ2hsaWdodFJlLnRlc3QoZSl9ZnVuY3Rpb24gYihlLG4sdCxyKXt2YXIgYT17Y29kZTpuLGxhbmd1YWdlOmV9O1MoXCJiZWZvcmU6aGlnaGxpZ2h0XCIsYSk7dmFyIGk9YS5yZXN1bHQ/YS5yZXN1bHQ6bShhLmxhbmd1YWdlLGEuY29kZSx0LHIpO3JldHVybiBpLmNvZGU9YS5jb2RlLFMoXCJhZnRlcjpoaWdobGlnaHRcIixpKSxpfWZ1bmN0aW9uIG0oZSx0LGEscyl7dmFyIG89dDtmdW5jdGlvbiBjKGUsbil7dmFyIHQ9RS5jYXNlX2luc2Vuc2l0aXZlP25bMF0udG9Mb3dlckNhc2UoKTpuWzBdO3JldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZS5rZXl3b3Jkcyx0KSYmZS5rZXl3b3Jkc1t0XX1mdW5jdGlvbiB1KCl7bnVsbCE9eS5zdWJMYW5ndWFnZT9mdW5jdGlvbigpe2lmKFwiXCIhPT1BKXt2YXIgZT1udWxsO2lmKFwic3RyaW5nXCI9PXR5cGVvZiB5LnN1Ykxhbmd1YWdlKXtpZighaVt5LnN1Ykxhbmd1YWdlXSlyZXR1cm4gdm9pZCBPLmFkZFRleHQoQSk7ZT1tKHkuc3ViTGFuZ3VhZ2UsQSwhMCxrW3kuc3ViTGFuZ3VhZ2VdKSxrW3kuc3ViTGFuZ3VhZ2VdPWUudG9wfWVsc2UgZT12KEEseS5zdWJMYW5ndWFnZS5sZW5ndGg/eS5zdWJMYW5ndWFnZTpudWxsKTt5LnJlbGV2YW5jZT4wJiYoSSs9ZS5yZWxldmFuY2UpLE8uYWRkU3VibGFuZ3VhZ2UoZS5lbWl0dGVyLGUubGFuZ3VhZ2UpfX0oKTpmdW5jdGlvbigpe2lmKCF5LmtleXdvcmRzKXJldHVybiB2b2lkIE8uYWRkVGV4dChBKTtsZXQgZT0wO3kua2V5d29yZFBhdHRlcm5SZS5sYXN0SW5kZXg9MDtsZXQgbj15LmtleXdvcmRQYXR0ZXJuUmUuZXhlYyhBKSx0PVwiXCI7Zm9yKDtuOyl7dCs9QS5zdWJzdHJpbmcoZSxuLmluZGV4KTtjb25zdCByPWMoeSxuKTtpZihyKXtjb25zdFtlLGFdPXI7Ty5hZGRUZXh0KHQpLHQ9XCJcIixJKz1hLE8uYWRkS2V5d29yZChuWzBdLGUpfWVsc2UgdCs9blswXTtlPXkua2V5d29yZFBhdHRlcm5SZS5sYXN0SW5kZXgsbj15LmtleXdvcmRQYXR0ZXJuUmUuZXhlYyhBKX10Kz1BLnN1YnN0cihlKSxPLmFkZFRleHQodCl9KCksQT1cIlwifWZ1bmN0aW9uIGgoZSl7cmV0dXJuIGUuY2xhc3NOYW1lJiZPLm9wZW5Ob2RlKGUuY2xhc3NOYW1lKSx5PU9iamVjdC5jcmVhdGUoZSx7cGFyZW50Ont2YWx1ZTp5fX0pfWZ1bmN0aW9uIHAoZSl7cmV0dXJuIDA9PT15Lm1hdGNoZXIucmVnZXhJbmRleD8oQSs9ZVswXSwxKTooTD0hMCwwKX12YXIgYj17fTtmdW5jdGlvbiB4KHQscil7dmFyIGk9ciYmclswXTtpZihBKz10LG51bGw9PWkpcmV0dXJuIHUoKSwwO2lmKFwiYmVnaW5cIj09PWIudHlwZSYmXCJlbmRcIj09PXIudHlwZSYmYi5pbmRleD09PXIuaW5kZXgmJlwiXCI9PT1pKXtpZihBKz1vLnNsaWNlKHIuaW5kZXgsci5pbmRleCsxKSwhbCl7Y29uc3Qgbj1FcnJvcihcIjAgd2lkdGggbWF0Y2ggcmVnZXhcIik7dGhyb3cgbi5sYW5ndWFnZU5hbWU9ZSxuLmJhZFJ1bGU9Yi5ydWxlLG59cmV0dXJuIDF9aWYoYj1yLFwiYmVnaW5cIj09PXIudHlwZSlyZXR1cm4gZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxyPWUucnVsZTtjb25zdCBhPW5ldyBuKHIpLGk9W3IuX19iZWZvcmVCZWdpbixyW1wib246YmVnaW5cIl1dO2Zvcihjb25zdCBuIG9mIGkpaWYobiYmKG4oZSxhKSxhLmlnbm9yZSkpcmV0dXJuIHAodCk7cmV0dXJuIHImJnIuZW5kU2FtZUFzQmVnaW4mJihyLmVuZFJlPVJlZ0V4cCh0LnJlcGxhY2UoL1stL1xcXFxeJCorPy4oKXxbXFxde31dL2csXCJcXFxcJCZcIiksXCJtXCIpKSxyLnNraXA/QSs9dDooci5leGNsdWRlQmVnaW4mJihBKz10KSx1KCksci5yZXR1cm5CZWdpbnx8ci5leGNsdWRlQmVnaW58fChBPXQpKSxoKHIpLHIucmV0dXJuQmVnaW4/MDp0Lmxlbmd0aH0ocik7aWYoXCJpbGxlZ2FsXCI9PT1yLnR5cGUmJiFhKXtjb25zdCBlPUVycm9yKCdJbGxlZ2FsIGxleGVtZSBcIicraSsnXCIgZm9yIG1vZGUgXCInKyh5LmNsYXNzTmFtZXx8XCI8dW5uYW1lZD5cIikrJ1wiJyk7dGhyb3cgZS5tb2RlPXksZX1pZihcImVuZFwiPT09ci50eXBlKXt2YXIgcz1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLHI9by5zdWJzdHIoZS5pbmRleCksYT1mdW5jdGlvbiBlKHQscixhKXtsZXQgaT1mdW5jdGlvbihlLG4pe3ZhciB0PWUmJmUuZXhlYyhuKTtyZXR1cm4gdCYmMD09PXQuaW5kZXh9KHQuZW5kUmUsYSk7aWYoaSl7aWYodFtcIm9uOmVuZFwiXSl7Y29uc3QgZT1uZXcgbih0KTt0W1wib246ZW5kXCJdKHIsZSksZS5pZ25vcmUmJihpPSExKX1pZihpKXtmb3IoO3QuZW5kc1BhcmVudCYmdC5wYXJlbnQ7KXQ9dC5wYXJlbnQ7cmV0dXJuIHR9fWlmKHQuZW5kc1dpdGhQYXJlbnQpcmV0dXJuIGUodC5wYXJlbnQscixhKX0oeSxlLHIpO2lmKCFhKXJldHVybiBNO3ZhciBpPXk7aS5za2lwP0ErPXQ6KGkucmV0dXJuRW5kfHxpLmV4Y2x1ZGVFbmR8fChBKz10KSx1KCksaS5leGNsdWRlRW5kJiYoQT10KSk7ZG97eS5jbGFzc05hbWUmJk8uY2xvc2VOb2RlKCkseS5za2lwfHx5LnN1Ykxhbmd1YWdlfHwoSSs9eS5yZWxldmFuY2UpLHk9eS5wYXJlbnR9d2hpbGUoeSE9PWEucGFyZW50KTtyZXR1cm4gYS5zdGFydHMmJihhLmVuZFNhbWVBc0JlZ2luJiYoYS5zdGFydHMuZW5kUmU9YS5lbmRSZSksaChhLnN0YXJ0cykpLGkucmV0dXJuRW5kPzA6dC5sZW5ndGh9KHIpO2lmKHMhPT1NKXJldHVybiBzfWlmKFwiaWxsZWdhbFwiPT09ci50eXBlJiZcIlwiPT09aSlyZXR1cm4gMTtpZihCPjFlNSYmQj4zKnIuaW5kZXgpdGhyb3cgRXJyb3IoXCJwb3RlbnRpYWwgaW5maW5pdGUgbG9vcCwgd2F5IG1vcmUgaXRlcmF0aW9ucyB0aGFuIG1hdGNoZXNcIik7cmV0dXJuIEErPWksaS5sZW5ndGh9dmFyIEU9VChlKTtpZighRSl0aHJvdyBjb25zb2xlLmVycm9yKGcucmVwbGFjZShcInt9XCIsZSkpLEVycm9yKCdVbmtub3duIGxhbmd1YWdlOiBcIicrZSsnXCInKTt2YXIgXz1mdW5jdGlvbihlKXtmdW5jdGlvbiBuKG4sdCl7cmV0dXJuIFJlZ0V4cChkKG4pLFwibVwiKyhlLmNhc2VfaW5zZW5zaXRpdmU/XCJpXCI6XCJcIikrKHQ/XCJnXCI6XCJcIikpfWNsYXNzIHR7Y29uc3RydWN0b3IoKXt0aGlzLm1hdGNoSW5kZXhlcz17fSx0aGlzLnJlZ2V4ZXM9W10sdGhpcy5tYXRjaEF0PTEsdGhpcy5wb3NpdGlvbj0wfWFkZFJ1bGUoZSxuKXtuLnBvc2l0aW9uPXRoaXMucG9zaXRpb24rKyx0aGlzLm1hdGNoSW5kZXhlc1t0aGlzLm1hdGNoQXRdPW4sdGhpcy5yZWdleGVzLnB1c2goW24sZV0pLHRoaXMubWF0Y2hBdCs9ZnVuY3Rpb24oZSl7cmV0dXJuIFJlZ0V4cChlLnRvU3RyaW5nKCkrXCJ8XCIpLmV4ZWMoXCJcIikubGVuZ3RoLTF9KGUpKzF9Y29tcGlsZSgpezA9PT10aGlzLnJlZ2V4ZXMubGVuZ3RoJiYodGhpcy5leGVjPSgpPT5udWxsKTtjb25zdCBlPXRoaXMucmVnZXhlcy5tYXAoZT0+ZVsxXSk7dGhpcy5tYXRjaGVyUmU9bihmdW5jdGlvbihlLG49XCJ8XCIpe2Zvcih2YXIgdD0vXFxbKD86W15cXFxcXFxdXXxcXFxcLikqXFxdfFxcKFxcPz98XFxcXChbMS05XVswLTldKil8XFxcXC4vLHI9MCxhPVwiXCIsaT0wO2k8ZS5sZW5ndGg7aSsrKXt2YXIgcz1yKz0xLG89ZChlW2ldKTtmb3IoaT4wJiYoYSs9biksYSs9XCIoXCI7by5sZW5ndGg+MDspe3ZhciBsPXQuZXhlYyhvKTtpZihudWxsPT1sKXthKz1vO2JyZWFrfWErPW8uc3Vic3RyaW5nKDAsbC5pbmRleCksbz1vLnN1YnN0cmluZyhsLmluZGV4K2xbMF0ubGVuZ3RoKSxcIlxcXFxcIj09PWxbMF1bMF0mJmxbMV0/YSs9XCJcXFxcXCIrKCtsWzFdK3MpOihhKz1sWzBdLFwiKFwiPT09bFswXSYmcisrKX1hKz1cIilcIn1yZXR1cm4gYX0oZSksITApLHRoaXMubGFzdEluZGV4PTB9ZXhlYyhlKXt0aGlzLm1hdGNoZXJSZS5sYXN0SW5kZXg9dGhpcy5sYXN0SW5kZXg7Y29uc3Qgbj10aGlzLm1hdGNoZXJSZS5leGVjKGUpO2lmKCFuKXJldHVybiBudWxsO2NvbnN0IHQ9bi5maW5kSW5kZXgoKGUsbik9Pm4+MCYmdm9pZCAwIT09ZSkscj10aGlzLm1hdGNoSW5kZXhlc1t0XTtyZXR1cm4gbi5zcGxpY2UoMCx0KSxPYmplY3QuYXNzaWduKG4scil9fWNsYXNzIGF7Y29uc3RydWN0b3IoKXt0aGlzLnJ1bGVzPVtdLHRoaXMubXVsdGlSZWdleGVzPVtdLHRoaXMuY291bnQ9MCx0aGlzLmxhc3RJbmRleD0wLHRoaXMucmVnZXhJbmRleD0wfWdldE1hdGNoZXIoZSl7aWYodGhpcy5tdWx0aVJlZ2V4ZXNbZV0pcmV0dXJuIHRoaXMubXVsdGlSZWdleGVzW2VdO2NvbnN0IG49bmV3IHQ7cmV0dXJuIHRoaXMucnVsZXMuc2xpY2UoZSkuZm9yRWFjaCgoW2UsdF0pPT5uLmFkZFJ1bGUoZSx0KSksbi5jb21waWxlKCksdGhpcy5tdWx0aVJlZ2V4ZXNbZV09bixufWNvbnNpZGVyQWxsKCl7dGhpcy5yZWdleEluZGV4PTB9YWRkUnVsZShlLG4pe3RoaXMucnVsZXMucHVzaChbZSxuXSksXCJiZWdpblwiPT09bi50eXBlJiZ0aGlzLmNvdW50Kyt9ZXhlYyhlKXtjb25zdCBuPXRoaXMuZ2V0TWF0Y2hlcih0aGlzLnJlZ2V4SW5kZXgpO24ubGFzdEluZGV4PXRoaXMubGFzdEluZGV4O2NvbnN0IHQ9bi5leGVjKGUpO3JldHVybiB0JiYodGhpcy5yZWdleEluZGV4Kz10LnBvc2l0aW9uKzEsdGhpcy5yZWdleEluZGV4PT09dGhpcy5jb3VudCYmKHRoaXMucmVnZXhJbmRleD0wKSksdH19ZnVuY3Rpb24gaShlLG4pe2NvbnN0IHQ9ZS5pbnB1dFtlLmluZGV4LTFdLHI9ZS5pbnB1dFtlLmluZGV4K2VbMF0ubGVuZ3RoXTtcIi5cIiE9PXQmJlwiLlwiIT09cnx8bi5pZ25vcmVNYXRjaCgpfWlmKGUuY29udGFpbnMmJmUuY29udGFpbnMuaW5jbHVkZXMoXCJzZWxmXCIpKXRocm93IEVycm9yKFwiRVJSOiBjb250YWlucyBgc2VsZmAgaXMgbm90IHN1cHBvcnRlZCBhdCB0aGUgdG9wLWxldmVsIG9mIGEgbGFuZ3VhZ2UuICBTZWUgZG9jdW1lbnRhdGlvbi5cIik7cmV0dXJuIGZ1bmN0aW9uIHQocyxvKXtjb25zdCBsPXM7aWYocy5jb21waWxlZClyZXR1cm4gbDtzLmNvbXBpbGVkPSEwLHMuX19iZWZvcmVCZWdpbj1udWxsLHMua2V5d29yZHM9cy5rZXl3b3Jkc3x8cy5iZWdpbktleXdvcmRzO2xldCBjPW51bGw7aWYoXCJvYmplY3RcIj09dHlwZW9mIHMua2V5d29yZHMmJihjPXMua2V5d29yZHMuJHBhdHRlcm4sZGVsZXRlIHMua2V5d29yZHMuJHBhdHRlcm4pLHMua2V5d29yZHMmJihzLmtleXdvcmRzPWZ1bmN0aW9uKGUsbil7dmFyIHQ9e307cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIGU/cihcImtleXdvcmRcIixlKTpPYmplY3Qua2V5cyhlKS5mb3JFYWNoKChmdW5jdGlvbihuKXtyKG4sZVtuXSl9KSksdDtmdW5jdGlvbiByKGUscil7biYmKHI9ci50b0xvd2VyQ2FzZSgpKSxyLnNwbGl0KFwiIFwiKS5mb3JFYWNoKChmdW5jdGlvbihuKXt2YXIgcj1uLnNwbGl0KFwifFwiKTt0W3JbMF1dPVtlLHcoclswXSxyWzFdKV19KSl9fShzLmtleXdvcmRzLGUuY2FzZV9pbnNlbnNpdGl2ZSkpLHMubGV4ZW1lcyYmYyl0aHJvdyBFcnJvcihcIkVSUjogUHJlZmVyIGBrZXl3b3Jkcy4kcGF0dGVybmAgdG8gYG1vZGUubGV4ZW1lc2AsIEJPVEggYXJlIG5vdCBhbGxvd2VkLiAoc2VlIG1vZGUgcmVmZXJlbmNlKSBcIik7cmV0dXJuIGwua2V5d29yZFBhdHRlcm5SZT1uKHMubGV4ZW1lc3x8Y3x8L1xcdysvLCEwKSxvJiYocy5iZWdpbktleXdvcmRzJiYocy5iZWdpbj1cIlxcXFxiKFwiK3MuYmVnaW5LZXl3b3Jkcy5zcGxpdChcIiBcIikuam9pbihcInxcIikrXCIpKD89XFxcXGJ8XFxcXHMpXCIscy5fX2JlZm9yZUJlZ2luPWkpLHMuYmVnaW58fChzLmJlZ2luPS9cXEJ8XFxiLyksbC5iZWdpblJlPW4ocy5iZWdpbikscy5lbmRTYW1lQXNCZWdpbiYmKHMuZW5kPXMuYmVnaW4pLHMuZW5kfHxzLmVuZHNXaXRoUGFyZW50fHwocy5lbmQ9L1xcQnxcXGIvKSxzLmVuZCYmKGwuZW5kUmU9bihzLmVuZCkpLGwudGVybWluYXRvcl9lbmQ9ZChzLmVuZCl8fFwiXCIscy5lbmRzV2l0aFBhcmVudCYmby50ZXJtaW5hdG9yX2VuZCYmKGwudGVybWluYXRvcl9lbmQrPShzLmVuZD9cInxcIjpcIlwiKStvLnRlcm1pbmF0b3JfZW5kKSkscy5pbGxlZ2FsJiYobC5pbGxlZ2FsUmU9bihzLmlsbGVnYWwpKSx2b2lkIDA9PT1zLnJlbGV2YW5jZSYmKHMucmVsZXZhbmNlPTEpLHMuY29udGFpbnN8fChzLmNvbnRhaW5zPVtdKSxzLmNvbnRhaW5zPVtdLmNvbmNhdCguLi5zLmNvbnRhaW5zLm1hcCgoZnVuY3Rpb24oZSl7cmV0dXJuIGZ1bmN0aW9uKGUpe3JldHVybiBlLnZhcmlhbnRzJiYhZS5jYWNoZWRfdmFyaWFudHMmJihlLmNhY2hlZF92YXJpYW50cz1lLnZhcmlhbnRzLm1hcCgoZnVuY3Rpb24obil7cmV0dXJuIHIoZSx7dmFyaWFudHM6bnVsbH0sbil9KSkpLGUuY2FjaGVkX3ZhcmlhbnRzP2UuY2FjaGVkX3ZhcmlhbnRzOmZ1bmN0aW9uIGUobil7cmV0dXJuISFuJiYobi5lbmRzV2l0aFBhcmVudHx8ZShuLnN0YXJ0cykpfShlKT9yKGUse3N0YXJ0czplLnN0YXJ0cz9yKGUuc3RhcnRzKTpudWxsfSk6T2JqZWN0LmlzRnJvemVuKGUpP3IoZSk6ZX0oXCJzZWxmXCI9PT1lP3M6ZSl9KSkpLHMuY29udGFpbnMuZm9yRWFjaCgoZnVuY3Rpb24oZSl7dChlLGwpfSkpLHMuc3RhcnRzJiZ0KHMuc3RhcnRzLG8pLGwubWF0Y2hlcj1mdW5jdGlvbihlKXtjb25zdCBuPW5ldyBhO3JldHVybiBlLmNvbnRhaW5zLmZvckVhY2goZT0+bi5hZGRSdWxlKGUuYmVnaW4se3J1bGU6ZSx0eXBlOlwiYmVnaW5cIn0pKSxlLnRlcm1pbmF0b3JfZW5kJiZuLmFkZFJ1bGUoZS50ZXJtaW5hdG9yX2VuZCx7dHlwZTpcImVuZFwifSksZS5pbGxlZ2FsJiZuLmFkZFJ1bGUoZS5pbGxlZ2FsLHt0eXBlOlwiaWxsZWdhbFwifSksbn0obCksbH0oZSl9KEUpLE49XCJcIix5PXN8fF8saz17fSxPPW5ldyBmLl9fZW1pdHRlcihmKTshZnVuY3Rpb24oKXtmb3IodmFyIGU9W10sbj15O24hPT1FO249bi5wYXJlbnQpbi5jbGFzc05hbWUmJmUudW5zaGlmdChuLmNsYXNzTmFtZSk7ZS5mb3JFYWNoKGU9Pk8ub3Blbk5vZGUoZSkpfSgpO3ZhciBBPVwiXCIsST0wLFM9MCxCPTAsTD0hMTt0cnl7Zm9yKHkubWF0Y2hlci5jb25zaWRlckFsbCgpOzspe0IrKyxMP0w9ITE6KHkubWF0Y2hlci5sYXN0SW5kZXg9Uyx5Lm1hdGNoZXIuY29uc2lkZXJBbGwoKSk7Y29uc3QgZT15Lm1hdGNoZXIuZXhlYyhvKTtpZighZSlicmVhaztjb25zdCBuPXgoby5zdWJzdHJpbmcoUyxlLmluZGV4KSxlKTtTPWUuaW5kZXgrbn1yZXR1cm4geChvLnN1YnN0cihTKSksTy5jbG9zZUFsbE5vZGVzKCksTy5maW5hbGl6ZSgpLE49Ty50b0hUTUwoKSx7cmVsZXZhbmNlOkksdmFsdWU6TixsYW5ndWFnZTplLGlsbGVnYWw6ITEsZW1pdHRlcjpPLHRvcDp5fX1jYXRjaChuKXtpZihuLm1lc3NhZ2UmJm4ubWVzc2FnZS5pbmNsdWRlcyhcIklsbGVnYWxcIikpcmV0dXJue2lsbGVnYWw6ITAsaWxsZWdhbEJ5Onttc2c6bi5tZXNzYWdlLGNvbnRleHQ6by5zbGljZShTLTEwMCxTKzEwMCksbW9kZTpuLm1vZGV9LHNvZmFyOk4scmVsZXZhbmNlOjAsdmFsdWU6UihvKSxlbWl0dGVyOk99O2lmKGwpcmV0dXJue2lsbGVnYWw6ITEscmVsZXZhbmNlOjAsdmFsdWU6UihvKSxlbWl0dGVyOk8sbGFuZ3VhZ2U6ZSx0b3A6eSxlcnJvclJhaXNlZDpufTt0aHJvdyBufX1mdW5jdGlvbiB2KGUsbil7bj1ufHxmLmxhbmd1YWdlc3x8T2JqZWN0LmtleXMoaSk7dmFyIHQ9ZnVuY3Rpb24oZSl7Y29uc3Qgbj17cmVsZXZhbmNlOjAsZW1pdHRlcjpuZXcgZi5fX2VtaXR0ZXIoZiksdmFsdWU6UihlKSxpbGxlZ2FsOiExLHRvcDpofTtyZXR1cm4gbi5lbWl0dGVyLmFkZFRleHQoZSksbn0oZSkscj10O3JldHVybiBuLmZpbHRlcihUKS5maWx0ZXIoSSkuZm9yRWFjaCgoZnVuY3Rpb24obil7dmFyIGE9bShuLGUsITEpO2EubGFuZ3VhZ2U9bixhLnJlbGV2YW5jZT5yLnJlbGV2YW5jZSYmKHI9YSksYS5yZWxldmFuY2U+dC5yZWxldmFuY2UmJihyPXQsdD1hKX0pKSxyLmxhbmd1YWdlJiYodC5zZWNvbmRfYmVzdD1yKSx0fWZ1bmN0aW9uIHgoZSl7cmV0dXJuIGYudGFiUmVwbGFjZXx8Zi51c2VCUj9lLnJlcGxhY2UoYyxlPT5cIlxcblwiPT09ZT9mLnVzZUJSP1wiPGJyPlwiOmU6Zi50YWJSZXBsYWNlP2UucmVwbGFjZSgvXFx0L2csZi50YWJSZXBsYWNlKTplKTplfWZ1bmN0aW9uIEUoZSl7bGV0IG49bnVsbDtjb25zdCB0PWZ1bmN0aW9uKGUpe3ZhciBuPWUuY2xhc3NOYW1lK1wiIFwiO24rPWUucGFyZW50Tm9kZT9lLnBhcmVudE5vZGUuY2xhc3NOYW1lOlwiXCI7Y29uc3QgdD1mLmxhbmd1YWdlRGV0ZWN0UmUuZXhlYyhuKTtpZih0KXt2YXIgcj1UKHRbMV0pO3JldHVybiByfHwoY29uc29sZS53YXJuKGcucmVwbGFjZShcInt9XCIsdFsxXSkpLGNvbnNvbGUud2FybihcIkZhbGxpbmcgYmFjayB0byBuby1oaWdobGlnaHQgbW9kZSBmb3IgdGhpcyBibG9jay5cIixlKSkscj90WzFdOlwibm8taGlnaGxpZ2h0XCJ9cmV0dXJuIG4uc3BsaXQoL1xccysvKS5maW5kKGU9PnAoZSl8fFQoZSkpfShlKTtpZihwKHQpKXJldHVybjtTKFwiYmVmb3JlOmhpZ2hsaWdodEJsb2NrXCIse2Jsb2NrOmUsbGFuZ3VhZ2U6dH0pLGYudXNlQlI/KG49ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSkuaW5uZXJIVE1MPWUuaW5uZXJIVE1MLnJlcGxhY2UoL1xcbi9nLFwiXCIpLnJlcGxhY2UoLzxiclsgL10qPi9nLFwiXFxuXCIpOm49ZTtjb25zdCByPW4udGV4dENvbnRlbnQsYT10P2IodCxyLCEwKTp2KHIpLGk9ayhuKTtpZihpLmxlbmd0aCl7Y29uc3QgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2UuaW5uZXJIVE1MPWEudmFsdWUsYS52YWx1ZT1PKGksayhlKSxyKX1hLnZhbHVlPXgoYS52YWx1ZSksUyhcImFmdGVyOmhpZ2hsaWdodEJsb2NrXCIse2Jsb2NrOmUscmVzdWx0OmF9KSxlLmlubmVySFRNTD1hLnZhbHVlLGUuY2xhc3NOYW1lPWZ1bmN0aW9uKGUsbix0KXt2YXIgcj1uP3Nbbl06dCxhPVtlLnRyaW0oKV07cmV0dXJuIGUubWF0Y2goL1xcYmhsanNcXGIvKXx8YS5wdXNoKFwiaGxqc1wiKSxlLmluY2x1ZGVzKHIpfHxhLnB1c2gociksYS5qb2luKFwiIFwiKS50cmltKCl9KGUuY2xhc3NOYW1lLHQsYS5sYW5ndWFnZSksZS5yZXN1bHQ9e2xhbmd1YWdlOmEubGFuZ3VhZ2UscmU6YS5yZWxldmFuY2UscmVsYXZhbmNlOmEucmVsZXZhbmNlfSxhLnNlY29uZF9iZXN0JiYoZS5zZWNvbmRfYmVzdD17bGFuZ3VhZ2U6YS5zZWNvbmRfYmVzdC5sYW5ndWFnZSxyZTphLnNlY29uZF9iZXN0LnJlbGV2YW5jZSxyZWxhdmFuY2U6YS5zZWNvbmRfYmVzdC5yZWxldmFuY2V9KX1jb25zdCBOPSgpPT57aWYoIU4uY2FsbGVkKXtOLmNhbGxlZD0hMDt2YXIgZT1kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwicHJlIGNvZGVcIik7YS5mb3JFYWNoLmNhbGwoZSxFKX19O2Z1bmN0aW9uIFQoZSl7cmV0dXJuIGU9KGV8fFwiXCIpLnRvTG93ZXJDYXNlKCksaVtlXXx8aVtzW2VdXX1mdW5jdGlvbiBBKGUse2xhbmd1YWdlTmFtZTpufSl7XCJzdHJpbmdcIj09dHlwZW9mIGUmJihlPVtlXSksZS5mb3JFYWNoKGU9PntzW2VdPW59KX1mdW5jdGlvbiBJKGUpe3ZhciBuPVQoZSk7cmV0dXJuIG4mJiFuLmRpc2FibGVBdXRvZGV0ZWN0fWZ1bmN0aW9uIFMoZSxuKXt2YXIgdD1lO28uZm9yRWFjaCgoZnVuY3Rpb24oZSl7ZVt0XSYmZVt0XShuKX0pKX1PYmplY3QuYXNzaWduKHQse2hpZ2hsaWdodDpiLGhpZ2hsaWdodEF1dG86dixmaXhNYXJrdXA6eCxoaWdobGlnaHRCbG9jazpFLGNvbmZpZ3VyZTpmdW5jdGlvbihlKXtmPXkoZixlKX0saW5pdEhpZ2hsaWdodGluZzpOLGluaXRIaWdobGlnaHRpbmdPbkxvYWQ6ZnVuY3Rpb24oKXt3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIixOLCExKX0scmVnaXN0ZXJMYW5ndWFnZTpmdW5jdGlvbihlLG4pe3ZhciByPW51bGw7dHJ5e3I9bih0KX1jYXRjaChuKXtpZihjb25zb2xlLmVycm9yKFwiTGFuZ3VhZ2UgZGVmaW5pdGlvbiBmb3IgJ3t9JyBjb3VsZCBub3QgYmUgcmVnaXN0ZXJlZC5cIi5yZXBsYWNlKFwie31cIixlKSksIWwpdGhyb3cgbjtjb25zb2xlLmVycm9yKG4pLHI9aH1yLm5hbWV8fChyLm5hbWU9ZSksaVtlXT1yLHIucmF3RGVmaW5pdGlvbj1uLmJpbmQobnVsbCx0KSxyLmFsaWFzZXMmJkEoci5hbGlhc2VzLHtsYW5ndWFnZU5hbWU6ZX0pfSxsaXN0TGFuZ3VhZ2VzOmZ1bmN0aW9uKCl7cmV0dXJuIE9iamVjdC5rZXlzKGkpfSxnZXRMYW5ndWFnZTpULHJlZ2lzdGVyQWxpYXNlczpBLHJlcXVpcmVMYW5ndWFnZTpmdW5jdGlvbihlKXt2YXIgbj1UKGUpO2lmKG4pcmV0dXJuIG47dGhyb3cgRXJyb3IoXCJUaGUgJ3t9JyBsYW5ndWFnZSBpcyByZXF1aXJlZCwgYnV0IG5vdCBsb2FkZWQuXCIucmVwbGFjZShcInt9XCIsZSkpfSxhdXRvRGV0ZWN0aW9uOkksaW5oZXJpdDp5LGFkZFBsdWdpbjpmdW5jdGlvbihlKXtvLnB1c2goZSl9fSksdC5kZWJ1Z01vZGU9ZnVuY3Rpb24oKXtsPSExfSx0LnNhZmVNb2RlPWZ1bmN0aW9uKCl7bD0hMH0sdC52ZXJzaW9uU3RyaW5nPVwiMTAuMS4wXCI7Zm9yKGNvbnN0IG4gaW4gXylcIm9iamVjdFwiPT10eXBlb2YgX1tuXSYmZShfW25dKTtyZXR1cm4gT2JqZWN0LmFzc2lnbih0LF8pLHR9KHt9KX0oKTtcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZSYmKG1vZHVsZS5leHBvcnRzPWhsanMpO1xuaGxqcy5yZWdpc3Rlckxhbmd1YWdlKFwiY3NzXCIsZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtyZXR1cm4gZnVuY3Rpb24oZSl7dmFyIG49e2JlZ2luOi8oPzpbQS1aXFxfXFwuXFwtXSt8LS1bYS16QS1aMC05Xy1dKylcXHMqOi8scmV0dXJuQmVnaW46ITAsZW5kOlwiO1wiLGVuZHNXaXRoUGFyZW50OiEwLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOlwiYXR0cmlidXRlXCIsYmVnaW46L1xcUy8sZW5kOlwiOlwiLGV4Y2x1ZGVFbmQ6ITAsc3RhcnRzOntlbmRzV2l0aFBhcmVudDohMCxleGNsdWRlRW5kOiEwLGNvbnRhaW5zOlt7YmVnaW46L1tcXHctXStcXCgvLHJldHVybkJlZ2luOiEwLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOlwiYnVpbHRfaW5cIixiZWdpbjovW1xcdy1dKy99LHtiZWdpbjovXFwoLyxlbmQ6L1xcKS8sY29udGFpbnM6W2UuQVBPU19TVFJJTkdfTU9ERSxlLlFVT1RFX1NUUklOR19NT0RFLGUuQ1NTX05VTUJFUl9NT0RFXX1dfSxlLkNTU19OVU1CRVJfTU9ERSxlLlFVT1RFX1NUUklOR19NT0RFLGUuQVBPU19TVFJJTkdfTU9ERSxlLkNfQkxPQ0tfQ09NTUVOVF9NT0RFLHtjbGFzc05hbWU6XCJudW1iZXJcIixiZWdpbjpcIiNbMC05QS1GYS1mXStcIn0se2NsYXNzTmFtZTpcIm1ldGFcIixiZWdpbjpcIiFpbXBvcnRhbnRcIn1dfX1dfTtyZXR1cm57bmFtZTpcIkNTU1wiLGNhc2VfaW5zZW5zaXRpdmU6ITAsaWxsZWdhbDovWz1cXC98J1xcJF0vLGNvbnRhaW5zOltlLkNfQkxPQ0tfQ09NTUVOVF9NT0RFLHtjbGFzc05hbWU6XCJzZWxlY3Rvci1pZFwiLGJlZ2luOi8jW0EtWmEtejAtOV8tXSsvfSx7Y2xhc3NOYW1lOlwic2VsZWN0b3ItY2xhc3NcIixiZWdpbjovXFwuW0EtWmEtejAtOV8tXSsvfSx7Y2xhc3NOYW1lOlwic2VsZWN0b3ItYXR0clwiLGJlZ2luOi9cXFsvLGVuZDovXFxdLyxpbGxlZ2FsOlwiJFwiLGNvbnRhaW5zOltlLkFQT1NfU1RSSU5HX01PREUsZS5RVU9URV9TVFJJTkdfTU9ERV19LHtjbGFzc05hbWU6XCJzZWxlY3Rvci1wc2V1ZG9cIixiZWdpbjovOig6KT9bYS16QS1aMC05XFxfXFwtXFwrXFwoXFwpXCInLl0rL30se2JlZ2luOlwiQChwYWdlfGZvbnQtZmFjZSlcIixsZXhlbWVzOlwiQFthLXotXStcIixrZXl3b3JkczpcIkBwYWdlIEBmb250LWZhY2VcIn0se2JlZ2luOlwiQFwiLGVuZDpcIlt7O11cIixpbGxlZ2FsOi86LyxyZXR1cm5CZWdpbjohMCxjb250YWluczpbe2NsYXNzTmFtZTpcImtleXdvcmRcIixiZWdpbjovQFxcLT9cXHdbXFx3XSooXFwtXFx3KykqL30se2JlZ2luOi9cXHMvLGVuZHNXaXRoUGFyZW50OiEwLGV4Y2x1ZGVFbmQ6ITAscmVsZXZhbmNlOjAsa2V5d29yZHM6XCJhbmQgb3Igbm90IG9ubHlcIixjb250YWluczpbe2JlZ2luOi9bYS16LV0rOi8sY2xhc3NOYW1lOlwiYXR0cmlidXRlXCJ9LGUuQVBPU19TVFJJTkdfTU9ERSxlLlFVT1RFX1NUUklOR19NT0RFLGUuQ1NTX05VTUJFUl9NT0RFXX1dfSx7Y2xhc3NOYW1lOlwic2VsZWN0b3ItdGFnXCIsYmVnaW46XCJbYS16QS1aLV1bYS16QS1aMC05Xy1dKlwiLHJlbGV2YW5jZTowfSx7YmVnaW46XCJ7XCIsZW5kOlwifVwiLGlsbGVnYWw6L1xcUy8sY29udGFpbnM6W2UuQ19CTE9DS19DT01NRU5UX01PREUsbl19XX19fSgpKTtcbmhsanMucmVnaXN0ZXJMYW5ndWFnZShcImRpZmZcIixmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO3JldHVybiBmdW5jdGlvbihlKXtyZXR1cm57bmFtZTpcIkRpZmZcIixhbGlhc2VzOltcInBhdGNoXCJdLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOlwibWV0YVwiLHJlbGV2YW5jZToxMCx2YXJpYW50czpbe2JlZ2luOi9eQEAgK1xcLVxcZCssXFxkKyArXFwrXFxkKyxcXGQrICtAQCQvfSx7YmVnaW46L15cXCpcXCpcXCogK1xcZCssXFxkKyArXFwqXFwqXFwqXFwqJC99LHtiZWdpbjovXlxcLVxcLVxcLSArXFxkKyxcXGQrICtcXC1cXC1cXC1cXC0kL31dfSx7Y2xhc3NOYW1lOlwiY29tbWVudFwiLHZhcmlhbnRzOlt7YmVnaW46L0luZGV4OiAvLGVuZDovJC99LHtiZWdpbjovPXszLH0vLGVuZDovJC99LHtiZWdpbjovXlxcLXszfS8sZW5kOi8kL30se2JlZ2luOi9eXFwqezN9IC8sZW5kOi8kL30se2JlZ2luOi9eXFwrezN9LyxlbmQ6LyQvfSx7YmVnaW46L15cXCp7MTV9JC99XX0se2NsYXNzTmFtZTpcImFkZGl0aW9uXCIsYmVnaW46XCJeXFxcXCtcIixlbmQ6XCIkXCJ9LHtjbGFzc05hbWU6XCJkZWxldGlvblwiLGJlZ2luOlwiXlxcXFwtXCIsZW5kOlwiJFwifSx7Y2xhc3NOYW1lOlwiYWRkaXRpb25cIixiZWdpbjpcIl5cXFxcIVwiLGVuZDpcIiRcIn1dfX19KCkpO1xuaGxqcy5yZWdpc3Rlckxhbmd1YWdlKFwiamF2YXNjcmlwdFwiLGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7Y29uc3QgZT1bXCJhc1wiLFwiaW5cIixcIm9mXCIsXCJpZlwiLFwiZm9yXCIsXCJ3aGlsZVwiLFwiZmluYWxseVwiLFwidmFyXCIsXCJuZXdcIixcImZ1bmN0aW9uXCIsXCJkb1wiLFwicmV0dXJuXCIsXCJ2b2lkXCIsXCJlbHNlXCIsXCJicmVha1wiLFwiY2F0Y2hcIixcImluc3RhbmNlb2ZcIixcIndpdGhcIixcInRocm93XCIsXCJjYXNlXCIsXCJkZWZhdWx0XCIsXCJ0cnlcIixcInN3aXRjaFwiLFwiY29udGludWVcIixcInR5cGVvZlwiLFwiZGVsZXRlXCIsXCJsZXRcIixcInlpZWxkXCIsXCJjb25zdFwiLFwiY2xhc3NcIixcImRlYnVnZ2VyXCIsXCJhc3luY1wiLFwiYXdhaXRcIixcInN0YXRpY1wiLFwiaW1wb3J0XCIsXCJmcm9tXCIsXCJleHBvcnRcIixcImV4dGVuZHNcIl0sbj1bXCJ0cnVlXCIsXCJmYWxzZVwiLFwibnVsbFwiLFwidW5kZWZpbmVkXCIsXCJOYU5cIixcIkluZmluaXR5XCJdLGE9W10uY29uY2F0KFtcInNldEludGVydmFsXCIsXCJzZXRUaW1lb3V0XCIsXCJjbGVhckludGVydmFsXCIsXCJjbGVhclRpbWVvdXRcIixcInJlcXVpcmVcIixcImV4cG9ydHNcIixcImV2YWxcIixcImlzRmluaXRlXCIsXCJpc05hTlwiLFwicGFyc2VGbG9hdFwiLFwicGFyc2VJbnRcIixcImRlY29kZVVSSVwiLFwiZGVjb2RlVVJJQ29tcG9uZW50XCIsXCJlbmNvZGVVUklcIixcImVuY29kZVVSSUNvbXBvbmVudFwiLFwiZXNjYXBlXCIsXCJ1bmVzY2FwZVwiXSxbXCJhcmd1bWVudHNcIixcInRoaXNcIixcInN1cGVyXCIsXCJjb25zb2xlXCIsXCJ3aW5kb3dcIixcImRvY3VtZW50XCIsXCJsb2NhbFN0b3JhZ2VcIixcIm1vZHVsZVwiLFwiZ2xvYmFsXCJdLFtcIkludGxcIixcIkRhdGFWaWV3XCIsXCJOdW1iZXJcIixcIk1hdGhcIixcIkRhdGVcIixcIlN0cmluZ1wiLFwiUmVnRXhwXCIsXCJPYmplY3RcIixcIkZ1bmN0aW9uXCIsXCJCb29sZWFuXCIsXCJFcnJvclwiLFwiU3ltYm9sXCIsXCJTZXRcIixcIk1hcFwiLFwiV2Vha1NldFwiLFwiV2Vha01hcFwiLFwiUHJveHlcIixcIlJlZmxlY3RcIixcIkpTT05cIixcIlByb21pc2VcIixcIkZsb2F0NjRBcnJheVwiLFwiSW50MTZBcnJheVwiLFwiSW50MzJBcnJheVwiLFwiSW50OEFycmF5XCIsXCJVaW50MTZBcnJheVwiLFwiVWludDMyQXJyYXlcIixcIkZsb2F0MzJBcnJheVwiLFwiQXJyYXlcIixcIlVpbnQ4QXJyYXlcIixcIlVpbnQ4Q2xhbXBlZEFycmF5XCIsXCJBcnJheUJ1ZmZlclwiXSxbXCJFdmFsRXJyb3JcIixcIkludGVybmFsRXJyb3JcIixcIlJhbmdlRXJyb3JcIixcIlJlZmVyZW5jZUVycm9yXCIsXCJTeW50YXhFcnJvclwiLFwiVHlwZUVycm9yXCIsXCJVUklFcnJvclwiXSk7ZnVuY3Rpb24gcyhlKXtyZXR1cm4gcihcIig/PVwiLGUsXCIpXCIpfWZ1bmN0aW9uIHIoLi4uZSl7cmV0dXJuIGUubWFwKGU9PihmdW5jdGlvbihlKXtyZXR1cm4gZT9cInN0cmluZ1wiPT10eXBlb2YgZT9lOmUuc291cmNlOm51bGx9KShlKSkuam9pbihcIlwiKX1yZXR1cm4gZnVuY3Rpb24odCl7dmFyIGk9XCJbQS1aYS16JF9dWzAtOUEtWmEteiRfXSpcIixjPXtiZWdpbjovPFtBLVphLXowLTlcXFxcLl86LV0rLyxlbmQ6L1xcL1tBLVphLXowLTlcXFxcLl86LV0rPnxcXC8+L30sbz17JHBhdHRlcm46XCJbQS1aYS16JF9dWzAtOUEtWmEteiRfXSpcIixrZXl3b3JkOmUuam9pbihcIiBcIiksbGl0ZXJhbDpuLmpvaW4oXCIgXCIpLGJ1aWx0X2luOmEuam9pbihcIiBcIil9LGw9e2NsYXNzTmFtZTpcIm51bWJlclwiLHZhcmlhbnRzOlt7YmVnaW46XCJcXFxcYigwW2JCXVswMV0rKW4/XCJ9LHtiZWdpbjpcIlxcXFxiKDBbb09dWzAtN10rKW4/XCJ9LHtiZWdpbjp0LkNfTlVNQkVSX1JFK1wibj9cIn1dLHJlbGV2YW5jZTowfSxFPXtjbGFzc05hbWU6XCJzdWJzdFwiLGJlZ2luOlwiXFxcXCRcXFxce1wiLGVuZDpcIlxcXFx9XCIsa2V5d29yZHM6byxjb250YWluczpbXX0sZD17YmVnaW46XCJodG1sYFwiLGVuZDpcIlwiLHN0YXJ0czp7ZW5kOlwiYFwiLHJldHVybkVuZDohMSxjb250YWluczpbdC5CQUNLU0xBU0hfRVNDQVBFLEVdLHN1Ykxhbmd1YWdlOlwieG1sXCJ9fSxnPXtiZWdpbjpcImNzc2BcIixlbmQ6XCJcIixzdGFydHM6e2VuZDpcImBcIixyZXR1cm5FbmQ6ITEsY29udGFpbnM6W3QuQkFDS1NMQVNIX0VTQ0FQRSxFXSxzdWJMYW5ndWFnZTpcImNzc1wifX0sdT17Y2xhc3NOYW1lOlwic3RyaW5nXCIsYmVnaW46XCJgXCIsZW5kOlwiYFwiLGNvbnRhaW5zOlt0LkJBQ0tTTEFTSF9FU0NBUEUsRV19O0UuY29udGFpbnM9W3QuQVBPU19TVFJJTkdfTU9ERSx0LlFVT1RFX1NUUklOR19NT0RFLGQsZyx1LGwsdC5SRUdFWFBfTU9ERV07dmFyIGI9RS5jb250YWlucy5jb25jYXQoW3tiZWdpbjovXFwoLyxlbmQ6L1xcKS8sY29udGFpbnM6W1wic2VsZlwiXS5jb25jYXQoRS5jb250YWlucyxbdC5DX0JMT0NLX0NPTU1FTlRfTU9ERSx0LkNfTElORV9DT01NRU5UX01PREVdKX0sdC5DX0JMT0NLX0NPTU1FTlRfTU9ERSx0LkNfTElORV9DT01NRU5UX01PREVdKSxfPXtjbGFzc05hbWU6XCJwYXJhbXNcIixiZWdpbjovXFwoLyxlbmQ6L1xcKS8sZXhjbHVkZUJlZ2luOiEwLGV4Y2x1ZGVFbmQ6ITAsY29udGFpbnM6Yn07cmV0dXJue25hbWU6XCJKYXZhU2NyaXB0XCIsYWxpYXNlczpbXCJqc1wiLFwianN4XCIsXCJtanNcIixcImNqc1wiXSxrZXl3b3JkczpvLGNvbnRhaW5zOlt0LlNIRUJBTkcoe2JpbmFyeTpcIm5vZGVcIixyZWxldmFuY2U6NX0pLHtjbGFzc05hbWU6XCJtZXRhXCIscmVsZXZhbmNlOjEwLGJlZ2luOi9eXFxzKlsnXCJddXNlIChzdHJpY3R8YXNtKVsnXCJdL30sdC5BUE9TX1NUUklOR19NT0RFLHQuUVVPVEVfU1RSSU5HX01PREUsZCxnLHUsdC5DX0xJTkVfQ09NTUVOVF9NT0RFLHQuQ09NTUVOVChcIi9cXFxcKlxcXFwqXCIsXCJcXFxcKi9cIix7cmVsZXZhbmNlOjAsY29udGFpbnM6W3tjbGFzc05hbWU6XCJkb2N0YWdcIixiZWdpbjpcIkBbQS1aYS16XStcIixjb250YWluczpbe2NsYXNzTmFtZTpcInR5cGVcIixiZWdpbjpcIlxcXFx7XCIsZW5kOlwiXFxcXH1cIixyZWxldmFuY2U6MH0se2NsYXNzTmFtZTpcInZhcmlhYmxlXCIsYmVnaW46aStcIig/PVxcXFxzKigtKXwkKVwiLGVuZHNQYXJlbnQ6ITAscmVsZXZhbmNlOjB9LHtiZWdpbjovKD89W15cXG5dKVxccy8scmVsZXZhbmNlOjB9XX1dfSksdC5DX0JMT0NLX0NPTU1FTlRfTU9ERSxsLHtiZWdpbjpyKC9beyxcXG5dXFxzKi8scyhyKC8oKChcXC9cXC8uKil8KFxcL1xcKigufFxcbikqXFwqXFwvKSlcXHMqKSovLGkrXCJcXFxccyo6XCIpKSkscmVsZXZhbmNlOjAsY29udGFpbnM6W3tjbGFzc05hbWU6XCJhdHRyXCIsYmVnaW46aStzKFwiXFxcXHMqOlwiKSxyZWxldmFuY2U6MH1dfSx7YmVnaW46XCIoXCIrdC5SRV9TVEFSVEVSU19SRStcInxcXFxcYihjYXNlfHJldHVybnx0aHJvdylcXFxcYilcXFxccypcIixrZXl3b3JkczpcInJldHVybiB0aHJvdyBjYXNlXCIsY29udGFpbnM6W3QuQ19MSU5FX0NPTU1FTlRfTU9ERSx0LkNfQkxPQ0tfQ09NTUVOVF9NT0RFLHQuUkVHRVhQX01PREUse2NsYXNzTmFtZTpcImZ1bmN0aW9uXCIsYmVnaW46XCIoXFxcXChbXihdKihcXFxcKFteKF0qKFxcXFwoW14oXSpcXFxcKSk/XFxcXCkpP1xcXFwpfFwiK3QuVU5ERVJTQ09SRV9JREVOVF9SRStcIilcXFxccyo9PlwiLHJldHVybkJlZ2luOiEwLGVuZDpcIlxcXFxzKj0+XCIsY29udGFpbnM6W3tjbGFzc05hbWU6XCJwYXJhbXNcIix2YXJpYW50czpbe2JlZ2luOnQuVU5ERVJTQ09SRV9JREVOVF9SRX0se2NsYXNzTmFtZTpudWxsLGJlZ2luOi9cXChcXHMqXFwpLyxza2lwOiEwfSx7YmVnaW46L1xcKC8sZW5kOi9cXCkvLGV4Y2x1ZGVCZWdpbjohMCxleGNsdWRlRW5kOiEwLGtleXdvcmRzOm8sY29udGFpbnM6Yn1dfV19LHtiZWdpbjovLC8scmVsZXZhbmNlOjB9LHtjbGFzc05hbWU6XCJcIixiZWdpbjovXFxzLyxlbmQ6L1xccyovLHNraXA6ITB9LHt2YXJpYW50czpbe2JlZ2luOlwiPD5cIixlbmQ6XCI8Lz5cIn0se2JlZ2luOmMuYmVnaW4sZW5kOmMuZW5kfV0sc3ViTGFuZ3VhZ2U6XCJ4bWxcIixjb250YWluczpbe2JlZ2luOmMuYmVnaW4sZW5kOmMuZW5kLHNraXA6ITAsY29udGFpbnM6W1wic2VsZlwiXX1dfV0scmVsZXZhbmNlOjB9LHtjbGFzc05hbWU6XCJmdW5jdGlvblwiLGJlZ2luS2V5d29yZHM6XCJmdW5jdGlvblwiLGVuZDovXFx7LyxleGNsdWRlRW5kOiEwLGNvbnRhaW5zOlt0LmluaGVyaXQodC5USVRMRV9NT0RFLHtiZWdpbjppfSksX10saWxsZWdhbDovXFxbfCUvfSx7YmVnaW46L1xcJFsoLl0vfSx0Lk1FVEhPRF9HVUFSRCx7Y2xhc3NOYW1lOlwiY2xhc3NcIixiZWdpbktleXdvcmRzOlwiY2xhc3NcIixlbmQ6L1t7Oz1dLyxleGNsdWRlRW5kOiEwLGlsbGVnYWw6L1s6XCJcXFtcXF1dLyxjb250YWluczpbe2JlZ2luS2V5d29yZHM6XCJleHRlbmRzXCJ9LHQuVU5ERVJTQ09SRV9USVRMRV9NT0RFXX0se2JlZ2luS2V5d29yZHM6XCJjb25zdHJ1Y3RvclwiLGVuZDovXFx7LyxleGNsdWRlRW5kOiEwfSx7YmVnaW46XCIoZ2V0fHNldClcXFxccysoPz1cIitpK1wiXFxcXCgpXCIsZW5kOi97LyxrZXl3b3JkczpcImdldCBzZXRcIixjb250YWluczpbdC5pbmhlcml0KHQuVElUTEVfTU9ERSx7YmVnaW46aX0pLHtiZWdpbjovXFwoXFwpL30sX119XSxpbGxlZ2FsOi8jKD8hISkvfX19KCkpO1xuaGxqcy5yZWdpc3Rlckxhbmd1YWdlKFwianNvblwiLGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7cmV0dXJuIGZ1bmN0aW9uKG4pe3ZhciBlPXtsaXRlcmFsOlwidHJ1ZSBmYWxzZSBudWxsXCJ9LGk9W24uQ19MSU5FX0NPTU1FTlRfTU9ERSxuLkNfQkxPQ0tfQ09NTUVOVF9NT0RFXSx0PVtuLlFVT1RFX1NUUklOR19NT0RFLG4uQ19OVU1CRVJfTU9ERV0sYT17ZW5kOlwiLFwiLGVuZHNXaXRoUGFyZW50OiEwLGV4Y2x1ZGVFbmQ6ITAsY29udGFpbnM6dCxrZXl3b3JkczplfSxsPXtiZWdpbjpcIntcIixlbmQ6XCJ9XCIsY29udGFpbnM6W3tjbGFzc05hbWU6XCJhdHRyXCIsYmVnaW46L1wiLyxlbmQ6L1wiLyxjb250YWluczpbbi5CQUNLU0xBU0hfRVNDQVBFXSxpbGxlZ2FsOlwiXFxcXG5cIn0sbi5pbmhlcml0KGEse2JlZ2luOi86L30pXS5jb25jYXQoaSksaWxsZWdhbDpcIlxcXFxTXCJ9LHM9e2JlZ2luOlwiXFxcXFtcIixlbmQ6XCJcXFxcXVwiLGNvbnRhaW5zOltuLmluaGVyaXQoYSldLGlsbGVnYWw6XCJcXFxcU1wifTtyZXR1cm4gdC5wdXNoKGwscyksaS5mb3JFYWNoKChmdW5jdGlvbihuKXt0LnB1c2gobil9KSkse25hbWU6XCJKU09OXCIsY29udGFpbnM6dCxrZXl3b3JkczplLGlsbGVnYWw6XCJcXFxcU1wifX19KCkpO1xuaGxqcy5yZWdpc3Rlckxhbmd1YWdlKFwieG1sXCIsZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtyZXR1cm4gZnVuY3Rpb24oZSl7dmFyIG49e2NsYXNzTmFtZTpcInN5bWJvbFwiLGJlZ2luOlwiJlthLXpdKzt8JiNbMC05XSs7fCYjeFthLWYwLTldKztcIn0sYT17YmVnaW46XCJcXFxcc1wiLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOlwibWV0YS1rZXl3b3JkXCIsYmVnaW46XCIjP1thLXpfXVthLXoxLTlfLV0rXCIsaWxsZWdhbDpcIlxcXFxuXCJ9XX0scz1lLmluaGVyaXQoYSx7YmVnaW46XCJcXFxcKFwiLGVuZDpcIlxcXFwpXCJ9KSx0PWUuaW5oZXJpdChlLkFQT1NfU1RSSU5HX01PREUse2NsYXNzTmFtZTpcIm1ldGEtc3RyaW5nXCJ9KSxpPWUuaW5oZXJpdChlLlFVT1RFX1NUUklOR19NT0RFLHtjbGFzc05hbWU6XCJtZXRhLXN0cmluZ1wifSksYz17ZW5kc1dpdGhQYXJlbnQ6ITAsaWxsZWdhbDovPC8scmVsZXZhbmNlOjAsY29udGFpbnM6W3tjbGFzc05hbWU6XCJhdHRyXCIsYmVnaW46XCJbQS1aYS16MC05XFxcXC5fOi1dK1wiLHJlbGV2YW5jZTowfSx7YmVnaW46Lz1cXHMqLyxyZWxldmFuY2U6MCxjb250YWluczpbe2NsYXNzTmFtZTpcInN0cmluZ1wiLGVuZHNQYXJlbnQ6ITAsdmFyaWFudHM6W3tiZWdpbjovXCIvLGVuZDovXCIvLGNvbnRhaW5zOltuXX0se2JlZ2luOi8nLyxlbmQ6LycvLGNvbnRhaW5zOltuXX0se2JlZ2luOi9bXlxcc1wiJz08PmBdKy99XX1dfV19O3JldHVybntuYW1lOlwiSFRNTCwgWE1MXCIsYWxpYXNlczpbXCJodG1sXCIsXCJ4aHRtbFwiLFwicnNzXCIsXCJhdG9tXCIsXCJ4amJcIixcInhzZFwiLFwieHNsXCIsXCJwbGlzdFwiLFwid3NmXCIsXCJzdmdcIl0sY2FzZV9pbnNlbnNpdGl2ZTohMCxjb250YWluczpbe2NsYXNzTmFtZTpcIm1ldGFcIixiZWdpbjpcIjwhW2Etel1cIixlbmQ6XCI+XCIscmVsZXZhbmNlOjEwLGNvbnRhaW5zOlthLGksdCxzLHtiZWdpbjpcIlxcXFxbXCIsZW5kOlwiXFxcXF1cIixjb250YWluczpbe2NsYXNzTmFtZTpcIm1ldGFcIixiZWdpbjpcIjwhW2Etel1cIixlbmQ6XCI+XCIsY29udGFpbnM6W2EscyxpLHRdfV19XX0sZS5DT01NRU5UKFwiXFx4M2MhLS1cIixcIi0tXFx4M2VcIix7cmVsZXZhbmNlOjEwfSkse2JlZ2luOlwiPFxcXFwhXFxcXFtDREFUQVxcXFxbXCIsZW5kOlwiXFxcXF1cXFxcXT5cIixyZWxldmFuY2U6MTB9LG4se2NsYXNzTmFtZTpcIm1ldGFcIixiZWdpbjovPFxcP3htbC8sZW5kOi9cXD8+LyxyZWxldmFuY2U6MTB9LHtjbGFzc05hbWU6XCJ0YWdcIixiZWdpbjpcIjxzdHlsZSg/PVxcXFxzfD4pXCIsZW5kOlwiPlwiLGtleXdvcmRzOntuYW1lOlwic3R5bGVcIn0sY29udGFpbnM6W2NdLHN0YXJ0czp7ZW5kOlwiPC9zdHlsZT5cIixyZXR1cm5FbmQ6ITAsc3ViTGFuZ3VhZ2U6W1wiY3NzXCIsXCJ4bWxcIl19fSx7Y2xhc3NOYW1lOlwidGFnXCIsYmVnaW46XCI8c2NyaXB0KD89XFxcXHN8PilcIixlbmQ6XCI+XCIsa2V5d29yZHM6e25hbWU6XCJzY3JpcHRcIn0sY29udGFpbnM6W2NdLHN0YXJ0czp7ZW5kOlwiPFxcL3NjcmlwdD5cIixyZXR1cm5FbmQ6ITAsc3ViTGFuZ3VhZ2U6W1wiamF2YXNjcmlwdFwiLFwiaGFuZGxlYmFyc1wiLFwieG1sXCJdfX0se2NsYXNzTmFtZTpcInRhZ1wiLGJlZ2luOlwiPC8/XCIsZW5kOlwiLz8+XCIsY29udGFpbnM6W3tjbGFzc05hbWU6XCJuYW1lXCIsYmVnaW46L1teXFwvPjxcXHNdKy8scmVsZXZhbmNlOjB9LGNdfV19fX0oKSk7XG5obGpzLnJlZ2lzdGVyTGFuZ3VhZ2UoXCJtYXJrZG93blwiLGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7cmV0dXJuIGZ1bmN0aW9uKG4pe2NvbnN0IGU9e2JlZ2luOlwiPFwiLGVuZDpcIj5cIixzdWJMYW5ndWFnZTpcInhtbFwiLHJlbGV2YW5jZTowfSxhPXtiZWdpbjpcIlxcXFxbLis/XFxcXF1bXFxcXChcXFxcW10uKj9bXFxcXClcXFxcXV1cIixyZXR1cm5CZWdpbjohMCxjb250YWluczpbe2NsYXNzTmFtZTpcInN0cmluZ1wiLGJlZ2luOlwiXFxcXFtcIixlbmQ6XCJcXFxcXVwiLGV4Y2x1ZGVCZWdpbjohMCxyZXR1cm5FbmQ6ITAscmVsZXZhbmNlOjB9LHtjbGFzc05hbWU6XCJsaW5rXCIsYmVnaW46XCJcXFxcXVxcXFwoXCIsZW5kOlwiXFxcXClcIixleGNsdWRlQmVnaW46ITAsZXhjbHVkZUVuZDohMH0se2NsYXNzTmFtZTpcInN5bWJvbFwiLGJlZ2luOlwiXFxcXF1cXFxcW1wiLGVuZDpcIlxcXFxdXCIsZXhjbHVkZUJlZ2luOiEwLGV4Y2x1ZGVFbmQ6ITB9XSxyZWxldmFuY2U6MTB9LGk9e2NsYXNzTmFtZTpcInN0cm9uZ1wiLGNvbnRhaW5zOltdLHZhcmlhbnRzOlt7YmVnaW46L197Mn0vLGVuZDovX3syfS99LHtiZWdpbjovXFwqezJ9LyxlbmQ6L1xcKnsyfS99XX0scz17Y2xhc3NOYW1lOlwiZW1waGFzaXNcIixjb250YWluczpbXSx2YXJpYW50czpbe2JlZ2luOi9cXCooPyFcXCopLyxlbmQ6L1xcKi99LHtiZWdpbjovXyg/IV8pLyxlbmQ6L18vLHJlbGV2YW5jZTowfV19O2kuY29udGFpbnMucHVzaChzKSxzLmNvbnRhaW5zLnB1c2goaSk7dmFyIGM9W2UsYV07cmV0dXJuIGkuY29udGFpbnM9aS5jb250YWlucy5jb25jYXQoYykscy5jb250YWlucz1zLmNvbnRhaW5zLmNvbmNhdChjKSx7bmFtZTpcIk1hcmtkb3duXCIsYWxpYXNlczpbXCJtZFwiLFwibWtkb3duXCIsXCJta2RcIl0sY29udGFpbnM6W3tjbGFzc05hbWU6XCJzZWN0aW9uXCIsdmFyaWFudHM6W3tiZWdpbjpcIl4jezEsNn1cIixlbmQ6XCIkXCIsY29udGFpbnM6Yz1jLmNvbmNhdChpLHMpfSx7YmVnaW46XCIoPz1eLis/XFxcXG5bPS1dezIsfSQpXCIsY29udGFpbnM6W3tiZWdpbjpcIl5bPS1dKiRcIn0se2JlZ2luOlwiXlwiLGVuZDpcIlxcXFxuXCIsY29udGFpbnM6Y31dfV19LGUse2NsYXNzTmFtZTpcImJ1bGxldFwiLGJlZ2luOlwiXlsgXFx0XSooWyorLV18KFxcXFxkK1xcXFwuKSkoPz1cXFxccyspXCIsZW5kOlwiXFxcXHMrXCIsZXhjbHVkZUVuZDohMH0saSxzLHtjbGFzc05hbWU6XCJxdW90ZVwiLGJlZ2luOlwiXj5cXFxccytcIixjb250YWluczpjLGVuZDpcIiRcIn0se2NsYXNzTmFtZTpcImNvZGVcIix2YXJpYW50czpbe2JlZ2luOlwiKGB7Myx9KSgufFxcXFxuKSo/XFxcXDFgKlsgXSpcIn0se2JlZ2luOlwiKH57Myx9KSgufFxcXFxuKSo/XFxcXDF+KlsgXSpcIn0se2JlZ2luOlwiYGBgXCIsZW5kOlwiYGBgK1sgXSokXCJ9LHtiZWdpbjpcIn5+flwiLGVuZDpcIn5+fitbIF0qJFwifSx7YmVnaW46XCJgLis/YFwifSx7YmVnaW46XCIoPz1eKCB7NH18XFxcXHQpKVwiLGNvbnRhaW5zOlt7YmVnaW46XCJeKCB7NH18XFxcXHQpXCIsZW5kOlwiKFxcXFxuKSRcIn1dLHJlbGV2YW5jZTowfV19LHtiZWdpbjpcIl5bLVxcXFwqXXszLH1cIixlbmQ6XCIkXCJ9LGEse2JlZ2luOi9eXFxbW15cXG5dK1xcXTovLHJldHVybkJlZ2luOiEwLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOlwic3ltYm9sXCIsYmVnaW46L1xcWy8sZW5kOi9cXF0vLGV4Y2x1ZGVCZWdpbjohMCxleGNsdWRlRW5kOiEwfSx7Y2xhc3NOYW1lOlwibGlua1wiLGJlZ2luOi86XFxzKi8sZW5kOi8kLyxleGNsdWRlQmVnaW46ITB9XX1dfX19KCkpO1xuaGxqcy5yZWdpc3Rlckxhbmd1YWdlKFwicHl0aG9uXCIsZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtyZXR1cm4gZnVuY3Rpb24oZSl7dmFyIG49e2tleXdvcmQ6XCJhbmQgZWxpZiBpcyBnbG9iYWwgYXMgaW4gaWYgZnJvbSByYWlzZSBmb3IgZXhjZXB0IGZpbmFsbHkgcHJpbnQgaW1wb3J0IHBhc3MgcmV0dXJuIGV4ZWMgZWxzZSBicmVhayBub3Qgd2l0aCBjbGFzcyBhc3NlcnQgeWllbGQgdHJ5IHdoaWxlIGNvbnRpbnVlIGRlbCBvciBkZWYgbGFtYmRhIGFzeW5jIGF3YWl0IG5vbmxvY2FsfDEwXCIsYnVpbHRfaW46XCJFbGxpcHNpcyBOb3RJbXBsZW1lbnRlZFwiLGxpdGVyYWw6XCJGYWxzZSBOb25lIFRydWVcIn0sYT17Y2xhc3NOYW1lOlwibWV0YVwiLGJlZ2luOi9eKD4+PnxcXC5cXC5cXC4pIC99LGk9e2NsYXNzTmFtZTpcInN1YnN0XCIsYmVnaW46L1xcey8sZW5kOi9cXH0vLGtleXdvcmRzOm4saWxsZWdhbDovIy99LHM9e2JlZ2luOi9cXHtcXHsvLHJlbGV2YW5jZTowfSxyPXtjbGFzc05hbWU6XCJzdHJpbmdcIixjb250YWluczpbZS5CQUNLU0xBU0hfRVNDQVBFXSx2YXJpYW50czpbe2JlZ2luOi8odXxiKT9yPycnJy8sZW5kOi8nJycvLGNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEUsYV0scmVsZXZhbmNlOjEwfSx7YmVnaW46Lyh1fGIpP3I/XCJcIlwiLyxlbmQ6L1wiXCJcIi8sY29udGFpbnM6W2UuQkFDS1NMQVNIX0VTQ0FQRSxhXSxyZWxldmFuY2U6MTB9LHtiZWdpbjovKGZyfHJmfGYpJycnLyxlbmQ6LycnJy8sY29udGFpbnM6W2UuQkFDS1NMQVNIX0VTQ0FQRSxhLHMsaV19LHtiZWdpbjovKGZyfHJmfGYpXCJcIlwiLyxlbmQ6L1wiXCJcIi8sY29udGFpbnM6W2UuQkFDS1NMQVNIX0VTQ0FQRSxhLHMsaV19LHtiZWdpbjovKHV8cnx1ciknLyxlbmQ6LycvLHJlbGV2YW5jZToxMH0se2JlZ2luOi8odXxyfHVyKVwiLyxlbmQ6L1wiLyxyZWxldmFuY2U6MTB9LHtiZWdpbjovKGJ8YnIpJy8sZW5kOi8nL30se2JlZ2luOi8oYnxicilcIi8sZW5kOi9cIi99LHtiZWdpbjovKGZyfHJmfGYpJy8sZW5kOi8nLyxjb250YWluczpbZS5CQUNLU0xBU0hfRVNDQVBFLHMsaV19LHtiZWdpbjovKGZyfHJmfGYpXCIvLGVuZDovXCIvLGNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEUscyxpXX0sZS5BUE9TX1NUUklOR19NT0RFLGUuUVVPVEVfU1RSSU5HX01PREVdfSxsPXtjbGFzc05hbWU6XCJudW1iZXJcIixyZWxldmFuY2U6MCx2YXJpYW50czpbe2JlZ2luOmUuQklOQVJZX05VTUJFUl9SRStcIltsTGpKXT9cIn0se2JlZ2luOlwiXFxcXGIoMG9bMC03XSspW2xMakpdP1wifSx7YmVnaW46ZS5DX05VTUJFUl9SRStcIltsTGpKXT9cIn1dfSx0PXtjbGFzc05hbWU6XCJwYXJhbXNcIix2YXJpYW50czpbe2JlZ2luOi9cXChcXHMqXFwpLyxza2lwOiEwLGNsYXNzTmFtZTpudWxsfSx7YmVnaW46L1xcKC8sZW5kOi9cXCkvLGV4Y2x1ZGVCZWdpbjohMCxleGNsdWRlRW5kOiEwLGNvbnRhaW5zOltcInNlbGZcIixhLGwscixlLkhBU0hfQ09NTUVOVF9NT0RFXX1dfTtyZXR1cm4gaS5jb250YWlucz1bcixsLGFdLHtuYW1lOlwiUHl0aG9uXCIsYWxpYXNlczpbXCJweVwiLFwiZ3lwXCIsXCJpcHl0aG9uXCJdLGtleXdvcmRzOm4saWxsZWdhbDovKDxcXC98LT58XFw/KXw9Pi8sY29udGFpbnM6W2EsbCx7YmVnaW5LZXl3b3JkczpcImlmXCIscmVsZXZhbmNlOjB9LHIsZS5IQVNIX0NPTU1FTlRfTU9ERSx7dmFyaWFudHM6W3tjbGFzc05hbWU6XCJmdW5jdGlvblwiLGJlZ2luS2V5d29yZHM6XCJkZWZcIn0se2NsYXNzTmFtZTpcImNsYXNzXCIsYmVnaW5LZXl3b3JkczpcImNsYXNzXCJ9XSxlbmQ6LzovLGlsbGVnYWw6L1skez07XFxuLF0vLGNvbnRhaW5zOltlLlVOREVSU0NPUkVfVElUTEVfTU9ERSx0LHtiZWdpbjovLT4vLGVuZHNXaXRoUGFyZW50OiEwLGtleXdvcmRzOlwiTm9uZVwifV19LHtjbGFzc05hbWU6XCJtZXRhXCIsYmVnaW46L15bXFx0IF0qQC8sZW5kOi8kL30se2JlZ2luOi9cXGIocHJpbnR8ZXhlYylcXCgvfV19fX0oKSk7XG5obGpzLnJlZ2lzdGVyTGFuZ3VhZ2UoXCJ5YW1sXCIsZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtyZXR1cm4gZnVuY3Rpb24oZSl7dmFyIG49XCJ0cnVlIGZhbHNlIHllcyBubyBudWxsXCIsYT1cIltcXFxcdyM7Lz86QCY9KyQsLn4qXFxcXCcoKVtcXFxcXV0rXCIscz17Y2xhc3NOYW1lOlwic3RyaW5nXCIscmVsZXZhbmNlOjAsdmFyaWFudHM6W3tiZWdpbjovJy8sZW5kOi8nL30se2JlZ2luOi9cIi8sZW5kOi9cIi99LHtiZWdpbjovXFxTKy99XSxjb250YWluczpbZS5CQUNLU0xBU0hfRVNDQVBFLHtjbGFzc05hbWU6XCJ0ZW1wbGF0ZS12YXJpYWJsZVwiLHZhcmlhbnRzOlt7YmVnaW46XCJ7e1wiLGVuZDpcIn19XCJ9LHtiZWdpbjpcIiV7XCIsZW5kOlwifVwifV19XX0saT1lLmluaGVyaXQocyx7dmFyaWFudHM6W3tiZWdpbjovJy8sZW5kOi8nL30se2JlZ2luOi9cIi8sZW5kOi9cIi99LHtiZWdpbjovW15cXHMse31bXFxdXSsvfV19KSxsPXtlbmQ6XCIsXCIsZW5kc1dpdGhQYXJlbnQ6ITAsZXhjbHVkZUVuZDohMCxjb250YWluczpbXSxrZXl3b3JkczpuLHJlbGV2YW5jZTowfSx0PXtiZWdpbjpcIntcIixlbmQ6XCJ9XCIsY29udGFpbnM6W2xdLGlsbGVnYWw6XCJcXFxcblwiLHJlbGV2YW5jZTowfSxnPXtiZWdpbjpcIlxcXFxbXCIsZW5kOlwiXFxcXF1cIixjb250YWluczpbbF0saWxsZWdhbDpcIlxcXFxuXCIscmVsZXZhbmNlOjB9LGI9W3tjbGFzc05hbWU6XCJhdHRyXCIsdmFyaWFudHM6W3tiZWdpbjpcIlxcXFx3W1xcXFx3IDpcXFxcLy4tXSo6KD89WyBcXHRdfCQpXCJ9LHtiZWdpbjonXCJcXFxcd1tcXFxcdyA6XFxcXC8uLV0qXCI6KD89WyBcXHRdfCQpJ30se2JlZ2luOlwiJ1xcXFx3W1xcXFx3IDpcXFxcLy4tXSonOig/PVsgXFx0XXwkKVwifV19LHtjbGFzc05hbWU6XCJtZXRhXCIsYmVnaW46XCJeLS0tcyokXCIscmVsZXZhbmNlOjEwfSx7Y2xhc3NOYW1lOlwic3RyaW5nXCIsYmVnaW46XCJbXFxcXHw+XShbMC05XT9bKy1dKT9bIF0qXFxcXG4oICopW1xcXFxTIF0rXFxcXG4oXFxcXDJbXFxcXFMgXStcXFxcbj8pKlwifSx7YmVnaW46XCI8JVslPS1dP1wiLGVuZDpcIlslLV0/JT5cIixzdWJMYW5ndWFnZTpcInJ1YnlcIixleGNsdWRlQmVnaW46ITAsZXhjbHVkZUVuZDohMCxyZWxldmFuY2U6MH0se2NsYXNzTmFtZTpcInR5cGVcIixiZWdpbjpcIiFcXFxcdyshXCIrYX0se2NsYXNzTmFtZTpcInR5cGVcIixiZWdpbjpcIiE8XCIrYStcIj5cIn0se2NsYXNzTmFtZTpcInR5cGVcIixiZWdpbjpcIiFcIithfSx7Y2xhc3NOYW1lOlwidHlwZVwiLGJlZ2luOlwiISFcIithfSx7Y2xhc3NOYW1lOlwibWV0YVwiLGJlZ2luOlwiJlwiK2UuVU5ERVJTQ09SRV9JREVOVF9SRStcIiRcIn0se2NsYXNzTmFtZTpcIm1ldGFcIixiZWdpbjpcIlxcXFwqXCIrZS5VTkRFUlNDT1JFX0lERU5UX1JFK1wiJFwifSx7Y2xhc3NOYW1lOlwiYnVsbGV0XCIsYmVnaW46XCJcXFxcLSg/PVsgXXwkKVwiLHJlbGV2YW5jZTowfSxlLkhBU0hfQ09NTUVOVF9NT0RFLHtiZWdpbktleXdvcmRzOm4sa2V5d29yZHM6e2xpdGVyYWw6bn19LHtjbGFzc05hbWU6XCJudW1iZXJcIixiZWdpbjpcIlxcXFxiWzAtOV17NH0oLVswLTldWzAtOV0pezAsMn0oW1R0IFxcXFx0XVswLTldWzAtOV0/KDpbMC05XVswLTldKXsyfSk/KFxcXFwuWzAtOV0qKT8oWyBcXFxcdF0pKihafFstK11bMC05XVswLTldPyg6WzAtOV1bMC05XSk/KT9cXFxcYlwifSx7Y2xhc3NOYW1lOlwibnVtYmVyXCIsYmVnaW46ZS5DX05VTUJFUl9SRStcIlxcXFxiXCJ9LHQsZyxzXSxjPVsuLi5iXTtyZXR1cm4gYy5wb3AoKSxjLnB1c2goaSksbC5jb250YWlucz1jLHtuYW1lOlwiWUFNTFwiLGNhc2VfaW5zZW5zaXRpdmU6ITAsYWxpYXNlczpbXCJ5bWxcIixcIllBTUxcIl0sY29udGFpbnM6Yn19fSgpKTtcblxuXG5cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBLFNBQVMsR0FBRyxDQUFDLEtBQUssS0FBSztBQUN2QixDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxFQUFDO0FBQ25CLENBQUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0MsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzNCLENBQUMsQ0FBQztBQUNGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBYyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsR0FBRyxDQUFDLEVBQUUsUUFBUSxHQUFHLENBQUMsRUFBRSxXQUFXLEdBQUcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLENBQUMsS0FBSSxPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksRUFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUMsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLEtBQUssSUFBSSxDQUFDLFNBQVMsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTSxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLEVBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsT0FBTyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLHdFQUF3RSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLDRJQUE0SSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyw0Q0FBNEMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLDhJQUE4SSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLFdBQVcsR0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLGtCQUFrQixDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxrSEFBa0gsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxHQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLDhCQUE4QixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxxRkFBcUYsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixDQUFDLDZCQUE2QixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsWUFBWSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxZQUFZLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsU0FBUyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLDJEQUEyRCxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxHQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsV0FBVyxHQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLDJGQUEyRixDQUFDLENBQUMsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU0sUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsR0FBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsZ0dBQWdHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxhQUFhLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxjQUFjLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxDQUFDLENBQUMsY0FBYyxHQUFHLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQyxPQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsbURBQW1ELENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEVBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsR0FBRSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDLHVEQUF1RCxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsZ0RBQWdELENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxPQUFPLEVBQUUsV0FBVyxFQUFFLE9BQU8sTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDamtnQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBYyxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsdUNBQXVDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNoL0MsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQWMsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwbEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxVQUFVLENBQWMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLG9CQUFvQixDQUFDLFdBQVcsQ0FBQyxvQkFBb0IsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLDBCQUEwQixDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsb0NBQW9DLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLGlDQUFpQyxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbHFJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFjLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUN0bEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxVQUFVLENBQWMsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsa0NBQWtDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsWUFBWSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNwaUQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQWMsT0FBTyxTQUFTLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsa0NBQWtDLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDeG1ELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFjLE9BQU8sU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw2TEFBNkwsQ0FBQyxRQUFRLENBQUMseUJBQXlCLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzUzRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBYyxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsZ0NBQWdDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQywyREFBMkQsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQywrSEFBK0gsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyJ9', false);
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

		for(let item of this.items){
			item.element.hidden = item.hide && item.hide(element);
		}

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
		window.addEventListener('hashchange', () => this.hashChange());
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

let uuid = 0;


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
				item.__id = item.id ? item.id : ('' + uuid++);
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
			"id": uuid++,
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

	filter(func){
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

	async render() {

		// TODO render busy spinner

		//render headers
		this.sortDisplay();
		
		// setup paging
		await this.page();

		// show the body
		//this.listBody.style.removeProperty('display');
	}

	async getItemElement(item){
		if(!this.elementMap.has(item)){
			this.elementMap.set(item, await this.renderItem(item));
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
	sort(attribute = this._sort?.attr, asc = !this._sort?.asc) {
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
		this.render();
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

class Toaster extends BasicElement{
	constructor(){
		super();
		this.attach();
	}
}
customElements.define('ui-toaster', Toaster);

function parseMessage(msg){
	if(typeof msg === 'object'){
		return JSON.stringify(msg, null, '\t');
	}else {
		return ""+ msg;
	}
}

class Toast extends BasicElement {
	constructor(message, { level = 'info' } = {}) {
		super(parseMessage(message));

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

	constructor(){
		super();
		this.#view.parent = this;
		this.canvas = document.createElement('canvas');
		this.append(this.canvas);
	}

	addAttachment(element){
		this.attachments.push(element);
		this.append(element);
	}

	removeAttachment(element){
		this.attachments = this.attachments.filter(e=>e!=element);
		this.removeChild(element);
	}

	/**
	 * Move the view so vx,vy is in the center of the viewport
	 * 
	 * @param {Number} vx 
	 * @param {Number} vy 
	 */
	center(vx,vy){
		this.#view.x = vx - (this.#view.width/2);
		this.#view.y = vy - (this.#view.height/2);
	}

	/**
	 * 
	 * Zoom on a point in screen space, keeping that point in the same place
	 * 
	 * @param {Number} vz target zoom level
	 * @param {Number} vx point to keep in the same position on screen
	 * @param {Number} vy point to keep in the same position on screen
	 */
	zoom(vz, vx, vy){
		let s1 = this.toScreen(vx, vy);
		this.#view.zoom = vz;
		let s2 = this.toScreen(vx, vy);
		let px = s2.x-s1.x;
		let py = s2.y-s1.y;
		this.pan(px, py);
	}

	/**
	 * 
	 * @param {Number} rsx 
	 * @param {Number} rsy 
	 */
	pan(rsx, rsy){
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
		
		context.setTransform(v.zoom, 0, 0, v.zoom, -v.x * v.zoom, -v.y * v.zoom);

		let onePixel = 1.01/v.zoom;
		// draw grid

		let xmin = v.x;
		let xmax = v.x + v.width;

		let ymin = v.y;
		let ymax = v.y + v.height;

		context.lineWidth = onePixel;// + "px";
		// grid
		context.beginPath();
		context.strokeStyle = "#7772";
		for(let offset = 1; offset < 1000; offset+=1){
			if(offset > ymin && offset < ymax){
				context.moveTo(xmin, offset);
				context.lineTo(xmax, offset);
			}
			if(-offset > ymin && -offset < ymax){
				context.moveTo(xmin, -offset);
				context.lineTo(xmax, -offset);
			}
			if(offset > xmin && offset < xmax){
				context.moveTo(offset, ymin);
				context.lineTo(offset, ymax);
			}
			if(-offset > xmin && -offset < xmax){
				context.moveTo(-offset, ymin);
				context.lineTo(-offset, ymax);
			}
		}
		context.stroke();

		// grid
		context.beginPath();
		context.strokeStyle = "#7773";
		for(let offset = 6; offset < 1000; offset+=12){
			if(offset > ymin && offset < ymax){
				context.moveTo(xmin, offset);
				context.lineTo(xmax, offset);
			}
			if(-offset > ymin && -offset < ymax){
				context.moveTo(xmin, -offset);
				context.lineTo(xmax, -offset);
			}
			if(offset > xmin && offset < xmax){
				context.moveTo(offset, ymin);
				context.lineTo(offset, ymax);
			}
			if(-offset > xmin && -offset < xmax){
				context.moveTo(-offset, ymin);
				context.lineTo(-offset, ymax);
			}
		}
		context.stroke();

		// grid
		context.beginPath();
		context.strokeStyle = "#7777";
		for(let offset = 12; offset < 1000; offset+=12){
			if(offset > ymin && offset < ymax){
				context.moveTo(xmin, offset);
				context.lineTo(xmax, offset);
			}
			if(-offset > ymin && -offset < ymax){
				context.moveTo(xmin, -offset);
				context.lineTo(xmax, -offset);
			}
			if(offset > xmin && offset < xmax){
				context.moveTo(offset, ymin);
				context.lineTo(offset, ymax);
			}
			if(-offset > xmin && -offset < xmax){
				context.moveTo(-offset, ymin);
				context.lineTo(-offset, ymax);
			}
		}
		context.stroke();

		// main axis
		context.strokeStyle = "#777f";
		context.beginPath();
		context.moveTo(-10000, 0);
		context.lineTo(10000, 0);
		context.moveTo(0,-10000);
		context.lineTo(0, 10000);
		context.stroke();

		this.updateAttachments();
	}

	updateAttachments(){
		let v= this.#view;
		for(let attachment of this.attachments){
			let x = (attachment.x ?? 0) - v.x;
			let y = (attachment.y ?? 0) - v.y;
			let t = `translate(${x * v.zoom}px, ${y * v.zoom}px) scale(${v.zoom})`;
			attachment.style.transform = t;
		}
	}
}
customElements.define('ui-viewport', Viewport);

// @ts-ignore
let URL$1 = import.meta.url;
let css = [
	URL$1 + "/../ui.css",
	"https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,200;0,300;0,400;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,600;1,700;1,800;1,900&display=swap",
	"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.11.2/css/all.css"];


let h = document.createElement('head');
h.innerHTML = css.map(url=>`<link href="${url}" rel="stylesheet">`).join('');
document.head.append(...h.childNodes);

const UI = {
	BasicElement,

	Badge,
	Button,
	Cancel,
	Card,
	Code,
	ContextMenu,
	Form,
	HashManager,
	Json,
	List, Table,
	Modal,
	Panel,
	Spacer,
	Spinner,
	Splash,
	Toast,
	Toggle,
	Viewport,

	utils
};



window["UI"] = UI;

export { Badge, BasicElement, Button, Cancel, Card, Code, ContextMenu, Form, HashManager, Json, List, Modal, Panel, Spacer, Spinner, Splash, Table, Toast, Toggle, Viewport, Factory as factory, utils };
