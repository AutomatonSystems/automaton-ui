const sleep = (time, value) => new Promise(r => setTimeout(() => r(value), time));
// @ts-ignore
window['sleep'] = sleep;
/**
 * Add items onto a element
 *
 * @param element
 * @param content
 */
function append(element, content) {
    if (!element || content === undefined || content === null)
        return;
    if (Array.isArray(content)) {
        for (let a of content)
            append(element, a);
    }
    else if (typeof content == 'string' || typeof content == 'number' || typeof content == 'boolean') {
        let d = document.createElement('div');
        d.innerHTML = '' + content;
        let nodes = [...d.childNodes];
        for (let node of nodes)
            element.appendChild(node);
    }
    else {
        element.appendChild(content);
    }
}
const IDs = new Set();
function uuid$1() {
    let id = null;
    do {
        id = "ui-" + Math.random().toString(16).slice(2);
    } while (IDs.has(id) || document.querySelector('#' + id));
    IDs.add(id);
    return id;
}
/**
 * Convert html text to a HTMLElement
 *
 * @param html
 *
 * @returns
 */
function htmlToElement(html, wrapper = 'div') {
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
    return ([...elements]);
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
function downloadJson(filename, json) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(json, null, '\t')], { type: `text/json` }));
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
    return new Promise(res => {
        var script = document.createElement('script'); // create a script DOM node
        script.src = url; // set its src to the provided URL
        // @ts-ignore
        script.onreadystatechange = res;
        script.onload = res;
        document.head.appendChild(script);
    });
}

var utils = /*#__PURE__*/Object.freeze({
    __proto__: null,
    sleep: sleep,
    append: append,
    uuid: uuid$1,
    htmlToElement: htmlToElement,
    castHtmlElements: castHtmlElements,
    shuffle: shuffle,
    downloadJson: downloadJson,
    dynamicallyLoadScript: dynamicallyLoadScript
});

class BasicElement extends HTMLElement {
    self;
    intervals;
    constructor(content, { clazz = '' } = {}) {
        super();
        this.self = this;
        append(this, content);
        if (clazz) {
            this.classList.add(...clazz.split(" "));
        }
        // ???
        this.remove = this.remove.bind(this);
        this.intervals = [];
    }
    /**
     *
     * Replace the current content of this element with the provided content
     *
     * @param content
     */
    setContent(...content) {
        this.innerHTML = "";
        append(this, content);
    }
    /**
     * Starts a interval timer that will stop when this element is no longer on the DOM
     *
     * @param {*} callback
     * @param {Number} time in ms
     *
     * @returns {Number} interval id.
     */
    setInterval(callback, time) {
        let id = setInterval(() => {
            if (!document.body.contains(this)) {
                this.intervals.forEach(i => clearInterval(i));
            }
            else {
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
        if (!value)
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
    setCss(name, value) {
        this.style.setProperty(name, '' + value);
    }
    getCss(name) {
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
    show(parent) {
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
        while (!('close' in ele)) {
            ele = ele.parentElement;
            if (ele == null)
                return this;
        }
        // @ts-ignore
        ele['close']();
        return this;
    }
    attach(parent) {
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
    querySelector(string) {
        // ???
        return super.querySelector(string);
    }
    /**
     *
     * @param {String} string
     *
     * @returns {NodeList<HTMLElement>}
     */
    querySelectorAll(string) {
        // ???
        return super.querySelectorAll(string);
    }
    /****** DROP LOGIC - TODO move to a behaviour class ********/
    #dropTypeSet = new Set();
    droppable = false;
    dragdata = {};
    /**
     *
     * Make the element draggable
     *
     * @param type a category of thing that is being dragged - eg a 'item', used to filter dropzones
     * @param data
     */
    makeDraggable(type = 'element', data = null, handle = null) {
        if (handle == null) {
            this.draggable = true;
        }
        else {
            handle.addEventListener('mousedown', () => {
                this.draggable = true;
            }, true);
            this.addEventListener('dragend', () => {
                this.draggable = false;
            }, true);
        }
        // by default the data to send is just the element itself
        type = type.toLowerCase();
        if (data == null)
            data = this;
        this.dragdata[type] = data;
        // add the event listener
        this.addEventListener('dragstart', (event) => {
            // setup a unique drag ID
            if (this.dataset['drag'] == null) {
                let id = "D_" + Math.floor(1_000_000 * Math.random()).toString(16);
                // TODO collision detection
                this.dataset['drag'] = id;
            }
            // pass the drag ID as info
            let selector = `[data-drag="${this.dataset['drag']}"]`;
            event.dataTransfer.setData(type, selector);
        });
    }
    #makeDroppable() {
        this.droppable = true;
        let handler = (event) => {
            let types = event.dataTransfer.types;
            for (let type of this.#dropTypeSet) {
                if (types.includes(type)) {
                    event.preventDefault();
                    return;
                }
            }
        };
        this.addEventListener('dragenter', handler);
        this.addEventListener('dragover', handler);
    }
    onDragOver(type, behaviour) {
        type = type.toLowerCase();
        if (!this.droppable)
            this.#makeDroppable();
        this.#dropTypeSet.add(type);
        this.addEventListener('dragover', (event) => {
            let datakey = event.dataTransfer.getData(type);
            if (datakey == "")
                return;
            if (datakey.startsWith('[data-drag')) {
                let draggedElement = document.querySelector(datakey);
                let data = draggedElement.dragdata[type];
                behaviour(data, event, draggedElement);
            }
        });
    }
    onDrop(type, behaviour) {
        type = type.toLowerCase();
        if (!this.droppable)
            this.#makeDroppable();
        this.#dropTypeSet.add(type);
        this.addEventListener('drop', (event) => {
            let datakey = event.dataTransfer.getData(type);
            if (datakey == "")
                return;
            if (datakey.startsWith('[data-drag')) {
                let draggedElement = document.querySelector(datakey);
                let data = draggedElement.dragdata[type];
                behaviour(data, event, draggedElement);
            }
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
    constructor(content, callback, options = {}) {
        super(content);
        this.setAttribute("ui-button", '');
        if (typeof callback == "string") {
            // create link like behaviour (left click open; middle/ctrl+click new tab)
            this.addEventListener('click', (e) => {
                // control key
                if (e.ctrlKey) {
                    window.open(callback);
                }
                else {
                    // otherwise
                    location.href = callback;
                }
            });
            this.addEventListener('auxclick', (e) => {
                // middle click
                if (e.button == 1) {
                    window.open(callback);
                }
            });
            this.addEventListener('mousedown', (e) => {
                if (e.button == 1) {
                    // on windows middlemouse down bring up the scroll widget; disable that
                    e.preventDefault();
                }
            });
        }
        else {
            // fire the provided event
            if (callback)
                this.addEventListener('click', callback);
        }
        if (options?.style)
            this.classList.add(options?.style);
        if (options?.color)
            this.classList.add(options?.color);
        let icon = options?.icon ?? this.attributes.getNamedItem("icon")?.value;
        if (icon) {
            let i = document.createElement('i');
            let classes = icon.trim().split(" ");
            // include the default font-awesome class if one wasn't provided
            if (!classes.includes('fa') && !classes.includes('fab') && !classes.includes('fas'))
                i.classList.add('fa');
            i.classList.add(...classes);
            this.prepend(i);
            if (content == '')
                i.classList.add('icon-only');
        }
    }
}
customElements.define('ui-button', Button);

class Toggle extends BasicElement {
    constructor(v, changeCallback) {
        super(`<input type="checkbox"/><div><span></span></div>`);
        this.value = v ?? (this.attributes.getNamedItem("value")?.value == "true");
        if (changeCallback) {
            this.querySelector('input').addEventListener('change', () => {
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

class DragHandle extends BasicElement {
    constructor() {
        super();
        this.classList.add("fa", "fa-grip-horizontal");
    }
}
customElements.define('ui-drag', DragHandle);

class Form extends BasicElement {
    static STYLE = {
        ROW: { parent: 'table', wrap: 'tr', label: 'th', value: 'td' },
        INLINE: { parent: null, wrap: 'span', label: 'label', value: 'span' }
    };
    static TRUE_STRINGS = new Set(["true", "1", "yes", "t", "y"]);
    template;
    changeListeners;
    formStyle;
    configuration;
    value;
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
        for (let listener of this.changeListeners)
            await listener(json);
        this.dispatchEvent(new Event('change'));
    }
    json(includeHidden = false) {
        return this._readValue(this, includeHidden);
    }
    _readValue(element, includeHidden = false) {
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
                    parent[k] = parent[k] ?? [];
                }
                else {
                    parent[k] = parent[k] ?? {};
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
    _readJsonWithKey(json, key) {
        try {
            let keys = key.split('.');
            for (let part of keys) {
                if (json == null)
                    return null;
                if (part.endsWith('[]')) {
                    part = part.substring(0, part.length - 2);
                    json = json[part];
                    if (json?.length > 0)
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
    async oneItem(template, itemValue, jsonKey, { style = Form.STYLE.ROW } = {}) {
        let element = document.createElement(style.wrap);
        element.dataset.element = jsonKey;
        let render = async (elementValue) => {
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
                        let parsedOptions;
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
                        let inputConfig = template;
                        let tStyle = inputConfig.style ?? 'INLINE';
                        let config = inputConfig.config ?? {
                            sortable: false
                        };
                        let substyle = Form.STYLE[tStyle];
                        let contain = document.createElement('div');
                        contain.classList.add('array');
                        contain.classList.add(tStyle);
                        // add button
                        let button = new Button("Add", null, { icon: 'fa-plus' });
                        let createItem = async (itemValue) => {
                            let item = new BasicElement(null, { clazz: 'item' });
                            item.append(...await this.jsonToHtml(inputConfig.children, itemValue, jsonKey, { style: substyle }));
                            item.append(new Button("", () => {
                                item.remove();
                                this.onChange();
                            }, { icon: 'fa-trash', style: "text", color: "error-color" }));
                            let inputs = item.querySelectorAll('[data-key]');
                            for (let input of inputs) {
                                input.addEventListener('change', this.onChange);
                            }
                            if (config.sortable) {
                                let handle = new DragHandle();
                                item.prepend(handle);
                                item.makeDraggable(jsonKey, null, handle);
                                item.onDrop(jsonKey, (draggedItem) => {
                                    // Work out if we are moving up or down the list
                                    let siblings = [...contain.childNodes];
                                    let indexA = siblings.indexOf(item);
                                    let indexB = siblings.indexOf(draggedItem);
                                    // and move as appropriate
                                    item.insertAdjacentElement(indexA < indexB ? 'beforebegin' : 'afterend', draggedItem);
                                });
                            }
                            contain.append(item);
                        };
                        button.addEventListener('click', async () => {
                            let item = await createItem(Array.isArray(inputConfig.children) ? {} : null);
                            this.onChange();
                            return item;
                        });
                        if (Array.isArray(elementValue)) {
                            for (let j of elementValue) {
                                await createItem(j);
                            }
                        }
                        wrapper.append(contain);
                        wrapper.append(button);
                        break;
                    case 'datetime': {
                        let input = htmlToElement(`<input data-key="${jsonKey}" type="datetime-local" placeholder="${template.placeholder ?? ''}"/>`);
                        input.value = elementValue ?? new Date().toISOString().substring(0, 16);
                        if (template.disabled)
                            input.setAttribute('disabled', '');
                        wrapper.append(input);
                        break;
                    }
                    case 'string':
                    default: {
                        let input = htmlToElement(`<input data-key="${jsonKey}" type="text" placeholder="${template.placeholder ?? ''}"/>`);
                        input.value = elementValue ?? null;
                        if (template.disabled)
                            input.setAttribute('disabled', '');
                        // Provide autocomplete options for the input
                        if (template.options) {
                            let parsedOptions;
                            if (!Array.isArray(template.options))
                                parsedOptions = await template.options(this.value);
                            else
                                parsedOptions = template.options;
                            let id = uuid$1();
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
        };
        await render(itemValue);
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
                let changeListener = async (fullJson) => {
                    let newJsonValue = this._readJsonWithKey(fullJson, redraw);
                    let newValue = JSON.stringify(newJsonValue);
                    if (lastValue !== newValue) {
                        // grab the current value directly from the element
                        let v = this._readValue(element);
                        let value = this._readJsonWithKey(v, jsonKey);
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
    constructor(content = '', options) {
        super();
        this.setAttribute("ui-panel", '');
        if (!this.innerHTML.trim()) {
            this.innerHTML = `
				${(options?.header || options?.title) ? `<header>${options?.title ?? ''}</header>` : ''}
				<content></content>
				${(options?.footer || options?.buttons) ? `<footer>${options?.buttons ?? ''}</footer>` : ''}
			`;
            append(this.content, content);
        }
        if (options?.clazz) {
            if (Array.isArray(options.clazz))
                this.classList.add(...options.clazz);
            else
                this.classList.add(options.clazz);
        }
    }
    get content() {
        return this.querySelector('content');
    }
    append(...elements) {
        append(this.content, elements);
    }
    header(...elements) {
        append(this.querySelector('header'), elements);
    }
    footer(...elements) {
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
        let panel = new Panel(content, { title, clazz, buttons, header, footer });
        panel.addEventListener("mousedown", () => event.stopPropagation());
        // rebind panel to parent splash so hide/show etc call parent
        panel.self = this;
        this.appendChild(panel);
    }
    get panel() {
        return this.querySelector("ui-panel");
    }
    close() {
        this.self.remove();
        return this;
    }
}
customElements.define('ui-modal', Modal);

class Toaster extends BasicElement {
    constructor() {
        super();
        this.attach();
    }
}
customElements.define('ui-toaster', Toaster);
function parseMessage(msg, topLevel = false) {
    if (Array.isArray(msg) && topLevel === true) {
        return msg.map(parseMessage).join(' ');
    }
    else if (typeof msg === 'object') {
        return JSON.stringify(msg, null, '\t');
    }
    else {
        return "" + msg;
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
        document.querySelectorAll('ui-toast').length;
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
async function popupForm(template, { value = {}, title = '', submitText = "Submit", wrapper = null, dismissable = true } = {}) {
    return new Promise(res => {
        let form = new Form(template);
        form.build(value).then(() => {
            let body = form;
            if (wrapper)
                body = wrapper(form);
            let modal = new Modal(body, {
                title: title,
                buttons: '<ui-cancel></ui-cancel><ui-spacer></ui-spacer>',
                dismissable: dismissable
            });
            modal.close = () => {
                modal.self.remove();
                res(null);
                return modal;
            };
            modal.panel.footer(new Button(submitText, () => {
                modal.self.remove();
                res(form.json());
            }));
            modal.show();
        });
    });
}
function info(...args) {
    new Toast(args, { level: 'info' });
}
function warn(...args) {
    new Toast(args, { level: 'warn' });
}
function error(...args) {
    new Toast(args, { level: 'error' });
}

var factory = /*#__PURE__*/Object.freeze({
    __proto__: null,
    popupForm: popupForm,
    info: info,
    warn: warn,
    error: error
});

class Badge extends BasicElement {
    constructor(content, { icon = '', clazz = '' } = {}) {
        super(content, { clazz });
        this.setAttribute("ui-badge", '');
        icon = icon || this.attributes.getNamedItem("icon")?.value;
        if (icon) {
            let i = document.createElement('i');
            let classes = icon.trim().split(" ");
            // include the default font-awesome class if one wasn't provided
            if (!classes.includes('fa') && !classes.includes('fab') && !classes.includes('fas'))
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
    cardInner;
    constructor(content) {
        super();
        this.setAttribute("ui-card", '');
        let con = content || this.innerHTML;
        this.innerHTML = `<div class="card"></div>`;
        this.cardInner = this.querySelector('.card');
        this.setContent(con);
    }
    setContent(content) {
        this.cardInner.innerHTML = "";
        append(this.cardInner, content);
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

var WorkerFactory = createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewoJJ3VzZSBzdHJpY3QnOwoKCS8vIEB0cy1ub2NoZWNrCglvbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHsKCQlobGpzLmNvbmZpZ3VyZSh7fSk7CgkJY29uc3QgcmVzdWx0ID0gaGxqcy5oaWdobGlnaHRBdXRvKGV2ZW50LmRhdGEpOwoJCXBvc3RNZXNzYWdlKHJlc3VsdC52YWx1ZSk7Cgl9OwoKCS8qCgkgIEhpZ2hsaWdodC5qcyAxMC4xLjAgKDc0ZGU2ZWFhKQoJICBMaWNlbnNlOiBCU0QtMy1DbGF1c2UKCSAgQ29weXJpZ2h0IChjKSAyMDA2LTIwMjAsIEl2YW4gU2FnYWxhZXYKCSovCgl2YXIgaGxqcz1mdW5jdGlvbigpe2Z1bmN0aW9uIGUobil7T2JqZWN0LmZyZWV6ZShuKTt2YXIgdD0iZnVuY3Rpb24iPT10eXBlb2YgbjtyZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobikuZm9yRWFjaCgoZnVuY3Rpb24ocil7IU9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG4scil8fG51bGw9PT1uW3JdfHwib2JqZWN0IiE9dHlwZW9mIG5bcl0mJiJmdW5jdGlvbiIhPXR5cGVvZiBuW3JdfHx0JiYoImNhbGxlciI9PT1yfHwiY2FsbGVlIj09PXJ8fCJhcmd1bWVudHMiPT09cil8fE9iamVjdC5pc0Zyb3plbihuW3JdKXx8ZShuW3JdKTt9KSksbn1jbGFzcyBue2NvbnN0cnVjdG9yKGUpe3ZvaWQgMD09PWUuZGF0YSYmKGUuZGF0YT17fSksdGhpcy5kYXRhPWUuZGF0YTt9aWdub3JlTWF0Y2goKXt0aGlzLmlnbm9yZT0hMDt9fWZ1bmN0aW9uIHQoZSl7cmV0dXJuIGUucmVwbGFjZSgvJi9nLCImYW1wOyIpLnJlcGxhY2UoLzwvZywiJmx0OyIpLnJlcGxhY2UoLz4vZywiJmd0OyIpLnJlcGxhY2UoLyIvZywiJnF1b3Q7IikucmVwbGFjZSgvJy9nLCImI3gyNzsiKX1mdW5jdGlvbiByKGUsLi4ubil7dmFyIHQ9e307Zm9yKGNvbnN0IG4gaW4gZSl0W25dPWVbbl07cmV0dXJuIG4uZm9yRWFjaCgoZnVuY3Rpb24oZSl7Zm9yKGNvbnN0IG4gaW4gZSl0W25dPWVbbl07fSkpLHR9ZnVuY3Rpb24gYShlKXtyZXR1cm4gZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpfXZhciBpPU9iamVjdC5mcmVlemUoe19fcHJvdG9fXzpudWxsLGVzY2FwZUhUTUw6dCxpbmhlcml0OnIsbm9kZVN0cmVhbTpmdW5jdGlvbihlKXt2YXIgbj1bXTtyZXR1cm4gZnVuY3Rpb24gZSh0LHIpe2Zvcih2YXIgaT10LmZpcnN0Q2hpbGQ7aTtpPWkubmV4dFNpYmxpbmcpMz09PWkubm9kZVR5cGU/cis9aS5ub2RlVmFsdWUubGVuZ3RoOjE9PT1pLm5vZGVUeXBlJiYobi5wdXNoKHtldmVudDoic3RhcnQiLG9mZnNldDpyLG5vZGU6aX0pLHI9ZShpLHIpLGEoaSkubWF0Y2goL2JyfGhyfGltZ3xpbnB1dC8pfHxuLnB1c2goe2V2ZW50OiJzdG9wIixvZmZzZXQ6cixub2RlOml9KSk7cmV0dXJuIHJ9KGUsMCksbn0sbWVyZ2VTdHJlYW1zOmZ1bmN0aW9uKGUsbixyKXt2YXIgaT0wLHM9IiIsbz1bXTtmdW5jdGlvbiBsKCl7cmV0dXJuIGUubGVuZ3RoJiZuLmxlbmd0aD9lWzBdLm9mZnNldCE9PW5bMF0ub2Zmc2V0P2VbMF0ub2Zmc2V0PG5bMF0ub2Zmc2V0P2U6bjoic3RhcnQiPT09blswXS5ldmVudD9lOm46ZS5sZW5ndGg/ZTpufWZ1bmN0aW9uIGMoZSl7cys9IjwiK2EoZSkrW10ubWFwLmNhbGwoZS5hdHRyaWJ1dGVzLChmdW5jdGlvbihlKXtyZXR1cm4gIiAiK2Uubm9kZU5hbWUrJz0iJyt0KGUudmFsdWUpKyciJ30pKS5qb2luKCIiKSsiPiI7fWZ1bmN0aW9uIHUoZSl7cys9IjwvIithKGUpKyI+Ijt9ZnVuY3Rpb24gZChlKXsoInN0YXJ0Ij09PWUuZXZlbnQ/Yzp1KShlLm5vZGUpO31mb3IoO2UubGVuZ3RofHxuLmxlbmd0aDspe3ZhciBnPWwoKTtpZihzKz10KHIuc3Vic3RyaW5nKGksZ1swXS5vZmZzZXQpKSxpPWdbMF0ub2Zmc2V0LGc9PT1lKXtvLnJldmVyc2UoKS5mb3JFYWNoKHUpO2Rve2QoZy5zcGxpY2UoMCwxKVswXSksZz1sKCk7fXdoaWxlKGc9PT1lJiZnLmxlbmd0aCYmZ1swXS5vZmZzZXQ9PT1pKTtvLnJldmVyc2UoKS5mb3JFYWNoKGMpO31lbHNlICJzdGFydCI9PT1nWzBdLmV2ZW50P28ucHVzaChnWzBdLm5vZGUpOm8ucG9wKCksZChnLnNwbGljZSgwLDEpWzBdKTt9cmV0dXJuIHMrdChyLnN1YnN0cihpKSl9fSk7Y29uc3Qgcz0iPC9zcGFuPiIsbz1lPT4hIWUua2luZDtjbGFzcyBse2NvbnN0cnVjdG9yKGUsbil7dGhpcy5idWZmZXI9IiIsdGhpcy5jbGFzc1ByZWZpeD1uLmNsYXNzUHJlZml4LGUud2Fsayh0aGlzKTt9YWRkVGV4dChlKXt0aGlzLmJ1ZmZlcis9dChlKTt9b3Blbk5vZGUoZSl7aWYoIW8oZSkpcmV0dXJuO2xldCBuPWUua2luZDtlLnN1Ymxhbmd1YWdlfHwobj1gJHt0aGlzLmNsYXNzUHJlZml4fSR7bn1gKSx0aGlzLnNwYW4obik7fWNsb3NlTm9kZShlKXtvKGUpJiYodGhpcy5idWZmZXIrPXMpO312YWx1ZSgpe3JldHVybiB0aGlzLmJ1ZmZlcn1zcGFuKGUpe3RoaXMuYnVmZmVyKz1gPHNwYW4gY2xhc3M9IiR7ZX0iPmA7fX1jbGFzcyBje2NvbnN0cnVjdG9yKCl7dGhpcy5yb290Tm9kZT17Y2hpbGRyZW46W119LHRoaXMuc3RhY2s9W3RoaXMucm9vdE5vZGVdO31nZXQgdG9wKCl7cmV0dXJuIHRoaXMuc3RhY2tbdGhpcy5zdGFjay5sZW5ndGgtMV19Z2V0IHJvb3QoKXtyZXR1cm4gdGhpcy5yb290Tm9kZX1hZGQoZSl7dGhpcy50b3AuY2hpbGRyZW4ucHVzaChlKTt9b3Blbk5vZGUoZSl7Y29uc3Qgbj17a2luZDplLGNoaWxkcmVuOltdfTt0aGlzLmFkZChuKSx0aGlzLnN0YWNrLnB1c2gobik7fWNsb3NlTm9kZSgpe2lmKHRoaXMuc3RhY2subGVuZ3RoPjEpcmV0dXJuIHRoaXMuc3RhY2sucG9wKCl9Y2xvc2VBbGxOb2Rlcygpe2Zvcig7dGhpcy5jbG9zZU5vZGUoKTspO310b0pTT04oKXtyZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5yb290Tm9kZSxudWxsLDQpfXdhbGsoZSl7cmV0dXJuIHRoaXMuY29uc3RydWN0b3IuX3dhbGsoZSx0aGlzLnJvb3ROb2RlKX1zdGF0aWMgX3dhbGsoZSxuKXtyZXR1cm4gInN0cmluZyI9PXR5cGVvZiBuP2UuYWRkVGV4dChuKTpuLmNoaWxkcmVuJiYoZS5vcGVuTm9kZShuKSxuLmNoaWxkcmVuLmZvckVhY2gobj0+dGhpcy5fd2FsayhlLG4pKSxlLmNsb3NlTm9kZShuKSksZX1zdGF0aWMgX2NvbGxhcHNlKGUpeyJzdHJpbmciIT10eXBlb2YgZSYmZS5jaGlsZHJlbiYmKGUuY2hpbGRyZW4uZXZlcnkoZT0+InN0cmluZyI9PXR5cGVvZiBlKT9lLmNoaWxkcmVuPVtlLmNoaWxkcmVuLmpvaW4oIiIpXTplLmNoaWxkcmVuLmZvckVhY2goZT0+e2MuX2NvbGxhcHNlKGUpO30pKTt9fWNsYXNzIHUgZXh0ZW5kcyBje2NvbnN0cnVjdG9yKGUpe3N1cGVyKCksdGhpcy5vcHRpb25zPWU7fWFkZEtleXdvcmQoZSxuKXsiIiE9PWUmJih0aGlzLm9wZW5Ob2RlKG4pLHRoaXMuYWRkVGV4dChlKSx0aGlzLmNsb3NlTm9kZSgpKTt9YWRkVGV4dChlKXsiIiE9PWUmJnRoaXMuYWRkKGUpO31hZGRTdWJsYW5ndWFnZShlLG4pe2NvbnN0IHQ9ZS5yb290O3Qua2luZD1uLHQuc3VibGFuZ3VhZ2U9ITAsdGhpcy5hZGQodCk7fXRvSFRNTCgpe3JldHVybiBuZXcgbCh0aGlzLHRoaXMub3B0aW9ucykudmFsdWUoKX1maW5hbGl6ZSgpe3JldHVybiAhMH19ZnVuY3Rpb24gZChlKXtyZXR1cm4gZT8ic3RyaW5nIj09dHlwZW9mIGU/ZTplLnNvdXJjZTpudWxsfWNvbnN0IGc9IigtPykoXFxiMFt4WF1bYS1mQS1GMC05XSt8KFxcYlxcZCsoXFwuXFxkKik/fFxcLlxcZCspKFtlRV1bLStdP1xcZCspPykiLGg9e2JlZ2luOiJcXFxcW1xcc1xcU10iLHJlbGV2YW5jZTowfSxmPXtjbGFzc05hbWU6InN0cmluZyIsYmVnaW46IiciLGVuZDoiJyIsaWxsZWdhbDoiXFxuIixjb250YWluczpbaF19LHA9e2NsYXNzTmFtZToic3RyaW5nIixiZWdpbjonIicsZW5kOiciJyxpbGxlZ2FsOiJcXG4iLGNvbnRhaW5zOltoXX0sYj17YmVnaW46L1xiKGF8YW58dGhlfGFyZXxJJ218aXNuJ3R8ZG9uJ3R8ZG9lc24ndHx3b24ndHxidXR8anVzdHxzaG91bGR8cHJldHR5fHNpbXBseXxlbm91Z2h8Z29ubmF8Z29pbmd8d3RmfHNvfHN1Y2h8d2lsbHx5b3V8eW91cnx0aGV5fGxpa2V8bW9yZSlcYi99LG09ZnVuY3Rpb24oZSxuLHQ9e30pe3ZhciBhPXIoe2NsYXNzTmFtZToiY29tbWVudCIsYmVnaW46ZSxlbmQ6bixjb250YWluczpbXX0sdCk7cmV0dXJuIGEuY29udGFpbnMucHVzaChiKSxhLmNvbnRhaW5zLnB1c2goe2NsYXNzTmFtZToiZG9jdGFnIixiZWdpbjoiKD86VE9ET3xGSVhNRXxOT1RFfEJVR3xPUFRJTUlaRXxIQUNLfFhYWCk6IixyZWxldmFuY2U6MH0pLGF9LHY9bSgiLy8iLCIkIikseD1tKCIvXFwqIiwiXFwqLyIpLEU9bSgiIyIsIiQiKTt2YXIgXz1PYmplY3QuZnJlZXplKHtfX3Byb3RvX186bnVsbCxJREVOVF9SRToiW2EtekEtWl1cXHcqIixVTkRFUlNDT1JFX0lERU5UX1JFOiJbYS16QS1aX11cXHcqIixOVU1CRVJfUkU6IlxcYlxcZCsoXFwuXFxkKyk/IixDX05VTUJFUl9SRTpnLEJJTkFSWV9OVU1CRVJfUkU6IlxcYigwYlswMV0rKSIsUkVfU1RBUlRFUlNfUkU6IiF8IT18IT09fCV8JT18JnwmJnwmPXxcXCp8XFwqPXxcXCt8XFwrPXwsfC18LT18Lz18L3w6fDt8PDx8PDw9fDw9fDx8PT09fD09fD18Pj4+PXw+Pj18Pj18Pj4+fD4+fD58XFw/fFxcW3xcXHt8XFwofFxcXnxcXF49fFxcfHxcXHw9fFxcfFxcfHx+IixTSEVCQU5HOihlPXt9KT0+e2NvbnN0IG49L14jIVsgXSpcLy87cmV0dXJuIGUuYmluYXJ5JiYoZS5iZWdpbj1mdW5jdGlvbiguLi5lKXtyZXR1cm4gZS5tYXAoZT0+ZChlKSkuam9pbigiIil9KG4sLy4qXGIvLGUuYmluYXJ5LC9cYi4qLykpLHIoe2NsYXNzTmFtZToibWV0YSIsYmVnaW46bixlbmQ6LyQvLHJlbGV2YW5jZTowLCJvbjpiZWdpbiI6KGUsbik9PnswIT09ZS5pbmRleCYmbi5pZ25vcmVNYXRjaCgpO319LGUpfSxCQUNLU0xBU0hfRVNDQVBFOmgsQVBPU19TVFJJTkdfTU9ERTpmLFFVT1RFX1NUUklOR19NT0RFOnAsUEhSQVNBTF9XT1JEU19NT0RFOmIsQ09NTUVOVDptLENfTElORV9DT01NRU5UX01PREU6dixDX0JMT0NLX0NPTU1FTlRfTU9ERTp4LEhBU0hfQ09NTUVOVF9NT0RFOkUsTlVNQkVSX01PREU6e2NsYXNzTmFtZToibnVtYmVyIixiZWdpbjoiXFxiXFxkKyhcXC5cXGQrKT8iLHJlbGV2YW5jZTowfSxDX05VTUJFUl9NT0RFOntjbGFzc05hbWU6Im51bWJlciIsYmVnaW46ZyxyZWxldmFuY2U6MH0sQklOQVJZX05VTUJFUl9NT0RFOntjbGFzc05hbWU6Im51bWJlciIsYmVnaW46IlxcYigwYlswMV0rKSIscmVsZXZhbmNlOjB9LENTU19OVU1CRVJfTU9ERTp7Y2xhc3NOYW1lOiJudW1iZXIiLGJlZ2luOiJcXGJcXGQrKFxcLlxcZCspPyglfGVtfGV4fGNofHJlbXx2d3x2aHx2bWlufHZtYXh8Y218bW18aW58cHR8cGN8cHh8ZGVnfGdyYWR8cmFkfHR1cm58c3xtc3xIenxrSHp8ZHBpfGRwY218ZHBweCk/IixyZWxldmFuY2U6MH0sUkVHRVhQX01PREU6e2JlZ2luOi8oPz1cL1teL1xuXSpcLykvLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJyZWdleHAiLGJlZ2luOi9cLy8sZW5kOi9cL1tnaW11eV0qLyxpbGxlZ2FsOi9cbi8sY29udGFpbnM6W2gse2JlZ2luOi9cWy8sZW5kOi9cXS8scmVsZXZhbmNlOjAsY29udGFpbnM6W2hdfV19XX0sVElUTEVfTU9ERTp7Y2xhc3NOYW1lOiJ0aXRsZSIsYmVnaW46IlthLXpBLVpdXFx3KiIscmVsZXZhbmNlOjB9LFVOREVSU0NPUkVfVElUTEVfTU9ERTp7Y2xhc3NOYW1lOiJ0aXRsZSIsYmVnaW46IlthLXpBLVpfXVxcdyoiLHJlbGV2YW5jZTowfSxNRVRIT0RfR1VBUkQ6e2JlZ2luOiJcXC5cXHMqW2EtekEtWl9dXFx3KiIscmVsZXZhbmNlOjB9LEVORF9TQU1FX0FTX0JFR0lOOmZ1bmN0aW9uKGUpe3JldHVybiBPYmplY3QuYXNzaWduKGUseyJvbjpiZWdpbiI6KGUsbik9PntuLmRhdGEuX2JlZ2luTWF0Y2g9ZVsxXTt9LCJvbjplbmQiOihlLG4pPT57bi5kYXRhLl9iZWdpbk1hdGNoIT09ZVsxXSYmbi5pZ25vcmVNYXRjaCgpO319KX19KSxOPSJvZiBhbmQgZm9yIGluIG5vdCBvciBpZiB0aGVuIi5zcGxpdCgiICIpO2Z1bmN0aW9uIHcoZSxuKXtyZXR1cm4gbj8rbjpmdW5jdGlvbihlKXtyZXR1cm4gTi5pbmNsdWRlcyhlLnRvTG93ZXJDYXNlKCkpfShlKT8wOjF9Y29uc3QgUj10LHk9cix7bm9kZVN0cmVhbTprLG1lcmdlU3RyZWFtczpPfT1pLE09U3ltYm9sKCJub21hdGNoIik7cmV0dXJuIGZ1bmN0aW9uKHQpe3ZhciBhPVtdLGk9e30scz17fSxvPVtdLGw9ITAsYz0vKF4oPFtePl0rPnxcdHwpK3xcbikvZ20sZz0iQ291bGQgbm90IGZpbmQgdGhlIGxhbmd1YWdlICd7fScsIGRpZCB5b3UgZm9yZ2V0IHRvIGxvYWQvaW5jbHVkZSBhIGxhbmd1YWdlIG1vZHVsZT8iO2NvbnN0IGg9e2Rpc2FibGVBdXRvZGV0ZWN0OiEwLG5hbWU6IlBsYWluIHRleHQiLGNvbnRhaW5zOltdfTt2YXIgZj17bm9IaWdobGlnaHRSZTovXihuby0/aGlnaGxpZ2h0KSQvaSxsYW5ndWFnZURldGVjdFJlOi9cYmxhbmcoPzp1YWdlKT8tKFtcdy1dKylcYi9pLGNsYXNzUHJlZml4OiJobGpzLSIsdGFiUmVwbGFjZTpudWxsLHVzZUJSOiExLGxhbmd1YWdlczpudWxsLF9fZW1pdHRlcjp1fTtmdW5jdGlvbiBwKGUpe3JldHVybiBmLm5vSGlnaGxpZ2h0UmUudGVzdChlKX1mdW5jdGlvbiBiKGUsbix0LHIpe3ZhciBhPXtjb2RlOm4sbGFuZ3VhZ2U6ZX07UygiYmVmb3JlOmhpZ2hsaWdodCIsYSk7dmFyIGk9YS5yZXN1bHQ/YS5yZXN1bHQ6bShhLmxhbmd1YWdlLGEuY29kZSx0LHIpO3JldHVybiBpLmNvZGU9YS5jb2RlLFMoImFmdGVyOmhpZ2hsaWdodCIsaSksaX1mdW5jdGlvbiBtKGUsdCxhLHMpe3ZhciBvPXQ7ZnVuY3Rpb24gYyhlLG4pe3ZhciB0PUUuY2FzZV9pbnNlbnNpdGl2ZT9uWzBdLnRvTG93ZXJDYXNlKCk6blswXTtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGUua2V5d29yZHMsdCkmJmUua2V5d29yZHNbdF19ZnVuY3Rpb24gdSgpe251bGwhPXkuc3ViTGFuZ3VhZ2U/ZnVuY3Rpb24oKXtpZigiIiE9PUEpe3ZhciBlPW51bGw7aWYoInN0cmluZyI9PXR5cGVvZiB5LnN1Ykxhbmd1YWdlKXtpZighaVt5LnN1Ykxhbmd1YWdlXSlyZXR1cm4gdm9pZCBPLmFkZFRleHQoQSk7ZT1tKHkuc3ViTGFuZ3VhZ2UsQSwhMCxrW3kuc3ViTGFuZ3VhZ2VdKSxrW3kuc3ViTGFuZ3VhZ2VdPWUudG9wO31lbHNlIGU9dihBLHkuc3ViTGFuZ3VhZ2UubGVuZ3RoP3kuc3ViTGFuZ3VhZ2U6bnVsbCk7eS5yZWxldmFuY2U+MCYmKEkrPWUucmVsZXZhbmNlKSxPLmFkZFN1Ymxhbmd1YWdlKGUuZW1pdHRlcixlLmxhbmd1YWdlKTt9fSgpOmZ1bmN0aW9uKCl7aWYoIXkua2V5d29yZHMpcmV0dXJuIHZvaWQgTy5hZGRUZXh0KEEpO2xldCBlPTA7eS5rZXl3b3JkUGF0dGVyblJlLmxhc3RJbmRleD0wO2xldCBuPXkua2V5d29yZFBhdHRlcm5SZS5leGVjKEEpLHQ9IiI7Zm9yKDtuOyl7dCs9QS5zdWJzdHJpbmcoZSxuLmluZGV4KTtjb25zdCByPWMoeSxuKTtpZihyKXtjb25zdFtlLGFdPXI7Ty5hZGRUZXh0KHQpLHQ9IiIsSSs9YSxPLmFkZEtleXdvcmQoblswXSxlKTt9ZWxzZSB0Kz1uWzBdO2U9eS5rZXl3b3JkUGF0dGVyblJlLmxhc3RJbmRleCxuPXkua2V5d29yZFBhdHRlcm5SZS5leGVjKEEpO310Kz1BLnN1YnN0cihlKSxPLmFkZFRleHQodCk7fSgpLEE9IiI7fWZ1bmN0aW9uIGgoZSl7cmV0dXJuIGUuY2xhc3NOYW1lJiZPLm9wZW5Ob2RlKGUuY2xhc3NOYW1lKSx5PU9iamVjdC5jcmVhdGUoZSx7cGFyZW50Ont2YWx1ZTp5fX0pfWZ1bmN0aW9uIHAoZSl7cmV0dXJuIDA9PT15Lm1hdGNoZXIucmVnZXhJbmRleD8oQSs9ZVswXSwxKTooTD0hMCwwKX12YXIgYj17fTtmdW5jdGlvbiB4KHQscil7dmFyIGk9ciYmclswXTtpZihBKz10LG51bGw9PWkpcmV0dXJuIHUoKSwwO2lmKCJiZWdpbiI9PT1iLnR5cGUmJiJlbmQiPT09ci50eXBlJiZiLmluZGV4PT09ci5pbmRleCYmIiI9PT1pKXtpZihBKz1vLnNsaWNlKHIuaW5kZXgsci5pbmRleCsxKSwhbCl7Y29uc3Qgbj1FcnJvcigiMCB3aWR0aCBtYXRjaCByZWdleCIpO3Rocm93IG4ubGFuZ3VhZ2VOYW1lPWUsbi5iYWRSdWxlPWIucnVsZSxufXJldHVybiAxfWlmKGI9ciwiYmVnaW4iPT09ci50eXBlKXJldHVybiBmdW5jdGlvbihlKXt2YXIgdD1lWzBdLHI9ZS5ydWxlO2NvbnN0IGE9bmV3IG4ociksaT1bci5fX2JlZm9yZUJlZ2luLHJbIm9uOmJlZ2luIl1dO2Zvcihjb25zdCBuIG9mIGkpaWYobiYmKG4oZSxhKSxhLmlnbm9yZSkpcmV0dXJuIHAodCk7cmV0dXJuIHImJnIuZW5kU2FtZUFzQmVnaW4mJihyLmVuZFJlPVJlZ0V4cCh0LnJlcGxhY2UoL1stL1xcXiQqKz8uKCl8W1xde31dL2csIlxcJCYiKSwibSIpKSxyLnNraXA/QSs9dDooci5leGNsdWRlQmVnaW4mJihBKz10KSx1KCksci5yZXR1cm5CZWdpbnx8ci5leGNsdWRlQmVnaW58fChBPXQpKSxoKHIpLHIucmV0dXJuQmVnaW4/MDp0Lmxlbmd0aH0ocik7aWYoImlsbGVnYWwiPT09ci50eXBlJiYhYSl7Y29uc3QgZT1FcnJvcignSWxsZWdhbCBsZXhlbWUgIicraSsnIiBmb3IgbW9kZSAiJysoeS5jbGFzc05hbWV8fCI8dW5uYW1lZD4iKSsnIicpO3Rocm93IGUubW9kZT15LGV9aWYoImVuZCI9PT1yLnR5cGUpe3ZhciBzPWZ1bmN0aW9uKGUpe3ZhciB0PWVbMF0scj1vLnN1YnN0cihlLmluZGV4KSxhPWZ1bmN0aW9uIGUodCxyLGEpe2xldCBpPWZ1bmN0aW9uKGUsbil7dmFyIHQ9ZSYmZS5leGVjKG4pO3JldHVybiB0JiYwPT09dC5pbmRleH0odC5lbmRSZSxhKTtpZihpKXtpZih0WyJvbjplbmQiXSl7Y29uc3QgZT1uZXcgbih0KTt0WyJvbjplbmQiXShyLGUpLGUuaWdub3JlJiYoaT0hMSk7fWlmKGkpe2Zvcig7dC5lbmRzUGFyZW50JiZ0LnBhcmVudDspdD10LnBhcmVudDtyZXR1cm4gdH19aWYodC5lbmRzV2l0aFBhcmVudClyZXR1cm4gZSh0LnBhcmVudCxyLGEpfSh5LGUscik7aWYoIWEpcmV0dXJuIE07dmFyIGk9eTtpLnNraXA/QSs9dDooaS5yZXR1cm5FbmR8fGkuZXhjbHVkZUVuZHx8KEErPXQpLHUoKSxpLmV4Y2x1ZGVFbmQmJihBPXQpKTtkb3t5LmNsYXNzTmFtZSYmTy5jbG9zZU5vZGUoKSx5LnNraXB8fHkuc3ViTGFuZ3VhZ2V8fChJKz15LnJlbGV2YW5jZSkseT15LnBhcmVudDt9d2hpbGUoeSE9PWEucGFyZW50KTtyZXR1cm4gYS5zdGFydHMmJihhLmVuZFNhbWVBc0JlZ2luJiYoYS5zdGFydHMuZW5kUmU9YS5lbmRSZSksaChhLnN0YXJ0cykpLGkucmV0dXJuRW5kPzA6dC5sZW5ndGh9KHIpO2lmKHMhPT1NKXJldHVybiBzfWlmKCJpbGxlZ2FsIj09PXIudHlwZSYmIiI9PT1pKXJldHVybiAxO2lmKEI+MWU1JiZCPjMqci5pbmRleCl0aHJvdyBFcnJvcigicG90ZW50aWFsIGluZmluaXRlIGxvb3AsIHdheSBtb3JlIGl0ZXJhdGlvbnMgdGhhbiBtYXRjaGVzIik7cmV0dXJuIEErPWksaS5sZW5ndGh9dmFyIEU9VChlKTtpZighRSl0aHJvdyBjb25zb2xlLmVycm9yKGcucmVwbGFjZSgie30iLGUpKSxFcnJvcignVW5rbm93biBsYW5ndWFnZTogIicrZSsnIicpO3ZhciBfPWZ1bmN0aW9uKGUpe2Z1bmN0aW9uIG4obix0KXtyZXR1cm4gUmVnRXhwKGQobiksIm0iKyhlLmNhc2VfaW5zZW5zaXRpdmU/ImkiOiIiKSsodD8iZyI6IiIpKX1jbGFzcyB0e2NvbnN0cnVjdG9yKCl7dGhpcy5tYXRjaEluZGV4ZXM9e30sdGhpcy5yZWdleGVzPVtdLHRoaXMubWF0Y2hBdD0xLHRoaXMucG9zaXRpb249MDt9YWRkUnVsZShlLG4pe24ucG9zaXRpb249dGhpcy5wb3NpdGlvbisrLHRoaXMubWF0Y2hJbmRleGVzW3RoaXMubWF0Y2hBdF09bix0aGlzLnJlZ2V4ZXMucHVzaChbbixlXSksdGhpcy5tYXRjaEF0Kz1mdW5jdGlvbihlKXtyZXR1cm4gUmVnRXhwKGUudG9TdHJpbmcoKSsifCIpLmV4ZWMoIiIpLmxlbmd0aC0xfShlKSsxO31jb21waWxlKCl7MD09PXRoaXMucmVnZXhlcy5sZW5ndGgmJih0aGlzLmV4ZWM9KCk9Pm51bGwpO2NvbnN0IGU9dGhpcy5yZWdleGVzLm1hcChlPT5lWzFdKTt0aGlzLm1hdGNoZXJSZT1uKGZ1bmN0aW9uKGUsbj0ifCIpe2Zvcih2YXIgdD0vXFsoPzpbXlxcXF1dfFxcLikqXF18XChcPz98XFwoWzEtOV1bMC05XSopfFxcLi8scj0wLGE9IiIsaT0wO2k8ZS5sZW5ndGg7aSsrKXt2YXIgcz1yKz0xLG89ZChlW2ldKTtmb3IoaT4wJiYoYSs9biksYSs9IigiO28ubGVuZ3RoPjA7KXt2YXIgbD10LmV4ZWMobyk7aWYobnVsbD09bCl7YSs9bzticmVha31hKz1vLnN1YnN0cmluZygwLGwuaW5kZXgpLG89by5zdWJzdHJpbmcobC5pbmRleCtsWzBdLmxlbmd0aCksIlxcIj09PWxbMF1bMF0mJmxbMV0/YSs9IlxcIisoK2xbMV0rcyk6KGErPWxbMF0sIigiPT09bFswXSYmcisrKTt9YSs9IikiO31yZXR1cm4gYX0oZSksITApLHRoaXMubGFzdEluZGV4PTA7fWV4ZWMoZSl7dGhpcy5tYXRjaGVyUmUubGFzdEluZGV4PXRoaXMubGFzdEluZGV4O2NvbnN0IG49dGhpcy5tYXRjaGVyUmUuZXhlYyhlKTtpZighbilyZXR1cm4gbnVsbDtjb25zdCB0PW4uZmluZEluZGV4KChlLG4pPT5uPjAmJnZvaWQgMCE9PWUpLHI9dGhpcy5tYXRjaEluZGV4ZXNbdF07cmV0dXJuIG4uc3BsaWNlKDAsdCksT2JqZWN0LmFzc2lnbihuLHIpfX1jbGFzcyBhe2NvbnN0cnVjdG9yKCl7dGhpcy5ydWxlcz1bXSx0aGlzLm11bHRpUmVnZXhlcz1bXSx0aGlzLmNvdW50PTAsdGhpcy5sYXN0SW5kZXg9MCx0aGlzLnJlZ2V4SW5kZXg9MDt9Z2V0TWF0Y2hlcihlKXtpZih0aGlzLm11bHRpUmVnZXhlc1tlXSlyZXR1cm4gdGhpcy5tdWx0aVJlZ2V4ZXNbZV07Y29uc3Qgbj1uZXcgdDtyZXR1cm4gdGhpcy5ydWxlcy5zbGljZShlKS5mb3JFYWNoKChbZSx0XSk9Pm4uYWRkUnVsZShlLHQpKSxuLmNvbXBpbGUoKSx0aGlzLm11bHRpUmVnZXhlc1tlXT1uLG59Y29uc2lkZXJBbGwoKXt0aGlzLnJlZ2V4SW5kZXg9MDt9YWRkUnVsZShlLG4pe3RoaXMucnVsZXMucHVzaChbZSxuXSksImJlZ2luIj09PW4udHlwZSYmdGhpcy5jb3VudCsrO31leGVjKGUpe2NvbnN0IG49dGhpcy5nZXRNYXRjaGVyKHRoaXMucmVnZXhJbmRleCk7bi5sYXN0SW5kZXg9dGhpcy5sYXN0SW5kZXg7Y29uc3QgdD1uLmV4ZWMoZSk7cmV0dXJuIHQmJih0aGlzLnJlZ2V4SW5kZXgrPXQucG9zaXRpb24rMSx0aGlzLnJlZ2V4SW5kZXg9PT10aGlzLmNvdW50JiYodGhpcy5yZWdleEluZGV4PTApKSx0fX1mdW5jdGlvbiBpKGUsbil7Y29uc3QgdD1lLmlucHV0W2UuaW5kZXgtMV0scj1lLmlucHV0W2UuaW5kZXgrZVswXS5sZW5ndGhdOyIuIiE9PXQmJiIuIiE9PXJ8fG4uaWdub3JlTWF0Y2goKTt9aWYoZS5jb250YWlucyYmZS5jb250YWlucy5pbmNsdWRlcygic2VsZiIpKXRocm93IEVycm9yKCJFUlI6IGNvbnRhaW5zIGBzZWxmYCBpcyBub3Qgc3VwcG9ydGVkIGF0IHRoZSB0b3AtbGV2ZWwgb2YgYSBsYW5ndWFnZS4gIFNlZSBkb2N1bWVudGF0aW9uLiIpO3JldHVybiBmdW5jdGlvbiB0KHMsbyl7Y29uc3QgbD1zO2lmKHMuY29tcGlsZWQpcmV0dXJuIGw7cy5jb21waWxlZD0hMCxzLl9fYmVmb3JlQmVnaW49bnVsbCxzLmtleXdvcmRzPXMua2V5d29yZHN8fHMuYmVnaW5LZXl3b3JkcztsZXQgYz1udWxsO2lmKCJvYmplY3QiPT10eXBlb2Ygcy5rZXl3b3JkcyYmKGM9cy5rZXl3b3Jkcy4kcGF0dGVybixkZWxldGUgcy5rZXl3b3Jkcy4kcGF0dGVybikscy5rZXl3b3JkcyYmKHMua2V5d29yZHM9ZnVuY3Rpb24oZSxuKXt2YXIgdD17fTtyZXR1cm4gInN0cmluZyI9PXR5cGVvZiBlP3IoImtleXdvcmQiLGUpOk9iamVjdC5rZXlzKGUpLmZvckVhY2goKGZ1bmN0aW9uKG4pe3IobixlW25dKTt9KSksdDtmdW5jdGlvbiByKGUscil7biYmKHI9ci50b0xvd2VyQ2FzZSgpKSxyLnNwbGl0KCIgIikuZm9yRWFjaCgoZnVuY3Rpb24obil7dmFyIHI9bi5zcGxpdCgifCIpO3RbclswXV09W2UsdyhyWzBdLHJbMV0pXTt9KSk7fX0ocy5rZXl3b3JkcyxlLmNhc2VfaW5zZW5zaXRpdmUpKSxzLmxleGVtZXMmJmMpdGhyb3cgRXJyb3IoIkVSUjogUHJlZmVyIGBrZXl3b3Jkcy4kcGF0dGVybmAgdG8gYG1vZGUubGV4ZW1lc2AsIEJPVEggYXJlIG5vdCBhbGxvd2VkLiAoc2VlIG1vZGUgcmVmZXJlbmNlKSAiKTtyZXR1cm4gbC5rZXl3b3JkUGF0dGVyblJlPW4ocy5sZXhlbWVzfHxjfHwvXHcrLywhMCksbyYmKHMuYmVnaW5LZXl3b3JkcyYmKHMuYmVnaW49IlxcYigiK3MuYmVnaW5LZXl3b3Jkcy5zcGxpdCgiICIpLmpvaW4oInwiKSsiKSg/PVxcYnxcXHMpIixzLl9fYmVmb3JlQmVnaW49aSkscy5iZWdpbnx8KHMuYmVnaW49L1xCfFxiLyksbC5iZWdpblJlPW4ocy5iZWdpbikscy5lbmRTYW1lQXNCZWdpbiYmKHMuZW5kPXMuYmVnaW4pLHMuZW5kfHxzLmVuZHNXaXRoUGFyZW50fHwocy5lbmQ9L1xCfFxiLykscy5lbmQmJihsLmVuZFJlPW4ocy5lbmQpKSxsLnRlcm1pbmF0b3JfZW5kPWQocy5lbmQpfHwiIixzLmVuZHNXaXRoUGFyZW50JiZvLnRlcm1pbmF0b3JfZW5kJiYobC50ZXJtaW5hdG9yX2VuZCs9KHMuZW5kPyJ8IjoiIikrby50ZXJtaW5hdG9yX2VuZCkpLHMuaWxsZWdhbCYmKGwuaWxsZWdhbFJlPW4ocy5pbGxlZ2FsKSksdm9pZCAwPT09cy5yZWxldmFuY2UmJihzLnJlbGV2YW5jZT0xKSxzLmNvbnRhaW5zfHwocy5jb250YWlucz1bXSkscy5jb250YWlucz1bXS5jb25jYXQoLi4ucy5jb250YWlucy5tYXAoKGZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbihlKXtyZXR1cm4gZS52YXJpYW50cyYmIWUuY2FjaGVkX3ZhcmlhbnRzJiYoZS5jYWNoZWRfdmFyaWFudHM9ZS52YXJpYW50cy5tYXAoKGZ1bmN0aW9uKG4pe3JldHVybiByKGUse3ZhcmlhbnRzOm51bGx9LG4pfSkpKSxlLmNhY2hlZF92YXJpYW50cz9lLmNhY2hlZF92YXJpYW50czpmdW5jdGlvbiBlKG4pe3JldHVybiAhIW4mJihuLmVuZHNXaXRoUGFyZW50fHxlKG4uc3RhcnRzKSl9KGUpP3IoZSx7c3RhcnRzOmUuc3RhcnRzP3IoZS5zdGFydHMpOm51bGx9KTpPYmplY3QuaXNGcm96ZW4oZSk/cihlKTplfSgic2VsZiI9PT1lP3M6ZSl9KSkpLHMuY29udGFpbnMuZm9yRWFjaCgoZnVuY3Rpb24oZSl7dChlLGwpO30pKSxzLnN0YXJ0cyYmdChzLnN0YXJ0cyxvKSxsLm1hdGNoZXI9ZnVuY3Rpb24oZSl7Y29uc3Qgbj1uZXcgYTtyZXR1cm4gZS5jb250YWlucy5mb3JFYWNoKGU9Pm4uYWRkUnVsZShlLmJlZ2luLHtydWxlOmUsdHlwZToiYmVnaW4ifSkpLGUudGVybWluYXRvcl9lbmQmJm4uYWRkUnVsZShlLnRlcm1pbmF0b3JfZW5kLHt0eXBlOiJlbmQifSksZS5pbGxlZ2FsJiZuLmFkZFJ1bGUoZS5pbGxlZ2FsLHt0eXBlOiJpbGxlZ2FsIn0pLG59KGwpLGx9KGUpfShFKSxOPSIiLHk9c3x8XyxrPXt9LE89bmV3IGYuX19lbWl0dGVyKGYpOyFmdW5jdGlvbigpe2Zvcih2YXIgZT1bXSxuPXk7biE9PUU7bj1uLnBhcmVudCluLmNsYXNzTmFtZSYmZS51bnNoaWZ0KG4uY2xhc3NOYW1lKTtlLmZvckVhY2goZT0+Ty5vcGVuTm9kZShlKSk7fSgpO3ZhciBBPSIiLEk9MCxTPTAsQj0wLEw9ITE7dHJ5e2Zvcih5Lm1hdGNoZXIuY29uc2lkZXJBbGwoKTs7KXtCKyssTD9MPSExOih5Lm1hdGNoZXIubGFzdEluZGV4PVMseS5tYXRjaGVyLmNvbnNpZGVyQWxsKCkpO2NvbnN0IGU9eS5tYXRjaGVyLmV4ZWMobyk7aWYoIWUpYnJlYWs7Y29uc3Qgbj14KG8uc3Vic3RyaW5nKFMsZS5pbmRleCksZSk7Uz1lLmluZGV4K247fXJldHVybiB4KG8uc3Vic3RyKFMpKSxPLmNsb3NlQWxsTm9kZXMoKSxPLmZpbmFsaXplKCksTj1PLnRvSFRNTCgpLHtyZWxldmFuY2U6SSx2YWx1ZTpOLGxhbmd1YWdlOmUsaWxsZWdhbDohMSxlbWl0dGVyOk8sdG9wOnl9fWNhdGNoKG4pe2lmKG4ubWVzc2FnZSYmbi5tZXNzYWdlLmluY2x1ZGVzKCJJbGxlZ2FsIikpcmV0dXJuIHtpbGxlZ2FsOiEwLGlsbGVnYWxCeTp7bXNnOm4ubWVzc2FnZSxjb250ZXh0Om8uc2xpY2UoUy0xMDAsUysxMDApLG1vZGU6bi5tb2RlfSxzb2ZhcjpOLHJlbGV2YW5jZTowLHZhbHVlOlIobyksZW1pdHRlcjpPfTtpZihsKXJldHVybiB7aWxsZWdhbDohMSxyZWxldmFuY2U6MCx2YWx1ZTpSKG8pLGVtaXR0ZXI6TyxsYW5ndWFnZTplLHRvcDp5LGVycm9yUmFpc2VkOm59O3Rocm93IG59fWZ1bmN0aW9uIHYoZSxuKXtuPW58fGYubGFuZ3VhZ2VzfHxPYmplY3Qua2V5cyhpKTt2YXIgdD1mdW5jdGlvbihlKXtjb25zdCBuPXtyZWxldmFuY2U6MCxlbWl0dGVyOm5ldyBmLl9fZW1pdHRlcihmKSx2YWx1ZTpSKGUpLGlsbGVnYWw6ITEsdG9wOmh9O3JldHVybiBuLmVtaXR0ZXIuYWRkVGV4dChlKSxufShlKSxyPXQ7cmV0dXJuIG4uZmlsdGVyKFQpLmZpbHRlcihJKS5mb3JFYWNoKChmdW5jdGlvbihuKXt2YXIgYT1tKG4sZSwhMSk7YS5sYW5ndWFnZT1uLGEucmVsZXZhbmNlPnIucmVsZXZhbmNlJiYocj1hKSxhLnJlbGV2YW5jZT50LnJlbGV2YW5jZSYmKHI9dCx0PWEpO30pKSxyLmxhbmd1YWdlJiYodC5zZWNvbmRfYmVzdD1yKSx0fWZ1bmN0aW9uIHgoZSl7cmV0dXJuIGYudGFiUmVwbGFjZXx8Zi51c2VCUj9lLnJlcGxhY2UoYyxlPT4iXG4iPT09ZT9mLnVzZUJSPyI8YnI+IjplOmYudGFiUmVwbGFjZT9lLnJlcGxhY2UoL1x0L2csZi50YWJSZXBsYWNlKTplKTplfWZ1bmN0aW9uIEUoZSl7bGV0IG49bnVsbDtjb25zdCB0PWZ1bmN0aW9uKGUpe3ZhciBuPWUuY2xhc3NOYW1lKyIgIjtuKz1lLnBhcmVudE5vZGU/ZS5wYXJlbnROb2RlLmNsYXNzTmFtZToiIjtjb25zdCB0PWYubGFuZ3VhZ2VEZXRlY3RSZS5leGVjKG4pO2lmKHQpe3ZhciByPVQodFsxXSk7cmV0dXJuIHJ8fChjb25zb2xlLndhcm4oZy5yZXBsYWNlKCJ7fSIsdFsxXSkpLGNvbnNvbGUud2FybigiRmFsbGluZyBiYWNrIHRvIG5vLWhpZ2hsaWdodCBtb2RlIGZvciB0aGlzIGJsb2NrLiIsZSkpLHI/dFsxXToibm8taGlnaGxpZ2h0In1yZXR1cm4gbi5zcGxpdCgvXHMrLykuZmluZChlPT5wKGUpfHxUKGUpKX0oZSk7aWYocCh0KSlyZXR1cm47UygiYmVmb3JlOmhpZ2hsaWdodEJsb2NrIix7YmxvY2s6ZSxsYW5ndWFnZTp0fSksZi51c2VCUj8obj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCJkaXYiKSkuaW5uZXJIVE1MPWUuaW5uZXJIVE1MLnJlcGxhY2UoL1xuL2csIiIpLnJlcGxhY2UoLzxiclsgL10qPi9nLCJcbiIpOm49ZTtjb25zdCByPW4udGV4dENvbnRlbnQsYT10P2IodCxyLCEwKTp2KHIpLGk9ayhuKTtpZihpLmxlbmd0aCl7Y29uc3QgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCJkaXYiKTtlLmlubmVySFRNTD1hLnZhbHVlLGEudmFsdWU9TyhpLGsoZSkscik7fWEudmFsdWU9eChhLnZhbHVlKSxTKCJhZnRlcjpoaWdobGlnaHRCbG9jayIse2Jsb2NrOmUscmVzdWx0OmF9KSxlLmlubmVySFRNTD1hLnZhbHVlLGUuY2xhc3NOYW1lPWZ1bmN0aW9uKGUsbix0KXt2YXIgcj1uP3Nbbl06dCxhPVtlLnRyaW0oKV07cmV0dXJuIGUubWF0Y2goL1xiaGxqc1xiLyl8fGEucHVzaCgiaGxqcyIpLGUuaW5jbHVkZXMocil8fGEucHVzaChyKSxhLmpvaW4oIiAiKS50cmltKCl9KGUuY2xhc3NOYW1lLHQsYS5sYW5ndWFnZSksZS5yZXN1bHQ9e2xhbmd1YWdlOmEubGFuZ3VhZ2UscmU6YS5yZWxldmFuY2UscmVsYXZhbmNlOmEucmVsZXZhbmNlfSxhLnNlY29uZF9iZXN0JiYoZS5zZWNvbmRfYmVzdD17bGFuZ3VhZ2U6YS5zZWNvbmRfYmVzdC5sYW5ndWFnZSxyZTphLnNlY29uZF9iZXN0LnJlbGV2YW5jZSxyZWxhdmFuY2U6YS5zZWNvbmRfYmVzdC5yZWxldmFuY2V9KTt9Y29uc3QgTj0oKT0+e2lmKCFOLmNhbGxlZCl7Ti5jYWxsZWQ9ITA7dmFyIGU9ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgicHJlIGNvZGUiKTthLmZvckVhY2guY2FsbChlLEUpO319O2Z1bmN0aW9uIFQoZSl7cmV0dXJuIGU9KGV8fCIiKS50b0xvd2VyQ2FzZSgpLGlbZV18fGlbc1tlXV19ZnVuY3Rpb24gQShlLHtsYW5ndWFnZU5hbWU6bn0peyJzdHJpbmciPT10eXBlb2YgZSYmKGU9W2VdKSxlLmZvckVhY2goZT0+e3NbZV09bjt9KTt9ZnVuY3Rpb24gSShlKXt2YXIgbj1UKGUpO3JldHVybiBuJiYhbi5kaXNhYmxlQXV0b2RldGVjdH1mdW5jdGlvbiBTKGUsbil7dmFyIHQ9ZTtvLmZvckVhY2goKGZ1bmN0aW9uKGUpe2VbdF0mJmVbdF0obik7fSkpO31PYmplY3QuYXNzaWduKHQse2hpZ2hsaWdodDpiLGhpZ2hsaWdodEF1dG86dixmaXhNYXJrdXA6eCxoaWdobGlnaHRCbG9jazpFLGNvbmZpZ3VyZTpmdW5jdGlvbihlKXtmPXkoZixlKTt9LGluaXRIaWdobGlnaHRpbmc6Tixpbml0SGlnaGxpZ2h0aW5nT25Mb2FkOmZ1bmN0aW9uKCl7d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoIkRPTUNvbnRlbnRMb2FkZWQiLE4sITEpO30scmVnaXN0ZXJMYW5ndWFnZTpmdW5jdGlvbihlLG4pe3ZhciByPW51bGw7dHJ5e3I9bih0KTt9Y2F0Y2gobil7aWYoY29uc29sZS5lcnJvcigiTGFuZ3VhZ2UgZGVmaW5pdGlvbiBmb3IgJ3t9JyBjb3VsZCBub3QgYmUgcmVnaXN0ZXJlZC4iLnJlcGxhY2UoInt9IixlKSksIWwpdGhyb3cgbjtjb25zb2xlLmVycm9yKG4pLHI9aDt9ci5uYW1lfHwoci5uYW1lPWUpLGlbZV09cixyLnJhd0RlZmluaXRpb249bi5iaW5kKG51bGwsdCksci5hbGlhc2VzJiZBKHIuYWxpYXNlcyx7bGFuZ3VhZ2VOYW1lOmV9KTt9LGxpc3RMYW5ndWFnZXM6ZnVuY3Rpb24oKXtyZXR1cm4gT2JqZWN0LmtleXMoaSl9LGdldExhbmd1YWdlOlQscmVnaXN0ZXJBbGlhc2VzOkEscmVxdWlyZUxhbmd1YWdlOmZ1bmN0aW9uKGUpe3ZhciBuPVQoZSk7aWYobilyZXR1cm4gbjt0aHJvdyBFcnJvcigiVGhlICd7fScgbGFuZ3VhZ2UgaXMgcmVxdWlyZWQsIGJ1dCBub3QgbG9hZGVkLiIucmVwbGFjZSgie30iLGUpKX0sYXV0b0RldGVjdGlvbjpJLGluaGVyaXQ6eSxhZGRQbHVnaW46ZnVuY3Rpb24oZSl7by5wdXNoKGUpO319KSx0LmRlYnVnTW9kZT1mdW5jdGlvbigpe2w9ITE7fSx0LnNhZmVNb2RlPWZ1bmN0aW9uKCl7bD0hMDt9LHQudmVyc2lvblN0cmluZz0iMTAuMS4wIjtmb3IoY29uc3QgbiBpbiBfKSJvYmplY3QiPT10eXBlb2YgX1tuXSYmZShfW25dKTtyZXR1cm4gT2JqZWN0LmFzc2lnbih0LF8pLHR9KHt9KX0oKTsib2JqZWN0Ij09dHlwZW9mIGV4cG9ydHMmJiJ1bmRlZmluZWQiIT10eXBlb2YgbW9kdWxlJiYobW9kdWxlLmV4cG9ydHM9aGxqcyk7CglobGpzLnJlZ2lzdGVyTGFuZ3VhZ2UoImNzcyIsZnVuY3Rpb24oKXtyZXR1cm4gZnVuY3Rpb24oZSl7dmFyIG49e2JlZ2luOi8oPzpbQS1aXF9cLlwtXSt8LS1bYS16QS1aMC05Xy1dKylccyo6LyxyZXR1cm5CZWdpbjohMCxlbmQ6IjsiLGVuZHNXaXRoUGFyZW50OiEwLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJhdHRyaWJ1dGUiLGJlZ2luOi9cUy8sZW5kOiI6IixleGNsdWRlRW5kOiEwLHN0YXJ0czp7ZW5kc1dpdGhQYXJlbnQ6ITAsZXhjbHVkZUVuZDohMCxjb250YWluczpbe2JlZ2luOi9bXHctXStcKC8scmV0dXJuQmVnaW46ITAsY29udGFpbnM6W3tjbGFzc05hbWU6ImJ1aWx0X2luIixiZWdpbjovW1x3LV0rL30se2JlZ2luOi9cKC8sZW5kOi9cKS8sY29udGFpbnM6W2UuQVBPU19TVFJJTkdfTU9ERSxlLlFVT1RFX1NUUklOR19NT0RFLGUuQ1NTX05VTUJFUl9NT0RFXX1dfSxlLkNTU19OVU1CRVJfTU9ERSxlLlFVT1RFX1NUUklOR19NT0RFLGUuQVBPU19TVFJJTkdfTU9ERSxlLkNfQkxPQ0tfQ09NTUVOVF9NT0RFLHtjbGFzc05hbWU6Im51bWJlciIsYmVnaW46IiNbMC05QS1GYS1mXSsifSx7Y2xhc3NOYW1lOiJtZXRhIixiZWdpbjoiIWltcG9ydGFudCJ9XX19XX07cmV0dXJuIHtuYW1lOiJDU1MiLGNhc2VfaW5zZW5zaXRpdmU6ITAsaWxsZWdhbDovWz1cL3wnXCRdLyxjb250YWluczpbZS5DX0JMT0NLX0NPTU1FTlRfTU9ERSx7Y2xhc3NOYW1lOiJzZWxlY3Rvci1pZCIsYmVnaW46LyNbQS1aYS16MC05Xy1dKy99LHtjbGFzc05hbWU6InNlbGVjdG9yLWNsYXNzIixiZWdpbjovXC5bQS1aYS16MC05Xy1dKy99LHtjbGFzc05hbWU6InNlbGVjdG9yLWF0dHIiLGJlZ2luOi9cWy8sZW5kOi9cXS8saWxsZWdhbDoiJCIsY29udGFpbnM6W2UuQVBPU19TVFJJTkdfTU9ERSxlLlFVT1RFX1NUUklOR19NT0RFXX0se2NsYXNzTmFtZToic2VsZWN0b3ItcHNldWRvIixiZWdpbjovOig6KT9bYS16QS1aMC05XF9cLVwrXChcKSInLl0rL30se2JlZ2luOiJAKHBhZ2V8Zm9udC1mYWNlKSIsbGV4ZW1lczoiQFthLXotXSsiLGtleXdvcmRzOiJAcGFnZSBAZm9udC1mYWNlIn0se2JlZ2luOiJAIixlbmQ6Ilt7O10iLGlsbGVnYWw6LzovLHJldHVybkJlZ2luOiEwLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJrZXl3b3JkIixiZWdpbjovQFwtP1x3W1x3XSooXC1cdyspKi99LHtiZWdpbjovXHMvLGVuZHNXaXRoUGFyZW50OiEwLGV4Y2x1ZGVFbmQ6ITAscmVsZXZhbmNlOjAsa2V5d29yZHM6ImFuZCBvciBub3Qgb25seSIsY29udGFpbnM6W3tiZWdpbjovW2Etei1dKzovLGNsYXNzTmFtZToiYXR0cmlidXRlIn0sZS5BUE9TX1NUUklOR19NT0RFLGUuUVVPVEVfU1RSSU5HX01PREUsZS5DU1NfTlVNQkVSX01PREVdfV19LHtjbGFzc05hbWU6InNlbGVjdG9yLXRhZyIsYmVnaW46IlthLXpBLVotXVthLXpBLVowLTlfLV0qIixyZWxldmFuY2U6MH0se2JlZ2luOiJ7IixlbmQ6In0iLGlsbGVnYWw6L1xTLyxjb250YWluczpbZS5DX0JMT0NLX0NPTU1FTlRfTU9ERSxuXX1dfX19KCkpOwoJaGxqcy5yZWdpc3Rlckxhbmd1YWdlKCJkaWZmIixmdW5jdGlvbigpe3JldHVybiBmdW5jdGlvbihlKXtyZXR1cm4ge25hbWU6IkRpZmYiLGFsaWFzZXM6WyJwYXRjaCJdLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJtZXRhIixyZWxldmFuY2U6MTAsdmFyaWFudHM6W3tiZWdpbjovXkBAICtcLVxkKyxcZCsgK1wrXGQrLFxkKyArQEAkL30se2JlZ2luOi9eXCpcKlwqICtcZCssXGQrICtcKlwqXCpcKiQvfSx7YmVnaW46L15cLVwtXC0gK1xkKyxcZCsgK1wtXC1cLVwtJC99XX0se2NsYXNzTmFtZToiY29tbWVudCIsdmFyaWFudHM6W3tiZWdpbjovSW5kZXg6IC8sZW5kOi8kL30se2JlZ2luOi89ezMsfS8sZW5kOi8kL30se2JlZ2luOi9eXC17M30vLGVuZDovJC99LHtiZWdpbjovXlwqezN9IC8sZW5kOi8kL30se2JlZ2luOi9eXCt7M30vLGVuZDovJC99LHtiZWdpbjovXlwqezE1fSQvfV19LHtjbGFzc05hbWU6ImFkZGl0aW9uIixiZWdpbjoiXlxcKyIsZW5kOiIkIn0se2NsYXNzTmFtZToiZGVsZXRpb24iLGJlZ2luOiJeXFwtIixlbmQ6IiQifSx7Y2xhc3NOYW1lOiJhZGRpdGlvbiIsYmVnaW46Il5cXCEiLGVuZDoiJCJ9XX19fSgpKTsKCWhsanMucmVnaXN0ZXJMYW5ndWFnZSgiamF2YXNjcmlwdCIsZnVuY3Rpb24oKXtjb25zdCBlPVsiYXMiLCJpbiIsIm9mIiwiaWYiLCJmb3IiLCJ3aGlsZSIsImZpbmFsbHkiLCJ2YXIiLCJuZXciLCJmdW5jdGlvbiIsImRvIiwicmV0dXJuIiwidm9pZCIsImVsc2UiLCJicmVhayIsImNhdGNoIiwiaW5zdGFuY2VvZiIsIndpdGgiLCJ0aHJvdyIsImNhc2UiLCJkZWZhdWx0IiwidHJ5Iiwic3dpdGNoIiwiY29udGludWUiLCJ0eXBlb2YiLCJkZWxldGUiLCJsZXQiLCJ5aWVsZCIsImNvbnN0IiwiY2xhc3MiLCJkZWJ1Z2dlciIsImFzeW5jIiwiYXdhaXQiLCJzdGF0aWMiLCJpbXBvcnQiLCJmcm9tIiwiZXhwb3J0IiwiZXh0ZW5kcyJdLG49WyJ0cnVlIiwiZmFsc2UiLCJudWxsIiwidW5kZWZpbmVkIiwiTmFOIiwiSW5maW5pdHkiXSxhPVtdLmNvbmNhdChbInNldEludGVydmFsIiwic2V0VGltZW91dCIsImNsZWFySW50ZXJ2YWwiLCJjbGVhclRpbWVvdXQiLCJyZXF1aXJlIiwiZXhwb3J0cyIsImV2YWwiLCJpc0Zpbml0ZSIsImlzTmFOIiwicGFyc2VGbG9hdCIsInBhcnNlSW50IiwiZGVjb2RlVVJJIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiZW5jb2RlVVJJIiwiZW5jb2RlVVJJQ29tcG9uZW50IiwiZXNjYXBlIiwidW5lc2NhcGUiXSxbImFyZ3VtZW50cyIsInRoaXMiLCJzdXBlciIsImNvbnNvbGUiLCJ3aW5kb3ciLCJkb2N1bWVudCIsImxvY2FsU3RvcmFnZSIsIm1vZHVsZSIsImdsb2JhbCJdLFsiSW50bCIsIkRhdGFWaWV3IiwiTnVtYmVyIiwiTWF0aCIsIkRhdGUiLCJTdHJpbmciLCJSZWdFeHAiLCJPYmplY3QiLCJGdW5jdGlvbiIsIkJvb2xlYW4iLCJFcnJvciIsIlN5bWJvbCIsIlNldCIsIk1hcCIsIldlYWtTZXQiLCJXZWFrTWFwIiwiUHJveHkiLCJSZWZsZWN0IiwiSlNPTiIsIlByb21pc2UiLCJGbG9hdDY0QXJyYXkiLCJJbnQxNkFycmF5IiwiSW50MzJBcnJheSIsIkludDhBcnJheSIsIlVpbnQxNkFycmF5IiwiVWludDMyQXJyYXkiLCJGbG9hdDMyQXJyYXkiLCJBcnJheSIsIlVpbnQ4QXJyYXkiLCJVaW50OENsYW1wZWRBcnJheSIsIkFycmF5QnVmZmVyIl0sWyJFdmFsRXJyb3IiLCJJbnRlcm5hbEVycm9yIiwiUmFuZ2VFcnJvciIsIlJlZmVyZW5jZUVycm9yIiwiU3ludGF4RXJyb3IiLCJUeXBlRXJyb3IiLCJVUklFcnJvciJdKTtmdW5jdGlvbiBzKGUpe3JldHVybiByKCIoPz0iLGUsIikiKX1mdW5jdGlvbiByKC4uLmUpe3JldHVybiBlLm1hcChlPT4oZnVuY3Rpb24oZSl7cmV0dXJuIGU/InN0cmluZyI9PXR5cGVvZiBlP2U6ZS5zb3VyY2U6bnVsbH0pKGUpKS5qb2luKCIiKX1yZXR1cm4gZnVuY3Rpb24odCl7dmFyIGk9IltBLVphLXokX11bMC05QS1aYS16JF9dKiIsYz17YmVnaW46LzxbQS1aYS16MC05XFwuXzotXSsvLGVuZDovXC9bQS1aYS16MC05XFwuXzotXSs+fFwvPi99LG89eyRwYXR0ZXJuOiJbQS1aYS16JF9dWzAtOUEtWmEteiRfXSoiLGtleXdvcmQ6ZS5qb2luKCIgIiksbGl0ZXJhbDpuLmpvaW4oIiAiKSxidWlsdF9pbjphLmpvaW4oIiAiKX0sbD17Y2xhc3NOYW1lOiJudW1iZXIiLHZhcmlhbnRzOlt7YmVnaW46IlxcYigwW2JCXVswMV0rKW4/In0se2JlZ2luOiJcXGIoMFtvT11bMC03XSspbj8ifSx7YmVnaW46dC5DX05VTUJFUl9SRSsibj8ifV0scmVsZXZhbmNlOjB9LEU9e2NsYXNzTmFtZToic3Vic3QiLGJlZ2luOiJcXCRcXHsiLGVuZDoiXFx9IixrZXl3b3JkczpvLGNvbnRhaW5zOltdfSxkPXtiZWdpbjoiaHRtbGAiLGVuZDoiIixzdGFydHM6e2VuZDoiYCIscmV0dXJuRW5kOiExLGNvbnRhaW5zOlt0LkJBQ0tTTEFTSF9FU0NBUEUsRV0sc3ViTGFuZ3VhZ2U6InhtbCJ9fSxnPXtiZWdpbjoiY3NzYCIsZW5kOiIiLHN0YXJ0czp7ZW5kOiJgIixyZXR1cm5FbmQ6ITEsY29udGFpbnM6W3QuQkFDS1NMQVNIX0VTQ0FQRSxFXSxzdWJMYW5ndWFnZToiY3NzIn19LHU9e2NsYXNzTmFtZToic3RyaW5nIixiZWdpbjoiYCIsZW5kOiJgIixjb250YWluczpbdC5CQUNLU0xBU0hfRVNDQVBFLEVdfTtFLmNvbnRhaW5zPVt0LkFQT1NfU1RSSU5HX01PREUsdC5RVU9URV9TVFJJTkdfTU9ERSxkLGcsdSxsLHQuUkVHRVhQX01PREVdO3ZhciBiPUUuY29udGFpbnMuY29uY2F0KFt7YmVnaW46L1woLyxlbmQ6L1wpLyxjb250YWluczpbInNlbGYiXS5jb25jYXQoRS5jb250YWlucyxbdC5DX0JMT0NLX0NPTU1FTlRfTU9ERSx0LkNfTElORV9DT01NRU5UX01PREVdKX0sdC5DX0JMT0NLX0NPTU1FTlRfTU9ERSx0LkNfTElORV9DT01NRU5UX01PREVdKSxfPXtjbGFzc05hbWU6InBhcmFtcyIsYmVnaW46L1woLyxlbmQ6L1wpLyxleGNsdWRlQmVnaW46ITAsZXhjbHVkZUVuZDohMCxjb250YWluczpifTtyZXR1cm4ge25hbWU6IkphdmFTY3JpcHQiLGFsaWFzZXM6WyJqcyIsImpzeCIsIm1qcyIsImNqcyJdLGtleXdvcmRzOm8sY29udGFpbnM6W3QuU0hFQkFORyh7YmluYXJ5OiJub2RlIixyZWxldmFuY2U6NX0pLHtjbGFzc05hbWU6Im1ldGEiLHJlbGV2YW5jZToxMCxiZWdpbjovXlxzKlsnIl11c2UgKHN0cmljdHxhc20pWyciXS99LHQuQVBPU19TVFJJTkdfTU9ERSx0LlFVT1RFX1NUUklOR19NT0RFLGQsZyx1LHQuQ19MSU5FX0NPTU1FTlRfTU9ERSx0LkNPTU1FTlQoIi9cXCpcXCoiLCJcXCovIix7cmVsZXZhbmNlOjAsY29udGFpbnM6W3tjbGFzc05hbWU6ImRvY3RhZyIsYmVnaW46IkBbQS1aYS16XSsiLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJ0eXBlIixiZWdpbjoiXFx7IixlbmQ6IlxcfSIscmVsZXZhbmNlOjB9LHtjbGFzc05hbWU6InZhcmlhYmxlIixiZWdpbjppKyIoPz1cXHMqKC0pfCQpIixlbmRzUGFyZW50OiEwLHJlbGV2YW5jZTowfSx7YmVnaW46Lyg/PVteXG5dKVxzLyxyZWxldmFuY2U6MH1dfV19KSx0LkNfQkxPQ0tfQ09NTUVOVF9NT0RFLGwse2JlZ2luOnIoL1t7LFxuXVxzKi8scyhyKC8oKChcL1wvLiopfChcL1wqKC58XG4pKlwqXC8pKVxzKikqLyxpKyJcXHMqOiIpKSkscmVsZXZhbmNlOjAsY29udGFpbnM6W3tjbGFzc05hbWU6ImF0dHIiLGJlZ2luOmkrcygiXFxzKjoiKSxyZWxldmFuY2U6MH1dfSx7YmVnaW46IigiK3QuUkVfU1RBUlRFUlNfUkUrInxcXGIoY2FzZXxyZXR1cm58dGhyb3cpXFxiKVxccyoiLGtleXdvcmRzOiJyZXR1cm4gdGhyb3cgY2FzZSIsY29udGFpbnM6W3QuQ19MSU5FX0NPTU1FTlRfTU9ERSx0LkNfQkxPQ0tfQ09NTUVOVF9NT0RFLHQuUkVHRVhQX01PREUse2NsYXNzTmFtZToiZnVuY3Rpb24iLGJlZ2luOiIoXFwoW14oXSooXFwoW14oXSooXFwoW14oXSpcXCkpP1xcKSk/XFwpfCIrdC5VTkRFUlNDT1JFX0lERU5UX1JFKyIpXFxzKj0+IixyZXR1cm5CZWdpbjohMCxlbmQ6Ilxccyo9PiIsY29udGFpbnM6W3tjbGFzc05hbWU6InBhcmFtcyIsdmFyaWFudHM6W3tiZWdpbjp0LlVOREVSU0NPUkVfSURFTlRfUkV9LHtjbGFzc05hbWU6bnVsbCxiZWdpbjovXChccypcKS8sc2tpcDohMH0se2JlZ2luOi9cKC8sZW5kOi9cKS8sZXhjbHVkZUJlZ2luOiEwLGV4Y2x1ZGVFbmQ6ITAsa2V5d29yZHM6byxjb250YWluczpifV19XX0se2JlZ2luOi8sLyxyZWxldmFuY2U6MH0se2NsYXNzTmFtZToiIixiZWdpbjovXHMvLGVuZDovXHMqLyxza2lwOiEwfSx7dmFyaWFudHM6W3tiZWdpbjoiPD4iLGVuZDoiPC8+In0se2JlZ2luOmMuYmVnaW4sZW5kOmMuZW5kfV0sc3ViTGFuZ3VhZ2U6InhtbCIsY29udGFpbnM6W3tiZWdpbjpjLmJlZ2luLGVuZDpjLmVuZCxza2lwOiEwLGNvbnRhaW5zOlsic2VsZiJdfV19XSxyZWxldmFuY2U6MH0se2NsYXNzTmFtZToiZnVuY3Rpb24iLGJlZ2luS2V5d29yZHM6ImZ1bmN0aW9uIixlbmQ6L1x7LyxleGNsdWRlRW5kOiEwLGNvbnRhaW5zOlt0LmluaGVyaXQodC5USVRMRV9NT0RFLHtiZWdpbjppfSksX10saWxsZWdhbDovXFt8JS99LHtiZWdpbjovXCRbKC5dL30sdC5NRVRIT0RfR1VBUkQse2NsYXNzTmFtZToiY2xhc3MiLGJlZ2luS2V5d29yZHM6ImNsYXNzIixlbmQ6L1t7Oz1dLyxleGNsdWRlRW5kOiEwLGlsbGVnYWw6L1s6IlxbXF1dLyxjb250YWluczpbe2JlZ2luS2V5d29yZHM6ImV4dGVuZHMifSx0LlVOREVSU0NPUkVfVElUTEVfTU9ERV19LHtiZWdpbktleXdvcmRzOiJjb25zdHJ1Y3RvciIsZW5kOi9cey8sZXhjbHVkZUVuZDohMH0se2JlZ2luOiIoZ2V0fHNldClcXHMrKD89IitpKyJcXCgpIixlbmQ6L3svLGtleXdvcmRzOiJnZXQgc2V0Iixjb250YWluczpbdC5pbmhlcml0KHQuVElUTEVfTU9ERSx7YmVnaW46aX0pLHtiZWdpbjovXChcKS99LF9dfV0saWxsZWdhbDovIyg/ISEpL319fSgpKTsKCWhsanMucmVnaXN0ZXJMYW5ndWFnZSgianNvbiIsZnVuY3Rpb24oKXtyZXR1cm4gZnVuY3Rpb24obil7dmFyIGU9e2xpdGVyYWw6InRydWUgZmFsc2UgbnVsbCJ9LGk9W24uQ19MSU5FX0NPTU1FTlRfTU9ERSxuLkNfQkxPQ0tfQ09NTUVOVF9NT0RFXSx0PVtuLlFVT1RFX1NUUklOR19NT0RFLG4uQ19OVU1CRVJfTU9ERV0sYT17ZW5kOiIsIixlbmRzV2l0aFBhcmVudDohMCxleGNsdWRlRW5kOiEwLGNvbnRhaW5zOnQsa2V5d29yZHM6ZX0sbD17YmVnaW46InsiLGVuZDoifSIsY29udGFpbnM6W3tjbGFzc05hbWU6ImF0dHIiLGJlZ2luOi8iLyxlbmQ6LyIvLGNvbnRhaW5zOltuLkJBQ0tTTEFTSF9FU0NBUEVdLGlsbGVnYWw6IlxcbiJ9LG4uaW5oZXJpdChhLHtiZWdpbjovOi99KV0uY29uY2F0KGkpLGlsbGVnYWw6IlxcUyJ9LHM9e2JlZ2luOiJcXFsiLGVuZDoiXFxdIixjb250YWluczpbbi5pbmhlcml0KGEpXSxpbGxlZ2FsOiJcXFMifTtyZXR1cm4gdC5wdXNoKGwscyksaS5mb3JFYWNoKChmdW5jdGlvbihuKXt0LnB1c2gobik7fSkpLHtuYW1lOiJKU09OIixjb250YWluczp0LGtleXdvcmRzOmUsaWxsZWdhbDoiXFxTIn19fSgpKTsKCWhsanMucmVnaXN0ZXJMYW5ndWFnZSgieG1sIixmdW5jdGlvbigpe3JldHVybiBmdW5jdGlvbihlKXt2YXIgbj17Y2xhc3NOYW1lOiJzeW1ib2wiLGJlZ2luOiImW2Etel0rO3wmI1swLTldKzt8JiN4W2EtZjAtOV0rOyJ9LGE9e2JlZ2luOiJcXHMiLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJtZXRhLWtleXdvcmQiLGJlZ2luOiIjP1thLXpfXVthLXoxLTlfLV0rIixpbGxlZ2FsOiJcXG4ifV19LHM9ZS5pbmhlcml0KGEse2JlZ2luOiJcXCgiLGVuZDoiXFwpIn0pLHQ9ZS5pbmhlcml0KGUuQVBPU19TVFJJTkdfTU9ERSx7Y2xhc3NOYW1lOiJtZXRhLXN0cmluZyJ9KSxpPWUuaW5oZXJpdChlLlFVT1RFX1NUUklOR19NT0RFLHtjbGFzc05hbWU6Im1ldGEtc3RyaW5nIn0pLGM9e2VuZHNXaXRoUGFyZW50OiEwLGlsbGVnYWw6LzwvLHJlbGV2YW5jZTowLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJhdHRyIixiZWdpbjoiW0EtWmEtejAtOVxcLl86LV0rIixyZWxldmFuY2U6MH0se2JlZ2luOi89XHMqLyxyZWxldmFuY2U6MCxjb250YWluczpbe2NsYXNzTmFtZToic3RyaW5nIixlbmRzUGFyZW50OiEwLHZhcmlhbnRzOlt7YmVnaW46LyIvLGVuZDovIi8sY29udGFpbnM6W25dfSx7YmVnaW46LycvLGVuZDovJy8sY29udGFpbnM6W25dfSx7YmVnaW46L1teXHMiJz08PmBdKy99XX1dfV19O3JldHVybiB7bmFtZToiSFRNTCwgWE1MIixhbGlhc2VzOlsiaHRtbCIsInhodG1sIiwicnNzIiwiYXRvbSIsInhqYiIsInhzZCIsInhzbCIsInBsaXN0Iiwid3NmIiwic3ZnIl0sY2FzZV9pbnNlbnNpdGl2ZTohMCxjb250YWluczpbe2NsYXNzTmFtZToibWV0YSIsYmVnaW46IjwhW2Etel0iLGVuZDoiPiIscmVsZXZhbmNlOjEwLGNvbnRhaW5zOlthLGksdCxzLHtiZWdpbjoiXFxbIixlbmQ6IlxcXSIsY29udGFpbnM6W3tjbGFzc05hbWU6Im1ldGEiLGJlZ2luOiI8IVthLXpdIixlbmQ6Ij4iLGNvbnRhaW5zOlthLHMsaSx0XX1dfV19LGUuQ09NTUVOVCgiXHgzYyEtLSIsIi0tXHgzZSIse3JlbGV2YW5jZToxMH0pLHtiZWdpbjoiPFxcIVxcW0NEQVRBXFxbIixlbmQ6IlxcXVxcXT4iLHJlbGV2YW5jZToxMH0sbix7Y2xhc3NOYW1lOiJtZXRhIixiZWdpbjovPFw/eG1sLyxlbmQ6L1w/Pi8scmVsZXZhbmNlOjEwfSx7Y2xhc3NOYW1lOiJ0YWciLGJlZ2luOiI8c3R5bGUoPz1cXHN8PikiLGVuZDoiPiIsa2V5d29yZHM6e25hbWU6InN0eWxlIn0sY29udGFpbnM6W2NdLHN0YXJ0czp7ZW5kOiI8L3N0eWxlPiIscmV0dXJuRW5kOiEwLHN1Ykxhbmd1YWdlOlsiY3NzIiwieG1sIl19fSx7Y2xhc3NOYW1lOiJ0YWciLGJlZ2luOiI8c2NyaXB0KD89XFxzfD4pIixlbmQ6Ij4iLGtleXdvcmRzOntuYW1lOiJzY3JpcHQifSxjb250YWluczpbY10sc3RhcnRzOntlbmQ6IjxcL3NjcmlwdD4iLHJldHVybkVuZDohMCxzdWJMYW5ndWFnZTpbImphdmFzY3JpcHQiLCJoYW5kbGViYXJzIiwieG1sIl19fSx7Y2xhc3NOYW1lOiJ0YWciLGJlZ2luOiI8Lz8iLGVuZDoiLz8+Iixjb250YWluczpbe2NsYXNzTmFtZToibmFtZSIsYmVnaW46L1teXC8+PFxzXSsvLHJlbGV2YW5jZTowfSxjXX1dfX19KCkpOwoJaGxqcy5yZWdpc3Rlckxhbmd1YWdlKCJtYXJrZG93biIsZnVuY3Rpb24oKXtyZXR1cm4gZnVuY3Rpb24obil7Y29uc3QgZT17YmVnaW46IjwiLGVuZDoiPiIsc3ViTGFuZ3VhZ2U6InhtbCIscmVsZXZhbmNlOjB9LGE9e2JlZ2luOiJcXFsuKz9cXF1bXFwoXFxbXS4qP1tcXClcXF1dIixyZXR1cm5CZWdpbjohMCxjb250YWluczpbe2NsYXNzTmFtZToic3RyaW5nIixiZWdpbjoiXFxbIixlbmQ6IlxcXSIsZXhjbHVkZUJlZ2luOiEwLHJldHVybkVuZDohMCxyZWxldmFuY2U6MH0se2NsYXNzTmFtZToibGluayIsYmVnaW46IlxcXVxcKCIsZW5kOiJcXCkiLGV4Y2x1ZGVCZWdpbjohMCxleGNsdWRlRW5kOiEwfSx7Y2xhc3NOYW1lOiJzeW1ib2wiLGJlZ2luOiJcXF1cXFsiLGVuZDoiXFxdIixleGNsdWRlQmVnaW46ITAsZXhjbHVkZUVuZDohMH1dLHJlbGV2YW5jZToxMH0saT17Y2xhc3NOYW1lOiJzdHJvbmciLGNvbnRhaW5zOltdLHZhcmlhbnRzOlt7YmVnaW46L197Mn0vLGVuZDovX3syfS99LHtiZWdpbjovXCp7Mn0vLGVuZDovXCp7Mn0vfV19LHM9e2NsYXNzTmFtZToiZW1waGFzaXMiLGNvbnRhaW5zOltdLHZhcmlhbnRzOlt7YmVnaW46L1wqKD8hXCopLyxlbmQ6L1wqL30se2JlZ2luOi9fKD8hXykvLGVuZDovXy8scmVsZXZhbmNlOjB9XX07aS5jb250YWlucy5wdXNoKHMpLHMuY29udGFpbnMucHVzaChpKTt2YXIgYz1bZSxhXTtyZXR1cm4gaS5jb250YWlucz1pLmNvbnRhaW5zLmNvbmNhdChjKSxzLmNvbnRhaW5zPXMuY29udGFpbnMuY29uY2F0KGMpLHtuYW1lOiJNYXJrZG93biIsYWxpYXNlczpbIm1kIiwibWtkb3duIiwibWtkIl0sY29udGFpbnM6W3tjbGFzc05hbWU6InNlY3Rpb24iLHZhcmlhbnRzOlt7YmVnaW46Il4jezEsNn0iLGVuZDoiJCIsY29udGFpbnM6Yz1jLmNvbmNhdChpLHMpfSx7YmVnaW46Iig/PV4uKz9cXG5bPS1dezIsfSQpIixjb250YWluczpbe2JlZ2luOiJeWz0tXSokIn0se2JlZ2luOiJeIixlbmQ6IlxcbiIsY29udGFpbnM6Y31dfV19LGUse2NsYXNzTmFtZToiYnVsbGV0IixiZWdpbjoiXlsgXHRdKihbKistXXwoXFxkK1xcLikpKD89XFxzKykiLGVuZDoiXFxzKyIsZXhjbHVkZUVuZDohMH0saSxzLHtjbGFzc05hbWU6InF1b3RlIixiZWdpbjoiXj5cXHMrIixjb250YWluczpjLGVuZDoiJCJ9LHtjbGFzc05hbWU6ImNvZGUiLHZhcmlhbnRzOlt7YmVnaW46IihgezMsfSkoLnxcXG4pKj9cXDFgKlsgXSoifSx7YmVnaW46Iih+ezMsfSkoLnxcXG4pKj9cXDF+KlsgXSoifSx7YmVnaW46ImBgYCIsZW5kOiJgYGArWyBdKiQifSx7YmVnaW46In5+fiIsZW5kOiJ+fn4rWyBdKiQifSx7YmVnaW46ImAuKz9gIn0se2JlZ2luOiIoPz1eKCB7NH18XFx0KSkiLGNvbnRhaW5zOlt7YmVnaW46Il4oIHs0fXxcXHQpIixlbmQ6IihcXG4pJCJ9XSxyZWxldmFuY2U6MH1dfSx7YmVnaW46Il5bLVxcKl17Myx9IixlbmQ6IiQifSxhLHtiZWdpbjovXlxbW15cbl0rXF06LyxyZXR1cm5CZWdpbjohMCxjb250YWluczpbe2NsYXNzTmFtZToic3ltYm9sIixiZWdpbjovXFsvLGVuZDovXF0vLGV4Y2x1ZGVCZWdpbjohMCxleGNsdWRlRW5kOiEwfSx7Y2xhc3NOYW1lOiJsaW5rIixiZWdpbjovOlxzKi8sZW5kOi8kLyxleGNsdWRlQmVnaW46ITB9XX1dfX19KCkpOwoJaGxqcy5yZWdpc3Rlckxhbmd1YWdlKCJweXRob24iLGZ1bmN0aW9uKCl7cmV0dXJuIGZ1bmN0aW9uKGUpe3ZhciBuPXtrZXl3b3JkOiJhbmQgZWxpZiBpcyBnbG9iYWwgYXMgaW4gaWYgZnJvbSByYWlzZSBmb3IgZXhjZXB0IGZpbmFsbHkgcHJpbnQgaW1wb3J0IHBhc3MgcmV0dXJuIGV4ZWMgZWxzZSBicmVhayBub3Qgd2l0aCBjbGFzcyBhc3NlcnQgeWllbGQgdHJ5IHdoaWxlIGNvbnRpbnVlIGRlbCBvciBkZWYgbGFtYmRhIGFzeW5jIGF3YWl0IG5vbmxvY2FsfDEwIixidWlsdF9pbjoiRWxsaXBzaXMgTm90SW1wbGVtZW50ZWQiLGxpdGVyYWw6IkZhbHNlIE5vbmUgVHJ1ZSJ9LGE9e2NsYXNzTmFtZToibWV0YSIsYmVnaW46L14oPj4+fFwuXC5cLikgL30saT17Y2xhc3NOYW1lOiJzdWJzdCIsYmVnaW46L1x7LyxlbmQ6L1x9LyxrZXl3b3JkczpuLGlsbGVnYWw6LyMvfSxzPXtiZWdpbjovXHtcey8scmVsZXZhbmNlOjB9LHI9e2NsYXNzTmFtZToic3RyaW5nIixjb250YWluczpbZS5CQUNLU0xBU0hfRVNDQVBFXSx2YXJpYW50czpbe2JlZ2luOi8odXxiKT9yPycnJy8sZW5kOi8nJycvLGNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEUsYV0scmVsZXZhbmNlOjEwfSx7YmVnaW46Lyh1fGIpP3I/IiIiLyxlbmQ6LyIiIi8sY29udGFpbnM6W2UuQkFDS1NMQVNIX0VTQ0FQRSxhXSxyZWxldmFuY2U6MTB9LHtiZWdpbjovKGZyfHJmfGYpJycnLyxlbmQ6LycnJy8sY29udGFpbnM6W2UuQkFDS1NMQVNIX0VTQ0FQRSxhLHMsaV19LHtiZWdpbjovKGZyfHJmfGYpIiIiLyxlbmQ6LyIiIi8sY29udGFpbnM6W2UuQkFDS1NMQVNIX0VTQ0FQRSxhLHMsaV19LHtiZWdpbjovKHV8cnx1ciknLyxlbmQ6LycvLHJlbGV2YW5jZToxMH0se2JlZ2luOi8odXxyfHVyKSIvLGVuZDovIi8scmVsZXZhbmNlOjEwfSx7YmVnaW46LyhifGJyKScvLGVuZDovJy99LHtiZWdpbjovKGJ8YnIpIi8sZW5kOi8iL30se2JlZ2luOi8oZnJ8cmZ8ZiknLyxlbmQ6LycvLGNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEUscyxpXX0se2JlZ2luOi8oZnJ8cmZ8ZikiLyxlbmQ6LyIvLGNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEUscyxpXX0sZS5BUE9TX1NUUklOR19NT0RFLGUuUVVPVEVfU1RSSU5HX01PREVdfSxsPXtjbGFzc05hbWU6Im51bWJlciIscmVsZXZhbmNlOjAsdmFyaWFudHM6W3tiZWdpbjplLkJJTkFSWV9OVU1CRVJfUkUrIltsTGpKXT8ifSx7YmVnaW46IlxcYigwb1swLTddKylbbExqSl0/In0se2JlZ2luOmUuQ19OVU1CRVJfUkUrIltsTGpKXT8ifV19LHQ9e2NsYXNzTmFtZToicGFyYW1zIix2YXJpYW50czpbe2JlZ2luOi9cKFxzKlwpLyxza2lwOiEwLGNsYXNzTmFtZTpudWxsfSx7YmVnaW46L1woLyxlbmQ6L1wpLyxleGNsdWRlQmVnaW46ITAsZXhjbHVkZUVuZDohMCxjb250YWluczpbInNlbGYiLGEsbCxyLGUuSEFTSF9DT01NRU5UX01PREVdfV19O3JldHVybiBpLmNvbnRhaW5zPVtyLGwsYV0se25hbWU6IlB5dGhvbiIsYWxpYXNlczpbInB5IiwiZ3lwIiwiaXB5dGhvbiJdLGtleXdvcmRzOm4saWxsZWdhbDovKDxcL3wtPnxcPyl8PT4vLGNvbnRhaW5zOlthLGwse2JlZ2luS2V5d29yZHM6ImlmIixyZWxldmFuY2U6MH0scixlLkhBU0hfQ09NTUVOVF9NT0RFLHt2YXJpYW50czpbe2NsYXNzTmFtZToiZnVuY3Rpb24iLGJlZ2luS2V5d29yZHM6ImRlZiJ9LHtjbGFzc05hbWU6ImNsYXNzIixiZWdpbktleXdvcmRzOiJjbGFzcyJ9XSxlbmQ6LzovLGlsbGVnYWw6L1skez07XG4sXS8sY29udGFpbnM6W2UuVU5ERVJTQ09SRV9USVRMRV9NT0RFLHQse2JlZ2luOi8tPi8sZW5kc1dpdGhQYXJlbnQ6ITAsa2V5d29yZHM6Ik5vbmUifV19LHtjbGFzc05hbWU6Im1ldGEiLGJlZ2luOi9eW1x0IF0qQC8sZW5kOi8kL30se2JlZ2luOi9cYihwcmludHxleGVjKVwoL31dfX19KCkpOwoJaGxqcy5yZWdpc3Rlckxhbmd1YWdlKCJ5YW1sIixmdW5jdGlvbigpe3JldHVybiBmdW5jdGlvbihlKXt2YXIgbj0idHJ1ZSBmYWxzZSB5ZXMgbm8gbnVsbCIsYT0iW1xcdyM7Lz86QCY9KyQsLn4qXFwnKClbXFxdXSsiLHM9e2NsYXNzTmFtZToic3RyaW5nIixyZWxldmFuY2U6MCx2YXJpYW50czpbe2JlZ2luOi8nLyxlbmQ6LycvfSx7YmVnaW46LyIvLGVuZDovIi99LHtiZWdpbjovXFMrL31dLGNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEUse2NsYXNzTmFtZToidGVtcGxhdGUtdmFyaWFibGUiLHZhcmlhbnRzOlt7YmVnaW46Int7IixlbmQ6In19In0se2JlZ2luOiIleyIsZW5kOiJ9In1dfV19LGk9ZS5pbmhlcml0KHMse3ZhcmlhbnRzOlt7YmVnaW46LycvLGVuZDovJy99LHtiZWdpbjovIi8sZW5kOi8iL30se2JlZ2luOi9bXlxzLHt9W1xdXSsvfV19KSxsPXtlbmQ6IiwiLGVuZHNXaXRoUGFyZW50OiEwLGV4Y2x1ZGVFbmQ6ITAsY29udGFpbnM6W10sa2V5d29yZHM6bixyZWxldmFuY2U6MH0sdD17YmVnaW46InsiLGVuZDoifSIsY29udGFpbnM6W2xdLGlsbGVnYWw6IlxcbiIscmVsZXZhbmNlOjB9LGc9e2JlZ2luOiJcXFsiLGVuZDoiXFxdIixjb250YWluczpbbF0saWxsZWdhbDoiXFxuIixyZWxldmFuY2U6MH0sYj1be2NsYXNzTmFtZToiYXR0ciIsdmFyaWFudHM6W3tiZWdpbjoiXFx3W1xcdyA6XFwvLi1dKjooPz1bIFx0XXwkKSJ9LHtiZWdpbjonIlxcd1tcXHcgOlxcLy4tXSoiOig/PVsgXHRdfCQpJ30se2JlZ2luOiInXFx3W1xcdyA6XFwvLi1dKic6KD89WyBcdF18JCkifV19LHtjbGFzc05hbWU6Im1ldGEiLGJlZ2luOiJeLS0tcyokIixyZWxldmFuY2U6MTB9LHtjbGFzc05hbWU6InN0cmluZyIsYmVnaW46IltcXHw+XShbMC05XT9bKy1dKT9bIF0qXFxuKCAqKVtcXFMgXStcXG4oXFwyW1xcUyBdK1xcbj8pKiJ9LHtiZWdpbjoiPCVbJT0tXT8iLGVuZDoiWyUtXT8lPiIsc3ViTGFuZ3VhZ2U6InJ1YnkiLGV4Y2x1ZGVCZWdpbjohMCxleGNsdWRlRW5kOiEwLHJlbGV2YW5jZTowfSx7Y2xhc3NOYW1lOiJ0eXBlIixiZWdpbjoiIVxcdyshIithfSx7Y2xhc3NOYW1lOiJ0eXBlIixiZWdpbjoiITwiK2ErIj4ifSx7Y2xhc3NOYW1lOiJ0eXBlIixiZWdpbjoiISIrYX0se2NsYXNzTmFtZToidHlwZSIsYmVnaW46IiEhIithfSx7Y2xhc3NOYW1lOiJtZXRhIixiZWdpbjoiJiIrZS5VTkRFUlNDT1JFX0lERU5UX1JFKyIkIn0se2NsYXNzTmFtZToibWV0YSIsYmVnaW46IlxcKiIrZS5VTkRFUlNDT1JFX0lERU5UX1JFKyIkIn0se2NsYXNzTmFtZToiYnVsbGV0IixiZWdpbjoiXFwtKD89WyBdfCQpIixyZWxldmFuY2U6MH0sZS5IQVNIX0NPTU1FTlRfTU9ERSx7YmVnaW5LZXl3b3JkczpuLGtleXdvcmRzOntsaXRlcmFsOm59fSx7Y2xhc3NOYW1lOiJudW1iZXIiLGJlZ2luOiJcXGJbMC05XXs0fSgtWzAtOV1bMC05XSl7MCwyfShbVHQgXFx0XVswLTldWzAtOV0/KDpbMC05XVswLTldKXsyfSk/KFxcLlswLTldKik/KFsgXFx0XSkqKFp8Wy0rXVswLTldWzAtOV0/KDpbMC05XVswLTldKT8pP1xcYiJ9LHtjbGFzc05hbWU6Im51bWJlciIsYmVnaW46ZS5DX05VTUJFUl9SRSsiXFxiIn0sdCxnLHNdLGM9Wy4uLmJdO3JldHVybiBjLnBvcCgpLGMucHVzaChpKSxsLmNvbnRhaW5zPWMse25hbWU6IllBTUwiLGNhc2VfaW5zZW5zaXRpdmU6ITAsYWxpYXNlczpbInltbCIsIllBTUwiXSxjb250YWluczpifX19KCkpOwoKfSgpKTsKCg==', null, false);
/* eslint-enable */

class Code extends BasicElement {
    constructor(content) {
        super(content);
        this.setContent(content || this.innerHTML);
    }
    preprocess(content) {
        return content;
    }
    setContent(content) {
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
    constructor(element = null) {
        super('<section></section>');
        this.hide = this.hide.bind(this);
        this.hide();
        for (let event of ["click", "contextmenu"]) {
            this.addEventListener(event, this.hide);
            this.firstElementChild.addEventListener(event, (event) => { event.stopPropagation(); });
        }
        if (element) {
            this.for(element);
        }
    }
    /**
     * Add the context menu to show on the provided element context events
     *
     * @param {HTMLElement} element
     */
    for(element) {
        let listener = (event) => {
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
    renderMenu(element, x, y) {
        this.target = element;
        // work out where to place the menu
        let w = window.innerWidth;
        let h = window.innerHeight;
        let right = x < w * 0.75;
        let down = y < h * 0.5;
        // show the menu
        this.style.left = right ? (x + "px") : null;
        this.style.right = right ? null : ((w - x) + "px");
        this.style.top = down ? (y + "px") : null;
        this.style.bottom = down ? null : ((h - y) + "px");
        let hasItem = false;
        for (let item of this.items) {
            item.element.hidden = item.hide && item.hide(element);
            hasItem = hasItem || !item.element.hidden;
        }
        if (hasItem)
            this.show();
    }
    detach(element) {
        let listener = this.#attachments.get(element);
        if (listener) {
            element.removeAttribute("context-menu");
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
    addItem(text, action, hide) {
        let item = htmlToElement(`<div>${text}</div>`);
        this.items.push({
            element: item,
            hide: hide
        });
        item.addEventListener('click', () => { action(this.target); this.hide(); });
        this.firstElementChild.appendChild(item);
        return this;
    }
    /**
     * Add a line break to the context menu
     */
    addBreak() {
        this.firstElementChild.appendChild(htmlToElement(`<hr/>`));
        return this;
    }
    clearMenuItems() {
        this.items = [];
        this.firstElementChild.innerHTML = "";
    }
}
customElements.define('ui-context', ContextMenu);

class Grid extends BasicElement {
    #columns = 0;
    #rows = 0;
    constructor(options) {
        super();
        this.setAttribute('ui-grid', '');
        if (options?.padding !== undefined) {
            this.setCss('--padding', options?.padding);
        }
        if (options?.rowGap !== undefined) {
            this.setCss('row-gap', options?.rowGap);
        }
        if (options?.columnGap !== undefined) {
            this.setCss('column-gap', options?.columnGap);
        }
    }
    get columns() {
        return this.#columns;
    }
    set columns(n) {
        this.#columns = n;
        this.setCss('--columns', n);
    }
    get rows() {
        return this.#rows;
    }
    set rows(n) {
        this.#columns = n;
        this.setCss('--rows', n);
    }
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
customElements.define('ui-grid', Grid);

class AbstractInput extends BasicElement {
    obj;
    key;
    /**
     *
     * @param obj json object/array to keep up to date
     * @param key json key/indes to keep up to date
     * @param options configuration parameters
     */
    constructor(obj, key, options) {
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
class AbstractHTMLInput extends HTMLInputElement {
    /**
     *
     * @param obj json object/array to keep up to date
     * @param key json key/indes to keep up to date
     * @param options configuration parameters
     */
    constructor(obj, key, options) {
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
class StringInput extends AbstractHTMLInput {
    /**
     *
     * @param obj json object/array to keep up to date
     * @param key json key/indes to keep up to date
     * @param options configuration parameters
     */
    constructor(obj, key, options) {
        super(obj, key, options);
        this.type = "text";
        this.value = Reflect.get(obj, key) ?? null;
        if (options?.size)
            this.style.width = (options?.size * 24) + "px";
        if (options?.color)
            this.style.setProperty('--color', options?.color);
        if (options?.placeholder)
            this.setAttribute('placeholder', options?.placeholder);
        this.addEventListener('change', () => {
            let value = this.value;
            Reflect.set(obj, key, value);
            if (options?.callback)
                options?.callback(value);
        });
    }
}
customElements.define('ui-stringinput', StringInput, { extends: 'input' });
/**
 * A number input that keeps a json object
 * up to date with it's value
 *
 */
class NumberInput extends AbstractHTMLInput {
    /**
     *
     * @param {*} obj json object/array to keep up to date
     * @param {*} key json key/indes to keep up to date
     * @param {{callback?: Function, size?:Number, color?:String, placeholder?:string}} params configuration parameters
     */
    constructor(obj, key, options) {
        super(obj, key, options);
        this.type = "number";
        this.value = Reflect.get(obj, key);
        if (options?.size)
            this.style.width = (options?.size * 24) + "px";
        if (options?.color)
            this.style.setProperty('--color', options?.color);
        if (options?.placeholder)
            this.setAttribute('placeholder', options?.placeholder);
        this.addEventListener('change', () => {
            let value = parseFloat(this.value);
            Reflect.set(obj, key, value);
            if (options?.callback)
                options?.callback(value);
        });
    }
}
customElements.define('ui-numberinput', NumberInput, { extends: 'input' });
class SelectInput extends HTMLSelectElement {
    _value = null;
    obj;
    key;
    constructor(obj, key, options = { options: [] }) {
        super();
        this.obj = obj;
        this.key = key;
        this.setAttribute("ui-input", '');
        if (options?.size)
            this.style.width = (options?.size * 24) + "px";
        if (options?.color)
            this.style.setProperty('--color', options?.color);
        if (options?.placeholder)
            this.setAttribute('placeholder', options?.placeholder);
        this.addEventListener('change', () => {
            let value = this.value;
            this.setValue(value);
            if (options?.callback)
                options?.callback(value);
        });
        this.renderOptions(options.options);
    }
    getValue() {
        return Reflect.get(this.obj, this.key) ?? null;
    }
    setValue(value) {
        Reflect.set(this.obj, this.key, value);
    }
    async renderOptions(optionsArg) {
        let options = null;
        if (typeof optionsArg == 'function') {
            options = await optionsArg();
        }
        else {
            options = optionsArg;
        }
        let value = this.getValue();
        for (let opt of options) {
            let option = document.createElement('option');
            if (typeof opt == 'string') {
                if (opt == value)
                    option.setAttribute('selected', '');
                option.innerText = opt;
            }
            else {
                if (opt.value == value)
                    option.setAttribute('selected', '');
                option.innerText = opt.display ?? opt.value;
                option.value = opt.value;
            }
            this.append(option);
        }
    }
}
customElements.define('ui-selectinput', SelectInput, { extends: 'select' });
class MultiSelectInput extends AbstractInput {
    list;
    constructor(obj, key, options) {
        super(obj, key);
        if (!Array.isArray(this.value))
            this.value = [];
        let list = document.createElement("content");
        this.list = list;
        this.append(list);
        // picker
        // TODO other string picker options
        let select = document.createElement("select");
        select.innerHTML = "<option selected disabled hidden>Add...</option>" + options.options.map((o) => `<option>${o}</option>`).join('');
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
class JsonInput extends AbstractInput {
    constructor(obj, key) {
        super(obj, key);
        let text = document.createElement('textarea');
        text.onkeydown = (e) => {
            if (e.key == 'Tab') {
                e.preventDefault();
                let s = text.selectionStart;
                this.value = this.value.substring(0, text.selectionStart) + "\t" + this.value.substring(text.selectionEnd);
                text.selectionEnd = s + 1;
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
        text.value = JSON.stringify(this.value ?? "", null, "\t");
        this.append(text);
        setTimeout(resize, 10);
    }
}
customElements.define('ui-json-input', JsonInput);
class InputLabel extends HTMLLabelElement {
    input;
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
class LabelledInput extends InputLabel {
    constructor(json, key, type, options) {
        super(new type(json, key, options), options.name ?? key, { wrapped: true });
    }
}
customElements.define('ui-labelledinput', LabelledInput, { extends: 'label' });

class Form2 extends Grid {
    json;
    constructor(template, json, options) {
        super();
        this.json = json;
        this.build(template, json);
    }
    build(template, json) {
        console.log("build", template, json);
        for (let key of Object.keys(template)) {
            let pattern = template[key];
            if (typeof pattern == 'function') {
                // shorthand - a direct type declaration
                this.append(new LabelledInput(json, key, pattern));
            }
            else if (Array.isArray(pattern)) {
                // a component has been named to deal with this - handover to it
                this.append(new LabelledInput(json, key, pattern[0], pattern[1]));
            }
            else {
                // compounded type....
                let subJson = Reflect.get(json, key);
                // initalize nulls
                if (subJson == null) {
                    subJson = {};
                    Reflect.set(json, key, subJson);
                }
                // build a component for this pattern
                this.build(pattern, subJson);
            }
        }
    }
    get value() {
        return this.json;
    }
}
customElements.define('ui-form2', Form2);

class HashHandler {
    /** @type {RegExp}*/
    path;
    /** @type {} */
    pathVariables = [];
    func;
    constructor(path, func) {
        // extract path args
        while (path.includes('{')) {
            let variable = path.substring(path.indexOf('{'), path.indexOf('}') + 1);
            path = path.replace(variable, "([^/]*)");
            this.pathVariables.push(HashHandler.v(variable.substring(1, variable.length - 1)));
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
    static v(input) {
        let [name, type] = input.split(':');
        return {
            name: name,
            set: (obj, value) => {
                if (!value)
                    return;
                switch (type) {
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
        };
    }
    async handle(path, oldPath) {
        let parts = path.match(this.path);
        // if no match or it didn't match the whole string
        if (!parts || parts[0].length != path.length)
            return false;
        // compute vars
        let args = {};
        parts.shift();
        for (let v of this.pathVariables)
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
    handlers = [];
    position = [0, 0];
    static DIRECTION = {
        NONE: 0,
        LEFT: 1,
        RIGHT: 2,
        BOTTOM: 3,
        TOP: 4,
        RANDOM: 100
    };
    static Handler = HashHandler;
    constructor(key = null) {
        super();
        this.key = key;
        this.eventlistener = () => this.hashChange();
        window.addEventListener('hashchange', this.eventlistener);
    }
    static hashPairs() {
        let hash = window.location.hash.substring(1);
        return hash.replaceAll("%7C", "|").split('|').filter(i => i != '').map(pair => pair.includes('=') ? pair.split('=', 2) : [null, pair]);
    }
    static read(pathlike) {
        let [path, type] = pathlike ? pathlike.split(':') : [null];
        let pairs = HashManager.hashPairs();
        let pair = pairs.find(i => i[0] == path);
        let value = pair?.[1];
        if (value) {
            switch (type) {
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
    static write(pathlike, value, passive = false) {
        let [path, type] = pathlike ? pathlike.split(':') : [null];
        let pairs = HashManager.hashPairs();
        if (value !== null && value !== "") {
            let pair = pairs.find(i => i[0] == path);
            if (pair == null) {
                pair = [path, null];
                pairs.push(pair);
            }
            if (type == "json")
                value = JSON.stringify(value);
            pair[1] = value;
        }
        else {
            pairs = pairs.filter(i => i[0] != path);
        }
        if (passive) {
            history.replaceState(undefined, undefined, "#" + pairs.map(p => p[0] ? p.join('=') : p[1]).join('|'));
        }
        else {
            window.location.hash = pairs.map(p => p[0] ? p.join('=') : p[1]).join('|');
        }
    }
    remove() {
        super.remove();
        window.removeEventListener('hashchange', this.eventlistener);
        return this;
    }
    get value() {
        return this.hash;
    }
    handler(path, func) {
        this.handlers.push(new HashHandler(path, func));
        return this;
    }
    addHandler(h) {
        this.handlers.push(h);
    }
    set(value, fireOnChange = false, noHistory = false) {
        HashManager.write(this.key, value, noHistory);
        if (fireOnChange)
            return this.hashChange();
    }
    async hashChange() {
        let hash = window.location.hash.substring(1);
        let pairs = hash.split('|').map(pair => pair.includes('=') ? pair.split('=', 2) : [null, pair]);
        let pair = pairs.find(i => i[0] == this.key);
        if (pair == null)
            pair = [this.key, ""];
        let newHash = pair[1];
        let oldHash = this.hash;
        this.hash = newHash;
        if (this.hash == oldHash)
            return;
        // work out the new content
        for (let handler of this.handlers) {
            let result = await handler.handle(newHash, oldHash);
            if (result) {
                if (Array.isArray(result)) {
                    await this.swapContent(result[0], result[1]);
                }
                else {
                    await this.swapContent(result, null);
                }
                break;
            }
        }
    }
    async swapContent(body, direction = HashManager.DIRECTION.RIGHT) {
        let content = document.createElement('content');
        append(content, body);
        if (this.firstElementChild == null)
            return this.appendChild(content);
        if (direction == null) {
            this.firstElementChild.remove();
            this.appendChild(content);
            return;
        }
        let enter, exit;
        if (direction == HashManager.DIRECTION.RANDOM) {
            let dirs = [HashManager.DIRECTION.RIGHT, HashManager.DIRECTION.LEFT, HashManager.DIRECTION.TOP, HashManager.DIRECTION.BOTTOM];
            direction = dirs[Math.floor(Math.random() * dirs.length)];
        }
        if (Array.isArray(direction)) {
            console.log(this.position, direction);
            let newPosition = direction;
            // positional slide mode
            if (this.position[0] != direction[0]) {
                if (this.position[0] > direction[0]) {
                    direction = HashManager.DIRECTION.LEFT;
                }
                else {
                    direction = HashManager.DIRECTION.RIGHT;
                }
            }
            else if (this.position[1] != direction[1]) {
                if (this.position[1] < direction[1]) {
                    direction = HashManager.DIRECTION.BOTTOM;
                }
                else {
                    direction = HashManager.DIRECTION.TOP;
                }
            }
            else {
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
        super(content ?
            typeof content == 'object' ? JSON.stringify(content, null, "\t") : JSON.stringify(JSON.parse(content), null, "\t")
            : null);
    }
}
customElements.define('ui-json', Json);

let uuid = 0;
/**
 * @callback itemElement
 * @param {any} item
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
class List extends BasicElement {
    // weakmap will ensure that we don't hold elements after they have fallen out of both the DOM and the data list
    elementMap = new WeakMap();
    static ASC = true;
    static DESC = false;
    /** @type {boolean} indictes if the item display state is out of date */
    dirty = true;
    _busy = false;
    _sort = null;
    attrs = {};
    listBody = null;
    _data = null;
    static ITEMS_COLUMNS_KEY = "--item-columns";
    static ITEMS_PER_PAGE_KEY = "--items-per-page";
    display;
    lookup;
    _filterFunc;
    _itemDisplayFunc;
    pageNumber;
    constructor(itemDisplay, options = {}) {
        super();
        this.setAttribute("ui-list", '');
        this.innerHTML = this.listLayout;
        this.listBody = this.querySelector('.list');
        this._sort = null;
        this._data = [];
        this.display = [];
        this.lookup = {};
        this._filterFunc = null;
        this._itemDisplayFunc = itemDisplay;
        this.pageNumber = 0;
        if (options.itemColumns)
            this.itemColumns = options.itemColumns;
        if (options.itemsPerPage)
            this.itemsPerPage = options.itemsPerPage;
    }
    async notBusy() {
        while (this._busy)
            await sleep(10);
    }
    set itemColumns(value) {
        this.setCss(List.ITEMS_COLUMNS_KEY, value);
    }
    get itemsPerPage() {
        let n = this.cssNumber(List.ITEMS_PER_PAGE_KEY);
        return n || 24;
    }
    set itemsPerPage(value) {
        this.setCss(List.ITEMS_PER_PAGE_KEY, value);
    }
    get listLayout() {
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
	</footer>`;
    }
    set data(data) {
        this._data = data;
        for (let item of this._data) {
            if (item.__id == null)
                item.__id = item.id ? item.id : ('' + uuid++);
        }
        this.dirty = true;
    }
    get data() {
        return this._data;
    }
    /**
     *
     * @param {String} name
     * @param {*} valueFunc
     * @param {*} displayFunc
     * @param {*} width
     */
    addAttribute(name, valueFunc = (i) => i[name], displayFunc = valueFunc, width = null) {
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
    filter(func = this._filterFunc) {
        this._filterFunc = func;
        this.dirty = true;
        this.notBusy()
            .then(() => this.page(0));
    }
    /**
     * Display the sorting headers
     */
    sortDisplay() {
        let wrapper = this.querySelector('.sort');
        let select = document.createElement('select');
        select.innerHTML = Object.values(this.attrs).map(attr => attr.value ?
            `<option value="${attr.name}:asc" >▲ ${attr.name}</option>
			<option value="${attr.name}:desc">▼ ${attr.name}</option>` : '').join('');
        select.value = this._sort ? `${this._sort.attr.name}:${this._sort.asc ? 'asc' : 'desc'}` : null;
        select.onchange = () => {
            let vs = select.value.split(':');
            this.sort(vs[0], vs[1] == 'asc');
        };
        wrapper.innerHTML = "";
        wrapper.appendChild(select);
        if (Object.values(this.attrs).length == 0)
            wrapper.style.display = "none";
    }
    async render(forceRedraw = false) {
        // TODO render busy spinner?
        if (forceRedraw) {
            this.dirty = true;
        }
        //render headers
        this.sortDisplay();
        // setup paging
        await this.page();
    }
    async sort(attribute = this._sort?.attr, asc = !this._sort?.asc) {
        this.dirty = true;
        let attr = (typeof attribute == 'string') ? this.attrs[attribute] : attribute;
        if (attribute == null) {
            this._sort = null;
        }
        else {
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
        // really basic queueing to render. This will stop double rendering, but might fail for triple etc
        await this.notBusy();
        this._busy = true;
        try {
            // rebuild the display list if dirty
            if (this.dirty) {
                // grab raw data
                this.display = [...this.data];
                // filter
                this.display = this.display.filter(i => this._filtered(i));
                // sort
                if (this._sort) {
                    this.display = this.display.sort((_a, _b) => {
                        let a = _a ? this._sort.attr.value(_a) : null;
                        let b = _b ? this._sort.attr.value(_b) : null;
                        if (a == b)
                            return 0;
                        let asc = (this._sort.asc ? 1 : -1);
                        if (b == null)
                            return asc;
                        if (a == null)
                            return -asc;
                        return asc * ('' + a).localeCompare('' + b, "en", { sensitivity: 'base', ignorePunctuation: true, numeric: true });
                    });
                }
                this.dirty = false;
                this.pageNumber = 0;
            }
            // compute paging numbers
            let visibleCount = this.display.length;
            let pages = Math.ceil(visibleCount / this.itemsPerPage);
            let needsPaging = pages > 1;
            this.pageNumber = isNaN(page) ? 0 : Math.max(Math.min(page, pages - 1), 0);
            // render the paging if needed
            if (needsPaging) {
                let paging = this.pagingMarkup(this.pageNumber, pages, visibleCount);
                this.querySelector('.paging.top').innerHTML = paging;
                this.querySelector('.paging.bottom').innerHTML = paging;
                // add auto paging callback 
                castHtmlElements(...this.querySelectorAll('[data-page]')).forEach(ele => ele.addEventListener('click', () => {
                    this.page(parseInt(ele.dataset['page']));
                }));
            }
            else {
                this.querySelector('.paging.top').innerHTML = "";
                this.querySelector('.paging.bottom').innerHTML = "";
            }
            // finally actually add the items to the page
            this.listBody.innerHTML = "";
            for (let index = this.pageNumber * this.itemsPerPage; index < (this.pageNumber + 1) * this.itemsPerPage && index < visibleCount; index++) {
                let item = this.display[index];
                let ele = (await this.getItemElement(item));
                if (ele instanceof BasicElement) {
                    ele.attach(this.listBody);
                }
                else {
                    this.listBody.appendChild(ele);
                }
            }
        }
        finally {
            this._busy = false;
        }
    }
    async getItemElement(item) {
        if (!this.elementMap.has(item)) {
            let ele = await this.renderItem(item);
            if (typeof item == "string") {
                // TODO support caching of string based item elements....
                return ele;
            }
            this.elementMap.set(item, ele);
        }
        return this.elementMap.get(item);
    }
    async renderItem(item) {
        return await this._itemDisplayFunc(item);
    }
    pagingMarkup(page, pages, visibleCount) {
        let html = '';
        let extraButtons = 1;
        html += `${visibleCount} items`;
        html += `<ui-button data-page="0" class="near ${page == 0 ? 'active' : ''}">1</ui-button>`;
        let start = page - extraButtons;
        let end = page + extraButtons + 1;
        if (start < 1) {
            end += 1 - start;
            start = 1;
        }
        if (end > pages - 1) {
            start -= (end - pages) + 1;
            end = pages - 1;
            start = Math.max(1, start);
        }
        if (start > 1) {
            html += `<span>...</span>`;
        }
        for (let p = start; p < end; p++) {
            html += `<ui-button data-page="${p}" class="${p == page ? 'active' : ''}">${p + 1}</ui-button>`;
        }
        if (end < pages - 1) {
            html += `<span>...</span>`;
        }
        html += `<ui-button data-page="${pages - 1}" class="near ${page == pages - 1 ? 'active' : ''}">${pages}</ui-button>`;
        return html;
    }
}
customElements.define('ui-list', List);
/**
 * Table is a special case of List with a more automatic layout
 */
class Table extends List {
    constructor(options = {}) {
        super(async (item) => {
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
    get listLayout() {
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
</table>`;
    }
    /**
     * Display the sorting headers
     */
    sortDisplay() {
        let header = this.querySelector('thead tr.headers');
        let headers = Object.values(this.attrs);
        let html = '';
        for (let header of headers) {
            html += `<th data-table-id="${header.id}" ${this.attrs[header.name].value ? `data-sort="${header.name}"` : ''} style="${header.width ? `width:${header.width}` : ''}">${header.name}</th>`;
        }
        header.innerHTML = html;
        header.querySelectorAll('th').forEach(ele => {
            // if it's a sortable column add the click behaviour
            if (ele.dataset.sort) {
                ele.onclick = (event) => {
                    this.sort(ele.dataset.sort);
                };
            }
        });
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
    constructor(options) {
        super();
        let size = options?.size ?? this.attributes.getNamedItem("size")?.value ?? "1em";
        this.style.setProperty("--size", size);
    }
}
customElements.define('ui-spinner', Spinner);

class Viewport extends BasicElement {
    #view = {
        parent: null,
        // what position the top left corner maps to
        x: 0,
        y: 0,
        zoom: 1,
        get width() {
            return this.parent.bounds.width / this.zoom;
        },
        get height() {
            return this.parent.bounds.height / this.zoom;
        }
    };
    // json of the last view rendered
    #lastV;
    attachments = [];
    canvas;
    // grid that gets drawn on the canvas
    grid = [
        { step: 1, offset: 1, color: "#7772" },
        { step: 6, offset: 6, color: "#7772" },
        { step: 12, offset: 0, color: "#7774" },
        { step: Infinity, offset: 0, color: "#999" }
    ];
    constructor() {
        super();
        this.#view.parent = this;
        this.canvas = document.createElement('canvas');
        this.append(this.canvas);
        // size of one screen pixel (in worldspace pixels)
        this.setCss("--pixel", this.#view.zoom);
    }
    addAttachment(element, update = true) {
        this.attachments.push(element);
        this.append(element);
        if (update) {
            this.updateAttachments();
        }
    }
    removeAttachment(element, update = true) {
        this.attachments = this.attachments.filter(e => e != element);
        this.removeChild(element);
        if (update) {
            this.updateAttachments();
        }
    }
    /**
     * Move the view so vx,vy is in the center of the viewport
     */
    setCenter(vx, vy) {
        this.#view.x = vx - (this.#view.width / 2);
        this.#view.y = vy - (this.#view.height / 2);
    }
    /**
     * Get the current worldspace coordinate at the center of the viewport
     *
     * @returns {{x,y}}
     */
    getCenter() {
        return this.toView(this.#view.width / 2, this.#view.height / 2);
    }
    /**
     *
     * Zoom on a point in screen space, keeping that point in the same place
     *
     * @param {number} vz target zoom level
     * @param {number?} vx point to keep in the same position on screen
     * @param {number?} vy point to keep in the same position on screen
     */
    setZoom(vz, vx = null, vy = null) {
        if (vx == null) {
            let vxy = this.getCenter();
            vx = vxy.x;
            vy = vxy.y;
        }
        let s1 = this.toScreen(vx, vy);
        this.#view.zoom = vz;
        this.setCss("--pixel", 1 / this.#view.zoom);
        let s2 = this.toScreen(vx, vy);
        let px = s2.x - s1.x;
        let py = s2.y - s1.y;
        this.panScreen(px, py);
    }
    getZoom() {
        return this.#view.zoom;
    }
    getView() {
        return {
            x: this.#view.x,
            y: this.#view.y,
            zoom: this.#view.zoom,
            width: this.#view.width,
            height: this.#view.height
        };
    }
    /**
     * Pan the viewport by screen pixels
     *
     * @param {number} sx
     * @param {number} sy
     */
    panScreen(sx, sy) {
        this.#view.x += sx / this.#view.zoom;
        this.#view.y += sy / this.#view.zoom;
    }
    /**
     * convert the screen cordinates to the location
     * in the viewspace
     *
     * @param {Number} sx
     * @param {Number} sy
     *
     * @returns {{x:number,y:number, out: boolean}}
     */
    toView(sx, sy) {
        let v = this.#view;
        let e = this.bounds;
        let xy = {
            x: (sx - e.x) / v.zoom + v.x,
            y: (sy - e.y) / v.zoom + v.y,
            out: false
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
    toScreen(vx, vy) {
        let v = this.#view;
        return {
            x: (vx - v.x) * v.zoom,
            y: (vy - v.y) * v.zoom
        };
    }
    get bounds() {
        return this.getBoundingClientRect();
    }
    render() {
        let v = this.#view;
        let lv = JSON.stringify({ x: v.x, y: v.y, w: v.width, h: v.height, z: v.zoom });
        if (!(this.#lastV == null || this.#lastV != lv)) {
            this.#lastV = lv;
            // disabiling this - only onchange
            // this.updateAttachments();
            return;
        }
        this.#lastV = lv;
        let element = this.bounds;
        if (this.canvas.width != element.width || this.canvas.height != element.height) {
            this.canvas.width = element.width;
            this.canvas.height = element.height;
        }
        // clear the canvas
        let context = this.canvas.getContext("2d");
        context.resetTransform();
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.grid.length) {
            // set correct position
            let xOff = -v.x * v.zoom;
            let yOff = -v.y * v.zoom;
            let xmin = 0;
            let xmax = v.width * v.zoom;
            let ymin = 0;
            let ymax = v.height * v.zoom;
            context.lineWidth = 1;
            // grid
            for (let grid of this.grid) {
                if (v.zoom * grid.step < 10) {
                    continue;
                }
                context.beginPath();
                context.strokeStyle = grid.color;
                // TODO sort this out!
                for (let offset = grid.offset ?? 0; offset < 1000 * grid.step; offset += grid.step) {
                    let offStep = offset * v.zoom;
                    if (offStep + yOff > ymin && offStep + yOff < ymax) {
                        context.moveTo(xmin, offStep + yOff);
                        context.lineTo(xmax, offStep + yOff);
                    }
                    if (-offStep + yOff > ymin && -offStep + yOff < ymax) {
                        context.moveTo(xmin, -offStep + yOff);
                        context.lineTo(xmax, -offStep + yOff);
                    }
                    if (offStep + xOff > xmin && offStep + xOff < xmax) {
                        context.moveTo(offStep + xOff, ymin);
                        context.lineTo(offStep + xOff, ymax);
                    }
                    if (-offStep + xOff > xmin && -offStep + xOff < xmax) {
                        context.moveTo(-offStep + xOff, ymin);
                        context.lineTo(-offStep + xOff, ymax);
                    }
                }
                context.stroke();
            }
        }
        this.updateAttachments();
    }
    updateAttachments() {
        let v = this.#view;
        for (let attachment of this.attachments) {
            if (attachment.render) {
                attachment.render(this);
            }
            else {
                let scale = attachment.scalar ?? 1;
                let x = (attachment.x ?? 0) * scale - v.x;
                let y = (attachment.y ?? 0) * scale - v.y;
                let t = `translate(${x * v.zoom}px, ${y * v.zoom}px) scale(${v.zoom * scale})`;
                attachment.style.transform = t;
            }
        }
    }
    /***********/
    bindMouse() {
        const LEFT_MOUSE = 0;
        const MIDDLE_MOUSE = 1;
        const RIGHT_MOUSE = 2;
        let drag = null;
        this.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        this.addEventListener('wheel', (e) => {
            let v = this.toView(e.x, e.y);
            // this looks funky but give a nice UX
            let zoom = Math.exp((Math.log(this.#view.zoom) * 480 - e.deltaY) / 480);
            this.setZoom(zoom, v.x, v.y);
            this.render();
        });
        // TODO the events here are document scoped - they should check if they are actually viewport based
        document.addEventListener('mousedown', (e) => {
            if (e.button == MIDDLE_MOUSE) {
                drag = [e.x, e.y];
            }
            if (e.button == LEFT_MOUSE) ;
            if (e.button == RIGHT_MOUSE) ;
        });
        document.addEventListener('mousemove', (e) => {
            if (drag) {
                let ndrag = [e.x, e.y];
                this.panScreen(drag[0] - ndrag[0], drag[1] - ndrag[1]);
                drag = ndrag;
                this.render();
            }
        });
        document.addEventListener('mouseup', (e) => {
            if (e.button == MIDDLE_MOUSE) {
                let ndrag = [e.x, e.y];
                this.panScreen(drag[0] - ndrag[0], drag[1] - ndrag[1]);
                drag = null;
                this.render();
            }
            if (e.button == LEFT_MOUSE) ;
            if (e.button == RIGHT_MOUSE) ;
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
    uuid: uuid$1,
    sleep: sleep,
    utils,
    factory
};
// @ts-ignore
window["UI"] = UI;
let createElement = htmlToElement;

export { Badge, BasicElement, Button, Cancel, Card, Code, ContextMenu, Form, Grid, HashManager, InputLabel, Json, LabelledInput, List, Modal, MultiSelectInput, NumberInput, Panel, Spacer, Spinner, Splash, StringInput, Table, Toast, Toggle, Viewport, createElement, UI as default, factory, utils };
//# sourceMappingURL=ui.js.map
