const sleep = (time, value) => new Promise(r => setTimeout(() => r(value), time));
self['sleep'] = sleep;
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
let random = Math.random;
function setRandom(rng) {
    random = rng;
}
function uuid$1() {
    let id = null;
    do {
        id = "ui-" + random().toString(16).slice(2);
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
    append: append,
    castHtmlElements: castHtmlElements,
    downloadJson: downloadJson,
    dynamicallyLoadScript: dynamicallyLoadScript,
    htmlToElement: htmlToElement,
    get random () { return random; },
    setRandom: setRandom,
    shuffle: shuffle,
    sleep: sleep,
    uuid: uuid$1
});

function Readyable(Base) {
    return class extends Base {
        #ready = false;
        constructor(...args) {
            super(...args);
        }
        get ready() {
            return this.#ready;
        }
        set ready(bool) {
            this.#ready = bool;
        }
        async isReady() {
            while (!this.ready)
                await sleep(10);
        }
    };
}
function Draggable(Base) {
    return class Draggable extends Base {
        #dropTypeSet = new Set();
        droppable = false;
        dragdata = {};
        constructor(...args) {
            super(...args);
        }
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
                    let id = "D_" + Math.floor(1_000_000 * random()).toString(16);
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
    };
}

var mixin = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Draggable: Draggable,
    Readyable: Readyable
});

class BasicElement extends Draggable(HTMLElement) {
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
        super(content, options);
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
                this.classList.add('icon-only');
        }
    }
    setIcon(icon) {
        this.querySelector('i').remove();
        let i = document.createElement('i');
        let classes = icon.trim().split(" ");
        // include the default font-awesome class if one wasn't provided
        if (!classes.includes('fa') && !classes.includes('fab') && !classes.includes('fas'))
            i.classList.add('fa');
        i.classList.add(...classes);
        this.prepend(i);
    }
}
customElements.define('ui-button', Button);

class Toggle extends BasicElement {
    constructor(v, changeCallback) {
        super(`<input type="checkbox"/><div><span></span></div>`);
        this.value = v ?? (this.attributes.getNamedItem("value")?.value == "true");
        this.setAttribute("ui-toggle", "");
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
        for (let listener of this.changeListeners)
            await listener(json);
        this.dispatchEvent(new Event('change'));
    }
    json(includeHidden = false) {
        let value = this._readValue(this, includeHidden);
        if (!includeHidden)
            this.value = value;
        return value;
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
                    // TODO figure out the typescript safe way to do this...
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
            this.changeListeners.push(async (json) => {
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
            if (options?.header && options.header !== true) {
                this.header(options.header);
            }
            if (options?.footer && options.footer !== true) {
                this.footer(options.footer);
            }
        }
        if (options?.clazz) {
            if (Array.isArray(options.clazz))
                this.classList.add(...options.clazz);
            else
                this.classList.add(options.clazz);
        }
    }
    get content() {
        return this.querySelector('content') ?? this;
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
        this.setAttribute("ui-splash", '');
        if (dismissable) {
            this.addEventListener('mousedown', this.remove);
        }
    }
}
customElements.define('ui-splash', Splash);

class Modal extends Splash {
    constructor(content, options) {
        super('', { dismissable: options?.dismissable ?? true });
        this.setAttribute("ui-modal", '');
        let panel = new Panel(content, options);
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
    error: error,
    info: info,
    popupForm: popupForm,
    warn: warn
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
        const decoder = new TextDecoder("utf-16le");
        return decoder.decode(new Uint16Array(binaryView.buffer));
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

var WorkerFactory = /*#__PURE__*/createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewoJJ3VzZSBzdHJpY3QnOwoKCS8vIEB0cy1ub2NoZWNrCglvbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHsKCQlobGpzLmNvbmZpZ3VyZSh7fSk7CgkJY29uc3QgcmVzdWx0ID0gaGxqcy5oaWdobGlnaHRBdXRvKGV2ZW50LmRhdGEpOwoJCXBvc3RNZXNzYWdlKHJlc3VsdC52YWx1ZSk7Cgl9OwoKCS8qCgkgIEhpZ2hsaWdodC5qcyAxMC4xLjAgKDc0ZGU2ZWFhKQoJICBMaWNlbnNlOiBCU0QtMy1DbGF1c2UKCSAgQ29weXJpZ2h0IChjKSAyMDA2LTIwMjAsIEl2YW4gU2FnYWxhZXYKCSovCgl2YXIgaGxqcz1mdW5jdGlvbigpe2Z1bmN0aW9uIGUobil7T2JqZWN0LmZyZWV6ZShuKTt2YXIgdD0iZnVuY3Rpb24iPT10eXBlb2YgbjtyZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMobikuZm9yRWFjaCgoZnVuY3Rpb24ocil7IU9iamVjdC5oYXNPd25Qcm9wZXJ0eS5jYWxsKG4scil8fG51bGw9PT1uW3JdfHwib2JqZWN0IiE9dHlwZW9mIG5bcl0mJiJmdW5jdGlvbiIhPXR5cGVvZiBuW3JdfHx0JiYoImNhbGxlciI9PT1yfHwiY2FsbGVlIj09PXJ8fCJhcmd1bWVudHMiPT09cil8fE9iamVjdC5pc0Zyb3plbihuW3JdKXx8ZShuW3JdKTt9KSksbn1jbGFzcyBue2NvbnN0cnVjdG9yKGUpeyB2b2lkIDA9PT1lLmRhdGEmJihlLmRhdGE9e30pLHRoaXMuZGF0YT1lLmRhdGE7fWlnbm9yZU1hdGNoKCl7dGhpcy5pZ25vcmU9dHJ1ZTt9fWZ1bmN0aW9uIHQoZSl7cmV0dXJuIGUucmVwbGFjZSgvJi9nLCImYW1wOyIpLnJlcGxhY2UoLzwvZywiJmx0OyIpLnJlcGxhY2UoLz4vZywiJmd0OyIpLnJlcGxhY2UoLyIvZywiJnF1b3Q7IikucmVwbGFjZSgvJy9nLCImI3gyNzsiKX1mdW5jdGlvbiByKGUsLi4ubil7dmFyIHQ9e307Zm9yKGNvbnN0IG4gaW4gZSl0W25dPWVbbl07cmV0dXJuIG4uZm9yRWFjaCgoZnVuY3Rpb24oZSl7Zm9yKGNvbnN0IG4gaW4gZSl0W25dPWVbbl07fSkpLHR9ZnVuY3Rpb24gYShlKXtyZXR1cm4gZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpfXZhciBpPU9iamVjdC5mcmVlemUoe19fcHJvdG9fXzpudWxsLGVzY2FwZUhUTUw6dCxpbmhlcml0OnIsbm9kZVN0cmVhbTpmdW5jdGlvbihlKXt2YXIgbj1bXTtyZXR1cm4gZnVuY3Rpb24gZSh0LHIpe2Zvcih2YXIgaT10LmZpcnN0Q2hpbGQ7aTtpPWkubmV4dFNpYmxpbmcpMz09PWkubm9kZVR5cGU/cis9aS5ub2RlVmFsdWUubGVuZ3RoOjE9PT1pLm5vZGVUeXBlJiYobi5wdXNoKHtldmVudDoic3RhcnQiLG9mZnNldDpyLG5vZGU6aX0pLHI9ZShpLHIpLGEoaSkubWF0Y2goL2JyfGhyfGltZ3xpbnB1dC8pfHxuLnB1c2goe2V2ZW50OiJzdG9wIixvZmZzZXQ6cixub2RlOml9KSk7cmV0dXJuIHJ9KGUsMCksbn0sbWVyZ2VTdHJlYW1zOmZ1bmN0aW9uKGUsbixyKXt2YXIgaT0wLHM9IiIsbz1bXTtmdW5jdGlvbiBsKCl7cmV0dXJuIGUubGVuZ3RoJiZuLmxlbmd0aD9lWzBdLm9mZnNldCE9PW5bMF0ub2Zmc2V0P2VbMF0ub2Zmc2V0PG5bMF0ub2Zmc2V0P2U6bjoic3RhcnQiPT09blswXS5ldmVudD9lOm46ZS5sZW5ndGg/ZTpufWZ1bmN0aW9uIGMoZSl7cys9IjwiK2EoZSkrW10ubWFwLmNhbGwoZS5hdHRyaWJ1dGVzLChmdW5jdGlvbihlKXtyZXR1cm4gIiAiK2Uubm9kZU5hbWUrJz0iJyt0KGUudmFsdWUpKyciJ30pKS5qb2luKCIiKSsiPiI7fWZ1bmN0aW9uIHUoZSl7cys9IjwvIithKGUpKyI+Ijt9ZnVuY3Rpb24gZChlKXsoInN0YXJ0Ij09PWUuZXZlbnQ/Yzp1KShlLm5vZGUpO31mb3IoO2UubGVuZ3RofHxuLmxlbmd0aDspe3ZhciBnPWwoKTtpZihzKz10KHIuc3Vic3RyaW5nKGksZ1swXS5vZmZzZXQpKSxpPWdbMF0ub2Zmc2V0LGc9PT1lKXtvLnJldmVyc2UoKS5mb3JFYWNoKHUpO2Rve2QoZy5zcGxpY2UoMCwxKVswXSksZz1sKCk7fXdoaWxlKGc9PT1lJiZnLmxlbmd0aCYmZ1swXS5vZmZzZXQ9PT1pKTtvLnJldmVyc2UoKS5mb3JFYWNoKGMpO31lbHNlICJzdGFydCI9PT1nWzBdLmV2ZW50P28ucHVzaChnWzBdLm5vZGUpOm8ucG9wKCksZChnLnNwbGljZSgwLDEpWzBdKTt9cmV0dXJuIHMrdChyLnN1YnN0cihpKSl9fSk7Y29uc3Qgcz0iPC9zcGFuPiIsbz1lPT4hIWUua2luZDtjbGFzcyBse2NvbnN0cnVjdG9yKGUsbil7dGhpcy5idWZmZXI9IiIsdGhpcy5jbGFzc1ByZWZpeD1uLmNsYXNzUHJlZml4LGUud2Fsayh0aGlzKTt9YWRkVGV4dChlKXt0aGlzLmJ1ZmZlcis9dChlKTt9b3Blbk5vZGUoZSl7aWYoIW8oZSkpcmV0dXJuO2xldCBuPWUua2luZDtlLnN1Ymxhbmd1YWdlfHwobj1gJHt0aGlzLmNsYXNzUHJlZml4fSR7bn1gKSx0aGlzLnNwYW4obik7fWNsb3NlTm9kZShlKXtvKGUpJiYodGhpcy5idWZmZXIrPXMpO312YWx1ZSgpe3JldHVybiB0aGlzLmJ1ZmZlcn1zcGFuKGUpe3RoaXMuYnVmZmVyKz1gPHNwYW4gY2xhc3M9IiR7ZX0iPmA7fX1jbGFzcyBje2NvbnN0cnVjdG9yKCl7dGhpcy5yb290Tm9kZT17Y2hpbGRyZW46W119LHRoaXMuc3RhY2s9W3RoaXMucm9vdE5vZGVdO31nZXQgdG9wKCl7cmV0dXJuIHRoaXMuc3RhY2tbdGhpcy5zdGFjay5sZW5ndGgtMV19Z2V0IHJvb3QoKXtyZXR1cm4gdGhpcy5yb290Tm9kZX1hZGQoZSl7dGhpcy50b3AuY2hpbGRyZW4ucHVzaChlKTt9b3Blbk5vZGUoZSl7Y29uc3Qgbj17a2luZDplLGNoaWxkcmVuOltdfTt0aGlzLmFkZChuKSx0aGlzLnN0YWNrLnB1c2gobik7fWNsb3NlTm9kZSgpe2lmKHRoaXMuc3RhY2subGVuZ3RoPjEpcmV0dXJuIHRoaXMuc3RhY2sucG9wKCl9Y2xvc2VBbGxOb2Rlcygpe2Zvcig7dGhpcy5jbG9zZU5vZGUoKTspO310b0pTT04oKXtyZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5yb290Tm9kZSxudWxsLDQpfXdhbGsoZSl7cmV0dXJuIHRoaXMuY29uc3RydWN0b3IuX3dhbGsoZSx0aGlzLnJvb3ROb2RlKX1zdGF0aWMgX3dhbGsoZSxuKXtyZXR1cm4gInN0cmluZyI9PXR5cGVvZiBuP2UuYWRkVGV4dChuKTpuLmNoaWxkcmVuJiYoZS5vcGVuTm9kZShuKSxuLmNoaWxkcmVuLmZvckVhY2gobj0+dGhpcy5fd2FsayhlLG4pKSxlLmNsb3NlTm9kZShuKSksZX1zdGF0aWMgX2NvbGxhcHNlKGUpeyJzdHJpbmciIT10eXBlb2YgZSYmZS5jaGlsZHJlbiYmKGUuY2hpbGRyZW4uZXZlcnkoZT0+InN0cmluZyI9PXR5cGVvZiBlKT9lLmNoaWxkcmVuPVtlLmNoaWxkcmVuLmpvaW4oIiIpXTplLmNoaWxkcmVuLmZvckVhY2goZT0+e2MuX2NvbGxhcHNlKGUpO30pKTt9fWNsYXNzIHUgZXh0ZW5kcyBje2NvbnN0cnVjdG9yKGUpe3N1cGVyKCksdGhpcy5vcHRpb25zPWU7fWFkZEtleXdvcmQoZSxuKXsiIiE9PWUmJih0aGlzLm9wZW5Ob2RlKG4pLHRoaXMuYWRkVGV4dChlKSx0aGlzLmNsb3NlTm9kZSgpKTt9YWRkVGV4dChlKXsiIiE9PWUmJnRoaXMuYWRkKGUpO31hZGRTdWJsYW5ndWFnZShlLG4pe2NvbnN0IHQ9ZS5yb290O3Qua2luZD1uLHQuc3VibGFuZ3VhZ2U9dHJ1ZSx0aGlzLmFkZCh0KTt9dG9IVE1MKCl7cmV0dXJuIG5ldyBsKHRoaXMsdGhpcy5vcHRpb25zKS52YWx1ZSgpfWZpbmFsaXplKCl7cmV0dXJuICB0cnVlfX1mdW5jdGlvbiBkKGUpe3JldHVybiBlPyJzdHJpbmciPT10eXBlb2YgZT9lOmUuc291cmNlOm51bGx9Y29uc3QgZz0iKC0/KShcXGIwW3hYXVthLWZBLUYwLTldK3woXFxiXFxkKyhcXC5cXGQqKT98XFwuXFxkKykoW2VFXVstK10/XFxkKyk/KSIsaD17YmVnaW46IlxcXFxbXFxzXFxTXSIscmVsZXZhbmNlOjB9LGY9e2NsYXNzTmFtZToic3RyaW5nIixiZWdpbjoiJyIsZW5kOiInIixpbGxlZ2FsOiJcXG4iLGNvbnRhaW5zOltoXX0scD17Y2xhc3NOYW1lOiJzdHJpbmciLGJlZ2luOiciJyxlbmQ6JyInLGlsbGVnYWw6IlxcbiIsY29udGFpbnM6W2hdfSxiPXtiZWdpbjovXGIoYXxhbnx0aGV8YXJlfEknbXxpc24ndHxkb24ndHxkb2Vzbid0fHdvbid0fGJ1dHxqdXN0fHNob3VsZHxwcmV0dHl8c2ltcGx5fGVub3VnaHxnb25uYXxnb2luZ3x3dGZ8c298c3VjaHx3aWxsfHlvdXx5b3VyfHRoZXl8bGlrZXxtb3JlKVxiL30sbT1mdW5jdGlvbihlLG4sdD17fSl7dmFyIGE9cih7Y2xhc3NOYW1lOiJjb21tZW50IixiZWdpbjplLGVuZDpuLGNvbnRhaW5zOltdfSx0KTtyZXR1cm4gYS5jb250YWlucy5wdXNoKGIpLGEuY29udGFpbnMucHVzaCh7Y2xhc3NOYW1lOiJkb2N0YWciLGJlZ2luOiIoPzpUT0RPfEZJWE1FfE5PVEV8QlVHfE9QVElNSVpFfEhBQ0t8WFhYKToiLHJlbGV2YW5jZTowfSksYX0sdj1tKCIvLyIsIiQiKSx4PW0oIi9cXCoiLCJcXCovIiksRT1tKCIjIiwiJCIpO3ZhciBfPU9iamVjdC5mcmVlemUoe19fcHJvdG9fXzpudWxsLElERU5UX1JFOiJbYS16QS1aXVxcdyoiLFVOREVSU0NPUkVfSURFTlRfUkU6IlthLXpBLVpfXVxcdyoiLE5VTUJFUl9SRToiXFxiXFxkKyhcXC5cXGQrKT8iLENfTlVNQkVSX1JFOmcsQklOQVJZX05VTUJFUl9SRToiXFxiKDBiWzAxXSspIixSRV9TVEFSVEVSU19SRToiIXwhPXwhPT18JXwlPXwmfCYmfCY9fFxcKnxcXCo9fFxcK3xcXCs9fCx8LXwtPXwvPXwvfDp8O3w8PHw8PD18PD18PHw9PT18PT18PXw+Pj49fD4+PXw+PXw+Pj58Pj58PnxcXD98XFxbfFxce3xcXCh8XFxefFxcXj18XFx8fFxcfD18XFx8XFx8fH4iLFNIRUJBTkc6KGU9e30pPT57Y29uc3Qgbj0vXiMhWyBdKlwvLztyZXR1cm4gZS5iaW5hcnkmJihlLmJlZ2luPWZ1bmN0aW9uKC4uLmUpe3JldHVybiBlLm1hcChlPT5kKGUpKS5qb2luKCIiKX0obiwvLipcYi8sZS5iaW5hcnksL1xiLiovKSkscih7Y2xhc3NOYW1lOiJtZXRhIixiZWdpbjpuLGVuZDovJC8scmVsZXZhbmNlOjAsIm9uOmJlZ2luIjooZSxuKT0+ezAhPT1lLmluZGV4JiZuLmlnbm9yZU1hdGNoKCk7fX0sZSl9LEJBQ0tTTEFTSF9FU0NBUEU6aCxBUE9TX1NUUklOR19NT0RFOmYsUVVPVEVfU1RSSU5HX01PREU6cCxQSFJBU0FMX1dPUkRTX01PREU6YixDT01NRU5UOm0sQ19MSU5FX0NPTU1FTlRfTU9ERTp2LENfQkxPQ0tfQ09NTUVOVF9NT0RFOngsSEFTSF9DT01NRU5UX01PREU6RSxOVU1CRVJfTU9ERTp7Y2xhc3NOYW1lOiJudW1iZXIiLGJlZ2luOiJcXGJcXGQrKFxcLlxcZCspPyIscmVsZXZhbmNlOjB9LENfTlVNQkVSX01PREU6e2NsYXNzTmFtZToibnVtYmVyIixiZWdpbjpnLHJlbGV2YW5jZTowfSxCSU5BUllfTlVNQkVSX01PREU6e2NsYXNzTmFtZToibnVtYmVyIixiZWdpbjoiXFxiKDBiWzAxXSspIixyZWxldmFuY2U6MH0sQ1NTX05VTUJFUl9NT0RFOntjbGFzc05hbWU6Im51bWJlciIsYmVnaW46IlxcYlxcZCsoXFwuXFxkKyk/KCV8ZW18ZXh8Y2h8cmVtfHZ3fHZofHZtaW58dm1heHxjbXxtbXxpbnxwdHxwY3xweHxkZWd8Z3JhZHxyYWR8dHVybnxzfG1zfEh6fGtIenxkcGl8ZHBjbXxkcHB4KT8iLHJlbGV2YW5jZTowfSxSRUdFWFBfTU9ERTp7YmVnaW46Lyg/PVwvW14vXG5dKlwvKS8sY29udGFpbnM6W3tjbGFzc05hbWU6InJlZ2V4cCIsYmVnaW46L1wvLyxlbmQ6L1wvW2dpbXV5XSovLGlsbGVnYWw6L1xuLyxjb250YWluczpbaCx7YmVnaW46L1xbLyxlbmQ6L1xdLyxyZWxldmFuY2U6MCxjb250YWluczpbaF19XX1dfSxUSVRMRV9NT0RFOntjbGFzc05hbWU6InRpdGxlIixiZWdpbjoiW2EtekEtWl1cXHcqIixyZWxldmFuY2U6MH0sVU5ERVJTQ09SRV9USVRMRV9NT0RFOntjbGFzc05hbWU6InRpdGxlIixiZWdpbjoiW2EtekEtWl9dXFx3KiIscmVsZXZhbmNlOjB9LE1FVEhPRF9HVUFSRDp7YmVnaW46IlxcLlxccypbYS16QS1aX11cXHcqIixyZWxldmFuY2U6MH0sRU5EX1NBTUVfQVNfQkVHSU46ZnVuY3Rpb24oZSl7cmV0dXJuIE9iamVjdC5hc3NpZ24oZSx7Im9uOmJlZ2luIjooZSxuKT0+e24uZGF0YS5fYmVnaW5NYXRjaD1lWzFdO30sIm9uOmVuZCI6KGUsbik9PntuLmRhdGEuX2JlZ2luTWF0Y2ghPT1lWzFdJiZuLmlnbm9yZU1hdGNoKCk7fX0pfX0pLE49Im9mIGFuZCBmb3IgaW4gbm90IG9yIGlmIHRoZW4iLnNwbGl0KCIgIik7ZnVuY3Rpb24gdyhlLG4pe3JldHVybiBuPytuOmZ1bmN0aW9uKGUpe3JldHVybiBOLmluY2x1ZGVzKGUudG9Mb3dlckNhc2UoKSl9KGUpPzA6MX1jb25zdCBSPXQseT1yLHtub2RlU3RyZWFtOmssbWVyZ2VTdHJlYW1zOk99PWksTT1TeW1ib2woIm5vbWF0Y2giKTtyZXR1cm4gZnVuY3Rpb24odCl7dmFyIGE9W10saT17fSxzPXt9LG89W10sbD10cnVlLGM9LyheKDxbXj5dKz58XHR8KSt8XG4pL2dtLGc9IkNvdWxkIG5vdCBmaW5kIHRoZSBsYW5ndWFnZSAne30nLCBkaWQgeW91IGZvcmdldCB0byBsb2FkL2luY2x1ZGUgYSBsYW5ndWFnZSBtb2R1bGU/Ijtjb25zdCBoPXtkaXNhYmxlQXV0b2RldGVjdDp0cnVlLG5hbWU6IlBsYWluIHRleHQiLGNvbnRhaW5zOltdfTt2YXIgZj17bm9IaWdobGlnaHRSZTovXihuby0/aGlnaGxpZ2h0KSQvaSxsYW5ndWFnZURldGVjdFJlOi9cYmxhbmcoPzp1YWdlKT8tKFtcdy1dKylcYi9pLGNsYXNzUHJlZml4OiJobGpzLSIsdGFiUmVwbGFjZTpudWxsLHVzZUJSOmZhbHNlLGxhbmd1YWdlczpudWxsLF9fZW1pdHRlcjp1fTtmdW5jdGlvbiBwKGUpe3JldHVybiBmLm5vSGlnaGxpZ2h0UmUudGVzdChlKX1mdW5jdGlvbiBiKGUsbix0LHIpe3ZhciBhPXtjb2RlOm4sbGFuZ3VhZ2U6ZX07UygiYmVmb3JlOmhpZ2hsaWdodCIsYSk7dmFyIGk9YS5yZXN1bHQ/YS5yZXN1bHQ6bShhLmxhbmd1YWdlLGEuY29kZSx0LHIpO3JldHVybiBpLmNvZGU9YS5jb2RlLFMoImFmdGVyOmhpZ2hsaWdodCIsaSksaX1mdW5jdGlvbiBtKGUsdCxhLHMpe3ZhciBvPXQ7ZnVuY3Rpb24gYyhlLG4pe3ZhciB0PUUuY2FzZV9pbnNlbnNpdGl2ZT9uWzBdLnRvTG93ZXJDYXNlKCk6blswXTtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGUua2V5d29yZHMsdCkmJmUua2V5d29yZHNbdF19ZnVuY3Rpb24gdSgpe251bGwhPXkuc3ViTGFuZ3VhZ2U/ZnVuY3Rpb24oKXtpZigiIiE9PUEpe3ZhciBlPW51bGw7aWYoInN0cmluZyI9PXR5cGVvZiB5LnN1Ykxhbmd1YWdlKXtpZighaVt5LnN1Ykxhbmd1YWdlXSlyZXR1cm4gdm9pZCBPLmFkZFRleHQoQSk7ZT1tKHkuc3ViTGFuZ3VhZ2UsQSx0cnVlLGtbeS5zdWJMYW5ndWFnZV0pLGtbeS5zdWJMYW5ndWFnZV09ZS50b3A7fWVsc2UgZT12KEEseS5zdWJMYW5ndWFnZS5sZW5ndGg/eS5zdWJMYW5ndWFnZTpudWxsKTt5LnJlbGV2YW5jZT4wJiYoSSs9ZS5yZWxldmFuY2UpLE8uYWRkU3VibGFuZ3VhZ2UoZS5lbWl0dGVyLGUubGFuZ3VhZ2UpO319KCk6ZnVuY3Rpb24oKXtpZigheS5rZXl3b3JkcylyZXR1cm4gdm9pZCBPLmFkZFRleHQoQSk7bGV0IGU9MDt5LmtleXdvcmRQYXR0ZXJuUmUubGFzdEluZGV4PTA7bGV0IG49eS5rZXl3b3JkUGF0dGVyblJlLmV4ZWMoQSksdD0iIjtmb3IoO247KXt0Kz1BLnN1YnN0cmluZyhlLG4uaW5kZXgpO2NvbnN0IHI9Yyh5LG4pO2lmKHIpe2NvbnN0W2UsYV09cjtPLmFkZFRleHQodCksdD0iIixJKz1hLE8uYWRkS2V5d29yZChuWzBdLGUpO31lbHNlIHQrPW5bMF07ZT15LmtleXdvcmRQYXR0ZXJuUmUubGFzdEluZGV4LG49eS5rZXl3b3JkUGF0dGVyblJlLmV4ZWMoQSk7fXQrPUEuc3Vic3RyKGUpLE8uYWRkVGV4dCh0KTt9KCksQT0iIjt9ZnVuY3Rpb24gaChlKXtyZXR1cm4gZS5jbGFzc05hbWUmJk8ub3Blbk5vZGUoZS5jbGFzc05hbWUpLHk9T2JqZWN0LmNyZWF0ZShlLHtwYXJlbnQ6e3ZhbHVlOnl9fSl9ZnVuY3Rpb24gcChlKXtyZXR1cm4gMD09PXkubWF0Y2hlci5yZWdleEluZGV4PyhBKz1lWzBdLDEpOihMPXRydWUsMCl9dmFyIGI9e307ZnVuY3Rpb24geCh0LHIpe3ZhciBpPXImJnJbMF07aWYoQSs9dCxudWxsPT1pKXJldHVybiB1KCksMDtpZigiYmVnaW4iPT09Yi50eXBlJiYiZW5kIj09PXIudHlwZSYmYi5pbmRleD09PXIuaW5kZXgmJiIiPT09aSl7aWYoQSs9by5zbGljZShyLmluZGV4LHIuaW5kZXgrMSksIWwpe2NvbnN0IG49RXJyb3IoIjAgd2lkdGggbWF0Y2ggcmVnZXgiKTt0aHJvdyBuLmxhbmd1YWdlTmFtZT1lLG4uYmFkUnVsZT1iLnJ1bGUsbn1yZXR1cm4gMX1pZihiPXIsImJlZ2luIj09PXIudHlwZSlyZXR1cm4gZnVuY3Rpb24oZSl7dmFyIHQ9ZVswXSxyPWUucnVsZTtjb25zdCBhPW5ldyBuKHIpLGk9W3IuX19iZWZvcmVCZWdpbixyWyJvbjpiZWdpbiJdXTtmb3IoY29uc3QgbiBvZiBpKWlmKG4mJihuKGUsYSksYS5pZ25vcmUpKXJldHVybiBwKHQpO3JldHVybiByJiZyLmVuZFNhbWVBc0JlZ2luJiYoci5lbmRSZT1SZWdFeHAodC5yZXBsYWNlKC9bLS9cXF4kKis/LigpfFtcXXt9XS9nLCJcXCQmIiksIm0iKSksci5za2lwP0ErPXQ6KHIuZXhjbHVkZUJlZ2luJiYoQSs9dCksdSgpLHIucmV0dXJuQmVnaW58fHIuZXhjbHVkZUJlZ2lufHwoQT10KSksaChyKSxyLnJldHVybkJlZ2luPzA6dC5sZW5ndGh9KHIpO2lmKCJpbGxlZ2FsIj09PXIudHlwZSYmIWEpe2NvbnN0IGU9RXJyb3IoJ0lsbGVnYWwgbGV4ZW1lICInK2krJyIgZm9yIG1vZGUgIicrKHkuY2xhc3NOYW1lfHwiPHVubmFtZWQ+IikrJyInKTt0aHJvdyBlLm1vZGU9eSxlfWlmKCJlbmQiPT09ci50eXBlKXt2YXIgcz1mdW5jdGlvbihlKXt2YXIgdD1lWzBdLHI9by5zdWJzdHIoZS5pbmRleCksYT1mdW5jdGlvbiBlKHQscixhKXtsZXQgaT1mdW5jdGlvbihlLG4pe3ZhciB0PWUmJmUuZXhlYyhuKTtyZXR1cm4gdCYmMD09PXQuaW5kZXh9KHQuZW5kUmUsYSk7aWYoaSl7aWYodFsib246ZW5kIl0pe2NvbnN0IGU9bmV3IG4odCk7dFsib246ZW5kIl0ocixlKSxlLmlnbm9yZSYmKGk9ZmFsc2UpO31pZihpKXtmb3IoO3QuZW5kc1BhcmVudCYmdC5wYXJlbnQ7KXQ9dC5wYXJlbnQ7cmV0dXJuIHR9fWlmKHQuZW5kc1dpdGhQYXJlbnQpcmV0dXJuIGUodC5wYXJlbnQscixhKX0oeSxlLHIpO2lmKCFhKXJldHVybiBNO3ZhciBpPXk7aS5za2lwP0ErPXQ6KGkucmV0dXJuRW5kfHxpLmV4Y2x1ZGVFbmR8fChBKz10KSx1KCksaS5leGNsdWRlRW5kJiYoQT10KSk7ZG97eS5jbGFzc05hbWUmJk8uY2xvc2VOb2RlKCkseS5za2lwfHx5LnN1Ykxhbmd1YWdlfHwoSSs9eS5yZWxldmFuY2UpLHk9eS5wYXJlbnQ7fXdoaWxlKHkhPT1hLnBhcmVudCk7cmV0dXJuIGEuc3RhcnRzJiYoYS5lbmRTYW1lQXNCZWdpbiYmKGEuc3RhcnRzLmVuZFJlPWEuZW5kUmUpLGgoYS5zdGFydHMpKSxpLnJldHVybkVuZD8wOnQubGVuZ3RofShyKTtpZihzIT09TSlyZXR1cm4gc31pZigiaWxsZWdhbCI9PT1yLnR5cGUmJiIiPT09aSlyZXR1cm4gMTtpZihCPjFlNSYmQj4zKnIuaW5kZXgpdGhyb3cgRXJyb3IoInBvdGVudGlhbCBpbmZpbml0ZSBsb29wLCB3YXkgbW9yZSBpdGVyYXRpb25zIHRoYW4gbWF0Y2hlcyIpO3JldHVybiBBKz1pLGkubGVuZ3RofXZhciBFPVQoZSk7aWYoIUUpdGhyb3cgY29uc29sZS5lcnJvcihnLnJlcGxhY2UoInt9IixlKSksRXJyb3IoJ1Vua25vd24gbGFuZ3VhZ2U6ICInK2UrJyInKTt2YXIgXz1mdW5jdGlvbihlKXtmdW5jdGlvbiBuKG4sdCl7cmV0dXJuIFJlZ0V4cChkKG4pLCJtIisoZS5jYXNlX2luc2Vuc2l0aXZlPyJpIjoiIikrKHQ/ImciOiIiKSl9Y2xhc3MgdHtjb25zdHJ1Y3Rvcigpe3RoaXMubWF0Y2hJbmRleGVzPXt9LHRoaXMucmVnZXhlcz1bXSx0aGlzLm1hdGNoQXQ9MSx0aGlzLnBvc2l0aW9uPTA7fWFkZFJ1bGUoZSxuKXtuLnBvc2l0aW9uPXRoaXMucG9zaXRpb24rKyx0aGlzLm1hdGNoSW5kZXhlc1t0aGlzLm1hdGNoQXRdPW4sdGhpcy5yZWdleGVzLnB1c2goW24sZV0pLHRoaXMubWF0Y2hBdCs9ZnVuY3Rpb24oZSl7cmV0dXJuIFJlZ0V4cChlLnRvU3RyaW5nKCkrInwiKS5leGVjKCIiKS5sZW5ndGgtMX0oZSkrMTt9Y29tcGlsZSgpezA9PT10aGlzLnJlZ2V4ZXMubGVuZ3RoJiYodGhpcy5leGVjPSgpPT5udWxsKTtjb25zdCBlPXRoaXMucmVnZXhlcy5tYXAoZT0+ZVsxXSk7dGhpcy5tYXRjaGVyUmU9bihmdW5jdGlvbihlLG49InwiKXtmb3IodmFyIHQ9L1xbKD86W15cXFxdXXxcXC4pKlxdfFwoXD8/fFxcKFsxLTldWzAtOV0qKXxcXC4vLHI9MCxhPSIiLGk9MDtpPGUubGVuZ3RoO2krKyl7dmFyIHM9cis9MSxvPWQoZVtpXSk7Zm9yKGk+MCYmKGErPW4pLGErPSIoIjtvLmxlbmd0aD4wOyl7dmFyIGw9dC5leGVjKG8pO2lmKG51bGw9PWwpe2ErPW87YnJlYWt9YSs9by5zdWJzdHJpbmcoMCxsLmluZGV4KSxvPW8uc3Vic3RyaW5nKGwuaW5kZXgrbFswXS5sZW5ndGgpLCJcXCI9PT1sWzBdWzBdJiZsWzFdP2ErPSJcXCIrKCtsWzFdK3MpOihhKz1sWzBdLCIoIj09PWxbMF0mJnIrKyk7fWErPSIpIjt9cmV0dXJuIGF9KGUpLHRydWUpLHRoaXMubGFzdEluZGV4PTA7fWV4ZWMoZSl7dGhpcy5tYXRjaGVyUmUubGFzdEluZGV4PXRoaXMubGFzdEluZGV4O2NvbnN0IG49dGhpcy5tYXRjaGVyUmUuZXhlYyhlKTtpZighbilyZXR1cm4gbnVsbDtjb25zdCB0PW4uZmluZEluZGV4KChlLG4pPT5uPjAmJnZvaWQgMCE9PWUpLHI9dGhpcy5tYXRjaEluZGV4ZXNbdF07cmV0dXJuIG4uc3BsaWNlKDAsdCksT2JqZWN0LmFzc2lnbihuLHIpfX1jbGFzcyBhe2NvbnN0cnVjdG9yKCl7dGhpcy5ydWxlcz1bXSx0aGlzLm11bHRpUmVnZXhlcz1bXSx0aGlzLmNvdW50PTAsdGhpcy5sYXN0SW5kZXg9MCx0aGlzLnJlZ2V4SW5kZXg9MDt9Z2V0TWF0Y2hlcihlKXtpZih0aGlzLm11bHRpUmVnZXhlc1tlXSlyZXR1cm4gdGhpcy5tdWx0aVJlZ2V4ZXNbZV07Y29uc3Qgbj1uZXcgdDtyZXR1cm4gdGhpcy5ydWxlcy5zbGljZShlKS5mb3JFYWNoKChbZSx0XSk9Pm4uYWRkUnVsZShlLHQpKSxuLmNvbXBpbGUoKSx0aGlzLm11bHRpUmVnZXhlc1tlXT1uLG59Y29uc2lkZXJBbGwoKXt0aGlzLnJlZ2V4SW5kZXg9MDt9YWRkUnVsZShlLG4pe3RoaXMucnVsZXMucHVzaChbZSxuXSksImJlZ2luIj09PW4udHlwZSYmdGhpcy5jb3VudCsrO31leGVjKGUpe2NvbnN0IG49dGhpcy5nZXRNYXRjaGVyKHRoaXMucmVnZXhJbmRleCk7bi5sYXN0SW5kZXg9dGhpcy5sYXN0SW5kZXg7Y29uc3QgdD1uLmV4ZWMoZSk7cmV0dXJuIHQmJih0aGlzLnJlZ2V4SW5kZXgrPXQucG9zaXRpb24rMSx0aGlzLnJlZ2V4SW5kZXg9PT10aGlzLmNvdW50JiYodGhpcy5yZWdleEluZGV4PTApKSx0fX1mdW5jdGlvbiBpKGUsbil7Y29uc3QgdD1lLmlucHV0W2UuaW5kZXgtMV0scj1lLmlucHV0W2UuaW5kZXgrZVswXS5sZW5ndGhdOyIuIiE9PXQmJiIuIiE9PXJ8fG4uaWdub3JlTWF0Y2goKTt9aWYoZS5jb250YWlucyYmZS5jb250YWlucy5pbmNsdWRlcygic2VsZiIpKXRocm93IEVycm9yKCJFUlI6IGNvbnRhaW5zIGBzZWxmYCBpcyBub3Qgc3VwcG9ydGVkIGF0IHRoZSB0b3AtbGV2ZWwgb2YgYSBsYW5ndWFnZS4gIFNlZSBkb2N1bWVudGF0aW9uLiIpO3JldHVybiBmdW5jdGlvbiB0KHMsbyl7Y29uc3QgbD1zO2lmKHMuY29tcGlsZWQpcmV0dXJuIGw7cy5jb21waWxlZD10cnVlLHMuX19iZWZvcmVCZWdpbj1udWxsLHMua2V5d29yZHM9cy5rZXl3b3Jkc3x8cy5iZWdpbktleXdvcmRzO2xldCBjPW51bGw7aWYoIm9iamVjdCI9PXR5cGVvZiBzLmtleXdvcmRzJiYoYz1zLmtleXdvcmRzLiRwYXR0ZXJuLGRlbGV0ZSBzLmtleXdvcmRzLiRwYXR0ZXJuKSxzLmtleXdvcmRzJiYocy5rZXl3b3Jkcz1mdW5jdGlvbihlLG4pe3ZhciB0PXt9O3JldHVybiAic3RyaW5nIj09dHlwZW9mIGU/cigia2V5d29yZCIsZSk6T2JqZWN0LmtleXMoZSkuZm9yRWFjaCgoZnVuY3Rpb24obil7cihuLGVbbl0pO30pKSx0O2Z1bmN0aW9uIHIoZSxyKXtuJiYocj1yLnRvTG93ZXJDYXNlKCkpLHIuc3BsaXQoIiAiKS5mb3JFYWNoKChmdW5jdGlvbihuKXt2YXIgcj1uLnNwbGl0KCJ8Iik7dFtyWzBdXT1bZSx3KHJbMF0sclsxXSldO30pKTt9fShzLmtleXdvcmRzLGUuY2FzZV9pbnNlbnNpdGl2ZSkpLHMubGV4ZW1lcyYmYyl0aHJvdyBFcnJvcigiRVJSOiBQcmVmZXIgYGtleXdvcmRzLiRwYXR0ZXJuYCB0byBgbW9kZS5sZXhlbWVzYCwgQk9USCBhcmUgbm90IGFsbG93ZWQuIChzZWUgbW9kZSByZWZlcmVuY2UpICIpO3JldHVybiBsLmtleXdvcmRQYXR0ZXJuUmU9bihzLmxleGVtZXN8fGN8fC9cdysvLHRydWUpLG8mJihzLmJlZ2luS2V5d29yZHMmJihzLmJlZ2luPSJcXGIoIitzLmJlZ2luS2V5d29yZHMuc3BsaXQoIiAiKS5qb2luKCJ8IikrIikoPz1cXGJ8XFxzKSIscy5fX2JlZm9yZUJlZ2luPWkpLHMuYmVnaW58fChzLmJlZ2luPS9cQnxcYi8pLGwuYmVnaW5SZT1uKHMuYmVnaW4pLHMuZW5kU2FtZUFzQmVnaW4mJihzLmVuZD1zLmJlZ2luKSxzLmVuZHx8cy5lbmRzV2l0aFBhcmVudHx8KHMuZW5kPS9cQnxcYi8pLHMuZW5kJiYobC5lbmRSZT1uKHMuZW5kKSksbC50ZXJtaW5hdG9yX2VuZD1kKHMuZW5kKXx8IiIscy5lbmRzV2l0aFBhcmVudCYmby50ZXJtaW5hdG9yX2VuZCYmKGwudGVybWluYXRvcl9lbmQrPShzLmVuZD8ifCI6IiIpK28udGVybWluYXRvcl9lbmQpKSxzLmlsbGVnYWwmJihsLmlsbGVnYWxSZT1uKHMuaWxsZWdhbCkpLHZvaWQgMD09PXMucmVsZXZhbmNlJiYocy5yZWxldmFuY2U9MSkscy5jb250YWluc3x8KHMuY29udGFpbnM9W10pLHMuY29udGFpbnM9W10uY29uY2F0KC4uLnMuY29udGFpbnMubWFwKChmdW5jdGlvbihlKXtyZXR1cm4gZnVuY3Rpb24oZSl7cmV0dXJuIGUudmFyaWFudHMmJiFlLmNhY2hlZF92YXJpYW50cyYmKGUuY2FjaGVkX3ZhcmlhbnRzPWUudmFyaWFudHMubWFwKChmdW5jdGlvbihuKXtyZXR1cm4gcihlLHt2YXJpYW50czpudWxsfSxuKX0pKSksZS5jYWNoZWRfdmFyaWFudHM/ZS5jYWNoZWRfdmFyaWFudHM6ZnVuY3Rpb24gZShuKXtyZXR1cm4gISFuJiYobi5lbmRzV2l0aFBhcmVudHx8ZShuLnN0YXJ0cykpfShlKT9yKGUse3N0YXJ0czplLnN0YXJ0cz9yKGUuc3RhcnRzKTpudWxsfSk6T2JqZWN0LmlzRnJvemVuKGUpP3IoZSk6ZX0oInNlbGYiPT09ZT9zOmUpfSkpKSxzLmNvbnRhaW5zLmZvckVhY2goKGZ1bmN0aW9uKGUpe3QoZSxsKTt9KSkscy5zdGFydHMmJnQocy5zdGFydHMsbyksbC5tYXRjaGVyPWZ1bmN0aW9uKGUpe2NvbnN0IG49bmV3IGE7cmV0dXJuIGUuY29udGFpbnMuZm9yRWFjaChlPT5uLmFkZFJ1bGUoZS5iZWdpbix7cnVsZTplLHR5cGU6ImJlZ2luIn0pKSxlLnRlcm1pbmF0b3JfZW5kJiZuLmFkZFJ1bGUoZS50ZXJtaW5hdG9yX2VuZCx7dHlwZToiZW5kIn0pLGUuaWxsZWdhbCYmbi5hZGRSdWxlKGUuaWxsZWdhbCx7dHlwZToiaWxsZWdhbCJ9KSxufShsKSxsfShlKX0oRSksTj0iIix5PXN8fF8saz17fSxPPW5ldyBmLl9fZW1pdHRlcihmKTshZnVuY3Rpb24oKXtmb3IodmFyIGU9W10sbj15O24hPT1FO249bi5wYXJlbnQpbi5jbGFzc05hbWUmJmUudW5zaGlmdChuLmNsYXNzTmFtZSk7ZS5mb3JFYWNoKGU9Pk8ub3Blbk5vZGUoZSkpO30oKTt2YXIgQT0iIixJPTAsUz0wLEI9MCxMPWZhbHNlO3RyeXtmb3IoeS5tYXRjaGVyLmNvbnNpZGVyQWxsKCk7Oyl7QisrLEw/TD0hMTooeS5tYXRjaGVyLmxhc3RJbmRleD1TLHkubWF0Y2hlci5jb25zaWRlckFsbCgpKTtjb25zdCBlPXkubWF0Y2hlci5leGVjKG8pO2lmKCFlKWJyZWFrO2NvbnN0IG49eChvLnN1YnN0cmluZyhTLGUuaW5kZXgpLGUpO1M9ZS5pbmRleCtuO31yZXR1cm4geChvLnN1YnN0cihTKSksTy5jbG9zZUFsbE5vZGVzKCksTy5maW5hbGl6ZSgpLE49Ty50b0hUTUwoKSx7cmVsZXZhbmNlOkksdmFsdWU6TixsYW5ndWFnZTplLGlsbGVnYWw6ITEsZW1pdHRlcjpPLHRvcDp5fX1jYXRjaChuKXtpZihuLm1lc3NhZ2UmJm4ubWVzc2FnZS5pbmNsdWRlcygiSWxsZWdhbCIpKXJldHVybiB7aWxsZWdhbDp0cnVlLGlsbGVnYWxCeTp7bXNnOm4ubWVzc2FnZSxjb250ZXh0Om8uc2xpY2UoUy0xMDAsUysxMDApLG1vZGU6bi5tb2RlfSxzb2ZhcjpOLHJlbGV2YW5jZTowLHZhbHVlOlIobyksZW1pdHRlcjpPfTtpZihsKXJldHVybiB7aWxsZWdhbDpmYWxzZSxyZWxldmFuY2U6MCx2YWx1ZTpSKG8pLGVtaXR0ZXI6TyxsYW5ndWFnZTplLHRvcDp5LGVycm9yUmFpc2VkOm59O3Rocm93IG59fWZ1bmN0aW9uIHYoZSxuKXtuPW58fGYubGFuZ3VhZ2VzfHxPYmplY3Qua2V5cyhpKTt2YXIgdD1mdW5jdGlvbihlKXtjb25zdCBuPXtyZWxldmFuY2U6MCxlbWl0dGVyOm5ldyBmLl9fZW1pdHRlcihmKSx2YWx1ZTpSKGUpLGlsbGVnYWw6ZmFsc2UsdG9wOmh9O3JldHVybiBuLmVtaXR0ZXIuYWRkVGV4dChlKSxufShlKSxyPXQ7cmV0dXJuIG4uZmlsdGVyKFQpLmZpbHRlcihJKS5mb3JFYWNoKChmdW5jdGlvbihuKXt2YXIgYT1tKG4sZSxmYWxzZSk7YS5sYW5ndWFnZT1uLGEucmVsZXZhbmNlPnIucmVsZXZhbmNlJiYocj1hKSxhLnJlbGV2YW5jZT50LnJlbGV2YW5jZSYmKHI9dCx0PWEpO30pKSxyLmxhbmd1YWdlJiYodC5zZWNvbmRfYmVzdD1yKSx0fWZ1bmN0aW9uIHgoZSl7cmV0dXJuIGYudGFiUmVwbGFjZXx8Zi51c2VCUj9lLnJlcGxhY2UoYyxlPT4iXG4iPT09ZT9mLnVzZUJSPyI8YnI+IjplOmYudGFiUmVwbGFjZT9lLnJlcGxhY2UoL1x0L2csZi50YWJSZXBsYWNlKTplKTplfWZ1bmN0aW9uIEUoZSl7bGV0IG49bnVsbDtjb25zdCB0PWZ1bmN0aW9uKGUpe3ZhciBuPWUuY2xhc3NOYW1lKyIgIjtuKz1lLnBhcmVudE5vZGU/ZS5wYXJlbnROb2RlLmNsYXNzTmFtZToiIjtjb25zdCB0PWYubGFuZ3VhZ2VEZXRlY3RSZS5leGVjKG4pO2lmKHQpe3ZhciByPVQodFsxXSk7cmV0dXJuIHJ8fChjb25zb2xlLndhcm4oZy5yZXBsYWNlKCJ7fSIsdFsxXSkpLGNvbnNvbGUud2FybigiRmFsbGluZyBiYWNrIHRvIG5vLWhpZ2hsaWdodCBtb2RlIGZvciB0aGlzIGJsb2NrLiIsZSkpLHI/dFsxXToibm8taGlnaGxpZ2h0In1yZXR1cm4gbi5zcGxpdCgvXHMrLykuZmluZChlPT5wKGUpfHxUKGUpKX0oZSk7aWYocCh0KSlyZXR1cm47UygiYmVmb3JlOmhpZ2hsaWdodEJsb2NrIix7YmxvY2s6ZSxsYW5ndWFnZTp0fSksZi51c2VCUj8obj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCJkaXYiKSkuaW5uZXJIVE1MPWUuaW5uZXJIVE1MLnJlcGxhY2UoL1xuL2csIiIpLnJlcGxhY2UoLzxiclsgL10qPi9nLCJcbiIpOm49ZTtjb25zdCByPW4udGV4dENvbnRlbnQsYT10P2IodCxyLHRydWUpOnYociksaT1rKG4pO2lmKGkubGVuZ3RoKXtjb25zdCBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoImRpdiIpO2UuaW5uZXJIVE1MPWEudmFsdWUsYS52YWx1ZT1PKGksayhlKSxyKTt9YS52YWx1ZT14KGEudmFsdWUpLFMoImFmdGVyOmhpZ2hsaWdodEJsb2NrIix7YmxvY2s6ZSxyZXN1bHQ6YX0pLGUuaW5uZXJIVE1MPWEudmFsdWUsZS5jbGFzc05hbWU9ZnVuY3Rpb24oZSxuLHQpe3ZhciByPW4/c1tuXTp0LGE9W2UudHJpbSgpXTtyZXR1cm4gZS5tYXRjaCgvXGJobGpzXGIvKXx8YS5wdXNoKCJobGpzIiksZS5pbmNsdWRlcyhyKXx8YS5wdXNoKHIpLGEuam9pbigiICIpLnRyaW0oKX0oZS5jbGFzc05hbWUsdCxhLmxhbmd1YWdlKSxlLnJlc3VsdD17bGFuZ3VhZ2U6YS5sYW5ndWFnZSxyZTphLnJlbGV2YW5jZSxyZWxhdmFuY2U6YS5yZWxldmFuY2V9LGEuc2Vjb25kX2Jlc3QmJihlLnNlY29uZF9iZXN0PXtsYW5ndWFnZTphLnNlY29uZF9iZXN0Lmxhbmd1YWdlLHJlOmEuc2Vjb25kX2Jlc3QucmVsZXZhbmNlLHJlbGF2YW5jZTphLnNlY29uZF9iZXN0LnJlbGV2YW5jZX0pO31jb25zdCBOPSgpPT57aWYoIU4uY2FsbGVkKXtOLmNhbGxlZD10cnVlO3ZhciBlPWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoInByZSBjb2RlIik7YS5mb3JFYWNoLmNhbGwoZSxFKTt9fTtmdW5jdGlvbiBUKGUpe3JldHVybiBlPShlfHwiIikudG9Mb3dlckNhc2UoKSxpW2VdfHxpW3NbZV1dfWZ1bmN0aW9uIEEoZSx7bGFuZ3VhZ2VOYW1lOm59KXsic3RyaW5nIj09dHlwZW9mIGUmJihlPVtlXSksZS5mb3JFYWNoKGU9PntzW2VdPW47fSk7fWZ1bmN0aW9uIEkoZSl7dmFyIG49VChlKTtyZXR1cm4gbiYmIW4uZGlzYWJsZUF1dG9kZXRlY3R9ZnVuY3Rpb24gUyhlLG4pe3ZhciB0PWU7by5mb3JFYWNoKChmdW5jdGlvbihlKXtlW3RdJiZlW3RdKG4pO30pKTt9T2JqZWN0LmFzc2lnbih0LHtoaWdobGlnaHQ6YixoaWdobGlnaHRBdXRvOnYsZml4TWFya3VwOngsaGlnaGxpZ2h0QmxvY2s6RSxjb25maWd1cmU6ZnVuY3Rpb24oZSl7Zj15KGYsZSk7fSxpbml0SGlnaGxpZ2h0aW5nOk4saW5pdEhpZ2hsaWdodGluZ09uTG9hZDpmdW5jdGlvbigpe3dpbmRvdy5hZGRFdmVudExpc3RlbmVyKCJET01Db250ZW50TG9hZGVkIixOLGZhbHNlKTt9LHJlZ2lzdGVyTGFuZ3VhZ2U6ZnVuY3Rpb24oZSxuKXt2YXIgcj1udWxsO3RyeXtyPW4odCk7fWNhdGNoKG4pe2lmKGNvbnNvbGUuZXJyb3IoIkxhbmd1YWdlIGRlZmluaXRpb24gZm9yICd7fScgY291bGQgbm90IGJlIHJlZ2lzdGVyZWQuIi5yZXBsYWNlKCJ7fSIsZSkpLCFsKXRocm93IG47Y29uc29sZS5lcnJvcihuKSxyPWg7fXIubmFtZXx8KHIubmFtZT1lKSxpW2VdPXIsci5yYXdEZWZpbml0aW9uPW4uYmluZChudWxsLHQpLHIuYWxpYXNlcyYmQShyLmFsaWFzZXMse2xhbmd1YWdlTmFtZTplfSk7fSxsaXN0TGFuZ3VhZ2VzOmZ1bmN0aW9uKCl7cmV0dXJuIE9iamVjdC5rZXlzKGkpfSxnZXRMYW5ndWFnZTpULHJlZ2lzdGVyQWxpYXNlczpBLHJlcXVpcmVMYW5ndWFnZTpmdW5jdGlvbihlKXt2YXIgbj1UKGUpO2lmKG4pcmV0dXJuIG47dGhyb3cgRXJyb3IoIlRoZSAne30nIGxhbmd1YWdlIGlzIHJlcXVpcmVkLCBidXQgbm90IGxvYWRlZC4iLnJlcGxhY2UoInt9IixlKSl9LGF1dG9EZXRlY3Rpb246SSxpbmhlcml0OnksYWRkUGx1Z2luOmZ1bmN0aW9uKGUpe28ucHVzaChlKTt9fSksdC5kZWJ1Z01vZGU9ZnVuY3Rpb24oKXtsPWZhbHNlO30sdC5zYWZlTW9kZT1mdW5jdGlvbigpe2w9dHJ1ZTt9LHQudmVyc2lvblN0cmluZz0iMTAuMS4wIjtmb3IoY29uc3QgbiBpbiBfKSJvYmplY3QiPT10eXBlb2YgX1tuXSYmZShfW25dKTtyZXR1cm4gT2JqZWN0LmFzc2lnbih0LF8pLHR9KHt9KX0oKTsib2JqZWN0Ij09dHlwZW9mIGV4cG9ydHMmJiJ1bmRlZmluZWQiIT10eXBlb2YgbW9kdWxlJiYobW9kdWxlLmV4cG9ydHM9aGxqcyk7CglobGpzLnJlZ2lzdGVyTGFuZ3VhZ2UoImNzcyIsZnVuY3Rpb24oKXtyZXR1cm4gZnVuY3Rpb24oZSl7dmFyIG49e2JlZ2luOi8oPzpbQS1aXF9cLlwtXSt8LS1bYS16QS1aMC05Xy1dKylccyo6LyxyZXR1cm5CZWdpbjp0cnVlLGVuZDoiOyIsZW5kc1dpdGhQYXJlbnQ6dHJ1ZSxjb250YWluczpbe2NsYXNzTmFtZToiYXR0cmlidXRlIixiZWdpbjovXFMvLGVuZDoiOiIsZXhjbHVkZUVuZDp0cnVlLHN0YXJ0czp7ZW5kc1dpdGhQYXJlbnQ6dHJ1ZSxleGNsdWRlRW5kOnRydWUsY29udGFpbnM6W3tiZWdpbjovW1x3LV0rXCgvLHJldHVybkJlZ2luOnRydWUsY29udGFpbnM6W3tjbGFzc05hbWU6ImJ1aWx0X2luIixiZWdpbjovW1x3LV0rL30se2JlZ2luOi9cKC8sZW5kOi9cKS8sY29udGFpbnM6W2UuQVBPU19TVFJJTkdfTU9ERSxlLlFVT1RFX1NUUklOR19NT0RFLGUuQ1NTX05VTUJFUl9NT0RFXX1dfSxlLkNTU19OVU1CRVJfTU9ERSxlLlFVT1RFX1NUUklOR19NT0RFLGUuQVBPU19TVFJJTkdfTU9ERSxlLkNfQkxPQ0tfQ09NTUVOVF9NT0RFLHtjbGFzc05hbWU6Im51bWJlciIsYmVnaW46IiNbMC05QS1GYS1mXSsifSx7Y2xhc3NOYW1lOiJtZXRhIixiZWdpbjoiIWltcG9ydGFudCJ9XX19XX07cmV0dXJuIHtuYW1lOiJDU1MiLGNhc2VfaW5zZW5zaXRpdmU6dHJ1ZSxpbGxlZ2FsOi9bPVwvfCdcJF0vLGNvbnRhaW5zOltlLkNfQkxPQ0tfQ09NTUVOVF9NT0RFLHtjbGFzc05hbWU6InNlbGVjdG9yLWlkIixiZWdpbjovI1tBLVphLXowLTlfLV0rL30se2NsYXNzTmFtZToic2VsZWN0b3ItY2xhc3MiLGJlZ2luOi9cLltBLVphLXowLTlfLV0rL30se2NsYXNzTmFtZToic2VsZWN0b3ItYXR0ciIsYmVnaW46L1xbLyxlbmQ6L1xdLyxpbGxlZ2FsOiIkIixjb250YWluczpbZS5BUE9TX1NUUklOR19NT0RFLGUuUVVPVEVfU1RSSU5HX01PREVdfSx7Y2xhc3NOYW1lOiJzZWxlY3Rvci1wc2V1ZG8iLGJlZ2luOi86KDopP1thLXpBLVowLTlcX1wtXCtcKFwpIicuXSsvfSx7YmVnaW46IkAocGFnZXxmb250LWZhY2UpIixsZXhlbWVzOiJAW2Etei1dKyIsa2V5d29yZHM6IkBwYWdlIEBmb250LWZhY2UifSx7YmVnaW46IkAiLGVuZDoiW3s7XSIsaWxsZWdhbDovOi8scmV0dXJuQmVnaW46dHJ1ZSxjb250YWluczpbe2NsYXNzTmFtZToia2V5d29yZCIsYmVnaW46L0BcLT9cd1tcd10qKFwtXHcrKSovfSx7YmVnaW46L1xzLyxlbmRzV2l0aFBhcmVudDp0cnVlLGV4Y2x1ZGVFbmQ6dHJ1ZSxyZWxldmFuY2U6MCxrZXl3b3JkczoiYW5kIG9yIG5vdCBvbmx5Iixjb250YWluczpbe2JlZ2luOi9bYS16LV0rOi8sY2xhc3NOYW1lOiJhdHRyaWJ1dGUifSxlLkFQT1NfU1RSSU5HX01PREUsZS5RVU9URV9TVFJJTkdfTU9ERSxlLkNTU19OVU1CRVJfTU9ERV19XX0se2NsYXNzTmFtZToic2VsZWN0b3ItdGFnIixiZWdpbjoiW2EtekEtWi1dW2EtekEtWjAtOV8tXSoiLHJlbGV2YW5jZTowfSx7YmVnaW46InsiLGVuZDoifSIsaWxsZWdhbDovXFMvLGNvbnRhaW5zOltlLkNfQkxPQ0tfQ09NTUVOVF9NT0RFLG5dfV19fX0oKSk7CglobGpzLnJlZ2lzdGVyTGFuZ3VhZ2UoImRpZmYiLGZ1bmN0aW9uKCl7cmV0dXJuIGZ1bmN0aW9uKGUpe3JldHVybiB7bmFtZToiRGlmZiIsYWxpYXNlczpbInBhdGNoIl0sY29udGFpbnM6W3tjbGFzc05hbWU6Im1ldGEiLHJlbGV2YW5jZToxMCx2YXJpYW50czpbe2JlZ2luOi9eQEAgK1wtXGQrLFxkKyArXCtcZCssXGQrICtAQCQvfSx7YmVnaW46L15cKlwqXCogK1xkKyxcZCsgK1wqXCpcKlwqJC99LHtiZWdpbjovXlwtXC1cLSArXGQrLFxkKyArXC1cLVwtXC0kL31dfSx7Y2xhc3NOYW1lOiJjb21tZW50Iix2YXJpYW50czpbe2JlZ2luOi9JbmRleDogLyxlbmQ6LyQvfSx7YmVnaW46Lz17Myx9LyxlbmQ6LyQvfSx7YmVnaW46L15cLXszfS8sZW5kOi8kL30se2JlZ2luOi9eXCp7M30gLyxlbmQ6LyQvfSx7YmVnaW46L15cK3szfS8sZW5kOi8kL30se2JlZ2luOi9eXCp7MTV9JC99XX0se2NsYXNzTmFtZToiYWRkaXRpb24iLGJlZ2luOiJeXFwrIixlbmQ6IiQifSx7Y2xhc3NOYW1lOiJkZWxldGlvbiIsYmVnaW46Il5cXC0iLGVuZDoiJCJ9LHtjbGFzc05hbWU6ImFkZGl0aW9uIixiZWdpbjoiXlxcISIsZW5kOiIkIn1dfX19KCkpOwoJaGxqcy5yZWdpc3Rlckxhbmd1YWdlKCJqYXZhc2NyaXB0IixmdW5jdGlvbigpe2NvbnN0IGU9WyJhcyIsImluIiwib2YiLCJpZiIsImZvciIsIndoaWxlIiwiZmluYWxseSIsInZhciIsIm5ldyIsImZ1bmN0aW9uIiwiZG8iLCJyZXR1cm4iLCJ2b2lkIiwiZWxzZSIsImJyZWFrIiwiY2F0Y2giLCJpbnN0YW5jZW9mIiwid2l0aCIsInRocm93IiwiY2FzZSIsImRlZmF1bHQiLCJ0cnkiLCJzd2l0Y2giLCJjb250aW51ZSIsInR5cGVvZiIsImRlbGV0ZSIsImxldCIsInlpZWxkIiwiY29uc3QiLCJjbGFzcyIsImRlYnVnZ2VyIiwiYXN5bmMiLCJhd2FpdCIsInN0YXRpYyIsImltcG9ydCIsImZyb20iLCJleHBvcnQiLCJleHRlbmRzIl0sbj1bInRydWUiLCJmYWxzZSIsIm51bGwiLCJ1bmRlZmluZWQiLCJOYU4iLCJJbmZpbml0eSJdLGE9W10uY29uY2F0KFsic2V0SW50ZXJ2YWwiLCJzZXRUaW1lb3V0IiwiY2xlYXJJbnRlcnZhbCIsImNsZWFyVGltZW91dCIsInJlcXVpcmUiLCJleHBvcnRzIiwiZXZhbCIsImlzRmluaXRlIiwiaXNOYU4iLCJwYXJzZUZsb2F0IiwicGFyc2VJbnQiLCJkZWNvZGVVUkkiLCJkZWNvZGVVUklDb21wb25lbnQiLCJlbmNvZGVVUkkiLCJlbmNvZGVVUklDb21wb25lbnQiLCJlc2NhcGUiLCJ1bmVzY2FwZSJdLFsiYXJndW1lbnRzIiwidGhpcyIsInN1cGVyIiwiY29uc29sZSIsIndpbmRvdyIsImRvY3VtZW50IiwibG9jYWxTdG9yYWdlIiwibW9kdWxlIiwiZ2xvYmFsIl0sWyJJbnRsIiwiRGF0YVZpZXciLCJOdW1iZXIiLCJNYXRoIiwiRGF0ZSIsIlN0cmluZyIsIlJlZ0V4cCIsIk9iamVjdCIsIkZ1bmN0aW9uIiwiQm9vbGVhbiIsIkVycm9yIiwiU3ltYm9sIiwiU2V0IiwiTWFwIiwiV2Vha1NldCIsIldlYWtNYXAiLCJQcm94eSIsIlJlZmxlY3QiLCJKU09OIiwiUHJvbWlzZSIsIkZsb2F0NjRBcnJheSIsIkludDE2QXJyYXkiLCJJbnQzMkFycmF5IiwiSW50OEFycmF5IiwiVWludDE2QXJyYXkiLCJVaW50MzJBcnJheSIsIkZsb2F0MzJBcnJheSIsIkFycmF5IiwiVWludDhBcnJheSIsIlVpbnQ4Q2xhbXBlZEFycmF5IiwiQXJyYXlCdWZmZXIiXSxbIkV2YWxFcnJvciIsIkludGVybmFsRXJyb3IiLCJSYW5nZUVycm9yIiwiUmVmZXJlbmNlRXJyb3IiLCJTeW50YXhFcnJvciIsIlR5cGVFcnJvciIsIlVSSUVycm9yIl0pO2Z1bmN0aW9uIHMoZSl7cmV0dXJuIHIoIig/PSIsZSwiKSIpfWZ1bmN0aW9uIHIoLi4uZSl7cmV0dXJuIGUubWFwKGU9PihmdW5jdGlvbihlKXtyZXR1cm4gZT8ic3RyaW5nIj09dHlwZW9mIGU/ZTplLnNvdXJjZTpudWxsfSkoZSkpLmpvaW4oIiIpfXJldHVybiBmdW5jdGlvbih0KXt2YXIgaT0iW0EtWmEteiRfXVswLTlBLVphLXokX10qIixjPXtiZWdpbjovPFtBLVphLXowLTlcXC5fOi1dKy8sZW5kOi9cL1tBLVphLXowLTlcXC5fOi1dKz58XC8+L30sbz17JHBhdHRlcm46IltBLVphLXokX11bMC05QS1aYS16JF9dKiIsa2V5d29yZDplLmpvaW4oIiAiKSxsaXRlcmFsOm4uam9pbigiICIpLGJ1aWx0X2luOmEuam9pbigiICIpfSxsPXtjbGFzc05hbWU6Im51bWJlciIsdmFyaWFudHM6W3tiZWdpbjoiXFxiKDBbYkJdWzAxXSspbj8ifSx7YmVnaW46IlxcYigwW29PXVswLTddKyluPyJ9LHtiZWdpbjp0LkNfTlVNQkVSX1JFKyJuPyJ9XSxyZWxldmFuY2U6MH0sRT17Y2xhc3NOYW1lOiJzdWJzdCIsYmVnaW46IlxcJFxceyIsZW5kOiJcXH0iLGtleXdvcmRzOm8sY29udGFpbnM6W119LGQ9e2JlZ2luOiJodG1sYCIsZW5kOiIiLHN0YXJ0czp7ZW5kOiJgIixyZXR1cm5FbmQ6ZmFsc2UsY29udGFpbnM6W3QuQkFDS1NMQVNIX0VTQ0FQRSxFXSxzdWJMYW5ndWFnZToieG1sIn19LGc9e2JlZ2luOiJjc3NgIixlbmQ6IiIsc3RhcnRzOntlbmQ6ImAiLHJldHVybkVuZDpmYWxzZSxjb250YWluczpbdC5CQUNLU0xBU0hfRVNDQVBFLEVdLHN1Ykxhbmd1YWdlOiJjc3MifX0sdT17Y2xhc3NOYW1lOiJzdHJpbmciLGJlZ2luOiJgIixlbmQ6ImAiLGNvbnRhaW5zOlt0LkJBQ0tTTEFTSF9FU0NBUEUsRV19O0UuY29udGFpbnM9W3QuQVBPU19TVFJJTkdfTU9ERSx0LlFVT1RFX1NUUklOR19NT0RFLGQsZyx1LGwsdC5SRUdFWFBfTU9ERV07dmFyIGI9RS5jb250YWlucy5jb25jYXQoW3tiZWdpbjovXCgvLGVuZDovXCkvLGNvbnRhaW5zOlsic2VsZiJdLmNvbmNhdChFLmNvbnRhaW5zLFt0LkNfQkxPQ0tfQ09NTUVOVF9NT0RFLHQuQ19MSU5FX0NPTU1FTlRfTU9ERV0pfSx0LkNfQkxPQ0tfQ09NTUVOVF9NT0RFLHQuQ19MSU5FX0NPTU1FTlRfTU9ERV0pLF89e2NsYXNzTmFtZToicGFyYW1zIixiZWdpbjovXCgvLGVuZDovXCkvLGV4Y2x1ZGVCZWdpbjp0cnVlLGV4Y2x1ZGVFbmQ6dHJ1ZSxjb250YWluczpifTtyZXR1cm4ge25hbWU6IkphdmFTY3JpcHQiLGFsaWFzZXM6WyJqcyIsImpzeCIsIm1qcyIsImNqcyJdLGtleXdvcmRzOm8sY29udGFpbnM6W3QuU0hFQkFORyh7YmluYXJ5OiJub2RlIixyZWxldmFuY2U6NX0pLHtjbGFzc05hbWU6Im1ldGEiLHJlbGV2YW5jZToxMCxiZWdpbjovXlxzKlsnIl11c2UgKHN0cmljdHxhc20pWyciXS99LHQuQVBPU19TVFJJTkdfTU9ERSx0LlFVT1RFX1NUUklOR19NT0RFLGQsZyx1LHQuQ19MSU5FX0NPTU1FTlRfTU9ERSx0LkNPTU1FTlQoIi9cXCpcXCoiLCJcXCovIix7cmVsZXZhbmNlOjAsY29udGFpbnM6W3tjbGFzc05hbWU6ImRvY3RhZyIsYmVnaW46IkBbQS1aYS16XSsiLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJ0eXBlIixiZWdpbjoiXFx7IixlbmQ6IlxcfSIscmVsZXZhbmNlOjB9LHtjbGFzc05hbWU6InZhcmlhYmxlIixiZWdpbjppKyIoPz1cXHMqKC0pfCQpIixlbmRzUGFyZW50OnRydWUscmVsZXZhbmNlOjB9LHtiZWdpbjovKD89W15cbl0pXHMvLHJlbGV2YW5jZTowfV19XX0pLHQuQ19CTE9DS19DT01NRU5UX01PREUsbCx7YmVnaW46cigvW3ssXG5dXHMqLyxzKHIoLygoKFwvXC8uKil8KFwvXCooLnxcbikqXCpcLykpXHMqKSovLGkrIlxccyo6IikpKSxyZWxldmFuY2U6MCxjb250YWluczpbe2NsYXNzTmFtZToiYXR0ciIsYmVnaW46aStzKCJcXHMqOiIpLHJlbGV2YW5jZTowfV19LHtiZWdpbjoiKCIrdC5SRV9TVEFSVEVSU19SRSsifFxcYihjYXNlfHJldHVybnx0aHJvdylcXGIpXFxzKiIsa2V5d29yZHM6InJldHVybiB0aHJvdyBjYXNlIixjb250YWluczpbdC5DX0xJTkVfQ09NTUVOVF9NT0RFLHQuQ19CTE9DS19DT01NRU5UX01PREUsdC5SRUdFWFBfTU9ERSx7Y2xhc3NOYW1lOiJmdW5jdGlvbiIsYmVnaW46IihcXChbXihdKihcXChbXihdKihcXChbXihdKlxcKSk/XFwpKT9cXCl8Iit0LlVOREVSU0NPUkVfSURFTlRfUkUrIilcXHMqPT4iLHJldHVybkJlZ2luOnRydWUsZW5kOiJcXHMqPT4iLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJwYXJhbXMiLHZhcmlhbnRzOlt7YmVnaW46dC5VTkRFUlNDT1JFX0lERU5UX1JFfSx7Y2xhc3NOYW1lOm51bGwsYmVnaW46L1woXHMqXCkvLHNraXA6dHJ1ZX0se2JlZ2luOi9cKC8sZW5kOi9cKS8sZXhjbHVkZUJlZ2luOnRydWUsZXhjbHVkZUVuZDp0cnVlLGtleXdvcmRzOm8sY29udGFpbnM6Yn1dfV19LHtiZWdpbjovLC8scmVsZXZhbmNlOjB9LHtjbGFzc05hbWU6IiIsYmVnaW46L1xzLyxlbmQ6L1xzKi8sc2tpcDp0cnVlfSx7dmFyaWFudHM6W3tiZWdpbjoiPD4iLGVuZDoiPC8+In0se2JlZ2luOmMuYmVnaW4sZW5kOmMuZW5kfV0sc3ViTGFuZ3VhZ2U6InhtbCIsY29udGFpbnM6W3tiZWdpbjpjLmJlZ2luLGVuZDpjLmVuZCxza2lwOnRydWUsY29udGFpbnM6WyJzZWxmIl19XX1dLHJlbGV2YW5jZTowfSx7Y2xhc3NOYW1lOiJmdW5jdGlvbiIsYmVnaW5LZXl3b3JkczoiZnVuY3Rpb24iLGVuZDovXHsvLGV4Y2x1ZGVFbmQ6dHJ1ZSxjb250YWluczpbdC5pbmhlcml0KHQuVElUTEVfTU9ERSx7YmVnaW46aX0pLF9dLGlsbGVnYWw6L1xbfCUvfSx7YmVnaW46L1wkWyguXS99LHQuTUVUSE9EX0dVQVJELHtjbGFzc05hbWU6ImNsYXNzIixiZWdpbktleXdvcmRzOiJjbGFzcyIsZW5kOi9bezs9XS8sZXhjbHVkZUVuZDp0cnVlLGlsbGVnYWw6L1s6IlxbXF1dLyxjb250YWluczpbe2JlZ2luS2V5d29yZHM6ImV4dGVuZHMifSx0LlVOREVSU0NPUkVfVElUTEVfTU9ERV19LHtiZWdpbktleXdvcmRzOiJjb25zdHJ1Y3RvciIsZW5kOi9cey8sZXhjbHVkZUVuZDp0cnVlfSx7YmVnaW46IihnZXR8c2V0KVxccysoPz0iK2krIlxcKCkiLGVuZDovey8sa2V5d29yZHM6ImdldCBzZXQiLGNvbnRhaW5zOlt0LmluaGVyaXQodC5USVRMRV9NT0RFLHtiZWdpbjppfSkse2JlZ2luOi9cKFwpL30sX119XSxpbGxlZ2FsOi8jKD8hISkvfX19KCkpOwoJaGxqcy5yZWdpc3Rlckxhbmd1YWdlKCJqc29uIixmdW5jdGlvbigpe3JldHVybiBmdW5jdGlvbihuKXt2YXIgZT17bGl0ZXJhbDoidHJ1ZSBmYWxzZSBudWxsIn0saT1bbi5DX0xJTkVfQ09NTUVOVF9NT0RFLG4uQ19CTE9DS19DT01NRU5UX01PREVdLHQ9W24uUVVPVEVfU1RSSU5HX01PREUsbi5DX05VTUJFUl9NT0RFXSxhPXtlbmQ6IiwiLGVuZHNXaXRoUGFyZW50OnRydWUsZXhjbHVkZUVuZDp0cnVlLGNvbnRhaW5zOnQsa2V5d29yZHM6ZX0sbD17YmVnaW46InsiLGVuZDoifSIsY29udGFpbnM6W3tjbGFzc05hbWU6ImF0dHIiLGJlZ2luOi8iLyxlbmQ6LyIvLGNvbnRhaW5zOltuLkJBQ0tTTEFTSF9FU0NBUEVdLGlsbGVnYWw6IlxcbiJ9LG4uaW5oZXJpdChhLHtiZWdpbjovOi99KV0uY29uY2F0KGkpLGlsbGVnYWw6IlxcUyJ9LHM9e2JlZ2luOiJcXFsiLGVuZDoiXFxdIixjb250YWluczpbbi5pbmhlcml0KGEpXSxpbGxlZ2FsOiJcXFMifTtyZXR1cm4gdC5wdXNoKGwscyksaS5mb3JFYWNoKChmdW5jdGlvbihuKXt0LnB1c2gobik7fSkpLHtuYW1lOiJKU09OIixjb250YWluczp0LGtleXdvcmRzOmUsaWxsZWdhbDoiXFxTIn19fSgpKTsKCWhsanMucmVnaXN0ZXJMYW5ndWFnZSgieG1sIixmdW5jdGlvbigpe3JldHVybiBmdW5jdGlvbihlKXt2YXIgbj17Y2xhc3NOYW1lOiJzeW1ib2wiLGJlZ2luOiImW2Etel0rO3wmI1swLTldKzt8JiN4W2EtZjAtOV0rOyJ9LGE9e2JlZ2luOiJcXHMiLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJtZXRhLWtleXdvcmQiLGJlZ2luOiIjP1thLXpfXVthLXoxLTlfLV0rIixpbGxlZ2FsOiJcXG4ifV19LHM9ZS5pbmhlcml0KGEse2JlZ2luOiJcXCgiLGVuZDoiXFwpIn0pLHQ9ZS5pbmhlcml0KGUuQVBPU19TVFJJTkdfTU9ERSx7Y2xhc3NOYW1lOiJtZXRhLXN0cmluZyJ9KSxpPWUuaW5oZXJpdChlLlFVT1RFX1NUUklOR19NT0RFLHtjbGFzc05hbWU6Im1ldGEtc3RyaW5nIn0pLGM9e2VuZHNXaXRoUGFyZW50OnRydWUsaWxsZWdhbDovPC8scmVsZXZhbmNlOjAsY29udGFpbnM6W3tjbGFzc05hbWU6ImF0dHIiLGJlZ2luOiJbQS1aYS16MC05XFwuXzotXSsiLHJlbGV2YW5jZTowfSx7YmVnaW46Lz1ccyovLHJlbGV2YW5jZTowLGNvbnRhaW5zOlt7Y2xhc3NOYW1lOiJzdHJpbmciLGVuZHNQYXJlbnQ6dHJ1ZSx2YXJpYW50czpbe2JlZ2luOi8iLyxlbmQ6LyIvLGNvbnRhaW5zOltuXX0se2JlZ2luOi8nLyxlbmQ6LycvLGNvbnRhaW5zOltuXX0se2JlZ2luOi9bXlxzIic9PD5gXSsvfV19XX1dfTtyZXR1cm4ge25hbWU6IkhUTUwsIFhNTCIsYWxpYXNlczpbImh0bWwiLCJ4aHRtbCIsInJzcyIsImF0b20iLCJ4amIiLCJ4c2QiLCJ4c2wiLCJwbGlzdCIsIndzZiIsInN2ZyJdLGNhc2VfaW5zZW5zaXRpdmU6dHJ1ZSxjb250YWluczpbe2NsYXNzTmFtZToibWV0YSIsYmVnaW46IjwhW2Etel0iLGVuZDoiPiIscmVsZXZhbmNlOjEwLGNvbnRhaW5zOlthLGksdCxzLHtiZWdpbjoiXFxbIixlbmQ6IlxcXSIsY29udGFpbnM6W3tjbGFzc05hbWU6Im1ldGEiLGJlZ2luOiI8IVthLXpdIixlbmQ6Ij4iLGNvbnRhaW5zOlthLHMsaSx0XX1dfV19LGUuQ09NTUVOVCgiXHgzYyEtLSIsIi0tXHgzZSIse3JlbGV2YW5jZToxMH0pLHtiZWdpbjoiPFxcIVxcW0NEQVRBXFxbIixlbmQ6IlxcXVxcXT4iLHJlbGV2YW5jZToxMH0sbix7Y2xhc3NOYW1lOiJtZXRhIixiZWdpbjovPFw/eG1sLyxlbmQ6L1w/Pi8scmVsZXZhbmNlOjEwfSx7Y2xhc3NOYW1lOiJ0YWciLGJlZ2luOiI8c3R5bGUoPz1cXHN8PikiLGVuZDoiPiIsa2V5d29yZHM6e25hbWU6InN0eWxlIn0sY29udGFpbnM6W2NdLHN0YXJ0czp7ZW5kOiI8L3N0eWxlPiIscmV0dXJuRW5kOnRydWUsc3ViTGFuZ3VhZ2U6WyJjc3MiLCJ4bWwiXX19LHtjbGFzc05hbWU6InRhZyIsYmVnaW46IjxzY3JpcHQoPz1cXHN8PikiLGVuZDoiPiIsa2V5d29yZHM6e25hbWU6InNjcmlwdCJ9LGNvbnRhaW5zOltjXSxzdGFydHM6e2VuZDoiPFwvc2NyaXB0PiIscmV0dXJuRW5kOnRydWUsc3ViTGFuZ3VhZ2U6WyJqYXZhc2NyaXB0IiwiaGFuZGxlYmFycyIsInhtbCJdfX0se2NsYXNzTmFtZToidGFnIixiZWdpbjoiPC8/IixlbmQ6Ii8/PiIsY29udGFpbnM6W3tjbGFzc05hbWU6Im5hbWUiLGJlZ2luOi9bXlwvPjxcc10rLyxyZWxldmFuY2U6MH0sY119XX19fSgpKTsKCWhsanMucmVnaXN0ZXJMYW5ndWFnZSgibWFya2Rvd24iLGZ1bmN0aW9uKCl7cmV0dXJuIGZ1bmN0aW9uKG4pe2NvbnN0IGU9e2JlZ2luOiI8IixlbmQ6Ij4iLHN1Ykxhbmd1YWdlOiJ4bWwiLHJlbGV2YW5jZTowfSxhPXtiZWdpbjoiXFxbLis/XFxdW1xcKFxcW10uKj9bXFwpXFxdXSIscmV0dXJuQmVnaW46dHJ1ZSxjb250YWluczpbe2NsYXNzTmFtZToic3RyaW5nIixiZWdpbjoiXFxbIixlbmQ6IlxcXSIsZXhjbHVkZUJlZ2luOnRydWUscmV0dXJuRW5kOnRydWUscmVsZXZhbmNlOjB9LHtjbGFzc05hbWU6ImxpbmsiLGJlZ2luOiJcXF1cXCgiLGVuZDoiXFwpIixleGNsdWRlQmVnaW46dHJ1ZSxleGNsdWRlRW5kOnRydWV9LHtjbGFzc05hbWU6InN5bWJvbCIsYmVnaW46IlxcXVxcWyIsZW5kOiJcXF0iLGV4Y2x1ZGVCZWdpbjp0cnVlLGV4Y2x1ZGVFbmQ6dHJ1ZX1dLHJlbGV2YW5jZToxMH0saT17Y2xhc3NOYW1lOiJzdHJvbmciLGNvbnRhaW5zOltdLHZhcmlhbnRzOlt7YmVnaW46L197Mn0vLGVuZDovX3syfS99LHtiZWdpbjovXCp7Mn0vLGVuZDovXCp7Mn0vfV19LHM9e2NsYXNzTmFtZToiZW1waGFzaXMiLGNvbnRhaW5zOltdLHZhcmlhbnRzOlt7YmVnaW46L1wqKD8hXCopLyxlbmQ6L1wqL30se2JlZ2luOi9fKD8hXykvLGVuZDovXy8scmVsZXZhbmNlOjB9XX07aS5jb250YWlucy5wdXNoKHMpLHMuY29udGFpbnMucHVzaChpKTt2YXIgYz1bZSxhXTtyZXR1cm4gaS5jb250YWlucz1pLmNvbnRhaW5zLmNvbmNhdChjKSxzLmNvbnRhaW5zPXMuY29udGFpbnMuY29uY2F0KGMpLHtuYW1lOiJNYXJrZG93biIsYWxpYXNlczpbIm1kIiwibWtkb3duIiwibWtkIl0sY29udGFpbnM6W3tjbGFzc05hbWU6InNlY3Rpb24iLHZhcmlhbnRzOlt7YmVnaW46Il4jezEsNn0iLGVuZDoiJCIsY29udGFpbnM6Yz1jLmNvbmNhdChpLHMpfSx7YmVnaW46Iig/PV4uKz9cXG5bPS1dezIsfSQpIixjb250YWluczpbe2JlZ2luOiJeWz0tXSokIn0se2JlZ2luOiJeIixlbmQ6IlxcbiIsY29udGFpbnM6Y31dfV19LGUse2NsYXNzTmFtZToiYnVsbGV0IixiZWdpbjoiXlsgXHRdKihbKistXXwoXFxkK1xcLikpKD89XFxzKykiLGVuZDoiXFxzKyIsZXhjbHVkZUVuZDp0cnVlfSxpLHMse2NsYXNzTmFtZToicXVvdGUiLGJlZ2luOiJePlxccysiLGNvbnRhaW5zOmMsZW5kOiIkIn0se2NsYXNzTmFtZToiY29kZSIsdmFyaWFudHM6W3tiZWdpbjoiKGB7Myx9KSgufFxcbikqP1xcMWAqWyBdKiJ9LHtiZWdpbjoiKH57Myx9KSgufFxcbikqP1xcMX4qWyBdKiJ9LHtiZWdpbjoiYGBgIixlbmQ6ImBgYCtbIF0qJCJ9LHtiZWdpbjoifn5+IixlbmQ6In5+fitbIF0qJCJ9LHtiZWdpbjoiYC4rP2AifSx7YmVnaW46Iig/PV4oIHs0fXxcXHQpKSIsY29udGFpbnM6W3tiZWdpbjoiXiggezR9fFxcdCkiLGVuZDoiKFxcbikkIn1dLHJlbGV2YW5jZTowfV19LHtiZWdpbjoiXlstXFwqXXszLH0iLGVuZDoiJCJ9LGEse2JlZ2luOi9eXFtbXlxuXStcXTovLHJldHVybkJlZ2luOnRydWUsY29udGFpbnM6W3tjbGFzc05hbWU6InN5bWJvbCIsYmVnaW46L1xbLyxlbmQ6L1xdLyxleGNsdWRlQmVnaW46dHJ1ZSxleGNsdWRlRW5kOnRydWV9LHtjbGFzc05hbWU6ImxpbmsiLGJlZ2luOi86XHMqLyxlbmQ6LyQvLGV4Y2x1ZGVCZWdpbjp0cnVlfV19XX19fSgpKTsKCWhsanMucmVnaXN0ZXJMYW5ndWFnZSgicHl0aG9uIixmdW5jdGlvbigpe3JldHVybiBmdW5jdGlvbihlKXt2YXIgbj17a2V5d29yZDoiYW5kIGVsaWYgaXMgZ2xvYmFsIGFzIGluIGlmIGZyb20gcmFpc2UgZm9yIGV4Y2VwdCBmaW5hbGx5IHByaW50IGltcG9ydCBwYXNzIHJldHVybiBleGVjIGVsc2UgYnJlYWsgbm90IHdpdGggY2xhc3MgYXNzZXJ0IHlpZWxkIHRyeSB3aGlsZSBjb250aW51ZSBkZWwgb3IgZGVmIGxhbWJkYSBhc3luYyBhd2FpdCBub25sb2NhbHwxMCIsYnVpbHRfaW46IkVsbGlwc2lzIE5vdEltcGxlbWVudGVkIixsaXRlcmFsOiJGYWxzZSBOb25lIFRydWUifSxhPXtjbGFzc05hbWU6Im1ldGEiLGJlZ2luOi9eKD4+PnxcLlwuXC4pIC99LGk9e2NsYXNzTmFtZToic3Vic3QiLGJlZ2luOi9cey8sZW5kOi9cfS8sa2V5d29yZHM6bixpbGxlZ2FsOi8jL30scz17YmVnaW46L1x7XHsvLHJlbGV2YW5jZTowfSxyPXtjbGFzc05hbWU6InN0cmluZyIsY29udGFpbnM6W2UuQkFDS1NMQVNIX0VTQ0FQRV0sdmFyaWFudHM6W3tiZWdpbjovKHV8Yik/cj8nJycvLGVuZDovJycnLyxjb250YWluczpbZS5CQUNLU0xBU0hfRVNDQVBFLGFdLHJlbGV2YW5jZToxMH0se2JlZ2luOi8odXxiKT9yPyIiIi8sZW5kOi8iIiIvLGNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEUsYV0scmVsZXZhbmNlOjEwfSx7YmVnaW46LyhmcnxyZnxmKScnJy8sZW5kOi8nJycvLGNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEUsYSxzLGldfSx7YmVnaW46LyhmcnxyZnxmKSIiIi8sZW5kOi8iIiIvLGNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEUsYSxzLGldfSx7YmVnaW46Lyh1fHJ8dXIpJy8sZW5kOi8nLyxyZWxldmFuY2U6MTB9LHtiZWdpbjovKHV8cnx1cikiLyxlbmQ6LyIvLHJlbGV2YW5jZToxMH0se2JlZ2luOi8oYnxiciknLyxlbmQ6LycvfSx7YmVnaW46LyhifGJyKSIvLGVuZDovIi99LHtiZWdpbjovKGZyfHJmfGYpJy8sZW5kOi8nLyxjb250YWluczpbZS5CQUNLU0xBU0hfRVNDQVBFLHMsaV19LHtiZWdpbjovKGZyfHJmfGYpIi8sZW5kOi8iLyxjb250YWluczpbZS5CQUNLU0xBU0hfRVNDQVBFLHMsaV19LGUuQVBPU19TVFJJTkdfTU9ERSxlLlFVT1RFX1NUUklOR19NT0RFXX0sbD17Y2xhc3NOYW1lOiJudW1iZXIiLHJlbGV2YW5jZTowLHZhcmlhbnRzOlt7YmVnaW46ZS5CSU5BUllfTlVNQkVSX1JFKyJbbExqSl0/In0se2JlZ2luOiJcXGIoMG9bMC03XSspW2xMakpdPyJ9LHtiZWdpbjplLkNfTlVNQkVSX1JFKyJbbExqSl0/In1dfSx0PXtjbGFzc05hbWU6InBhcmFtcyIsdmFyaWFudHM6W3tiZWdpbjovXChccypcKS8sc2tpcDp0cnVlLGNsYXNzTmFtZTpudWxsfSx7YmVnaW46L1woLyxlbmQ6L1wpLyxleGNsdWRlQmVnaW46dHJ1ZSxleGNsdWRlRW5kOnRydWUsY29udGFpbnM6WyJzZWxmIixhLGwscixlLkhBU0hfQ09NTUVOVF9NT0RFXX1dfTtyZXR1cm4gaS5jb250YWlucz1bcixsLGFdLHtuYW1lOiJQeXRob24iLGFsaWFzZXM6WyJweSIsImd5cCIsImlweXRob24iXSxrZXl3b3JkczpuLGlsbGVnYWw6Lyg8XC98LT58XD8pfD0+Lyxjb250YWluczpbYSxsLHtiZWdpbktleXdvcmRzOiJpZiIscmVsZXZhbmNlOjB9LHIsZS5IQVNIX0NPTU1FTlRfTU9ERSx7dmFyaWFudHM6W3tjbGFzc05hbWU6ImZ1bmN0aW9uIixiZWdpbktleXdvcmRzOiJkZWYifSx7Y2xhc3NOYW1lOiJjbGFzcyIsYmVnaW5LZXl3b3JkczoiY2xhc3MifV0sZW5kOi86LyxpbGxlZ2FsOi9bJHs9O1xuLF0vLGNvbnRhaW5zOltlLlVOREVSU0NPUkVfVElUTEVfTU9ERSx0LHtiZWdpbjovLT4vLGVuZHNXaXRoUGFyZW50OnRydWUsa2V5d29yZHM6Ik5vbmUifV19LHtjbGFzc05hbWU6Im1ldGEiLGJlZ2luOi9eW1x0IF0qQC8sZW5kOi8kL30se2JlZ2luOi9cYihwcmludHxleGVjKVwoL31dfX19KCkpOwoJaGxqcy5yZWdpc3Rlckxhbmd1YWdlKCJ5YW1sIixmdW5jdGlvbigpe3JldHVybiBmdW5jdGlvbihlKXt2YXIgbj0idHJ1ZSBmYWxzZSB5ZXMgbm8gbnVsbCIsYT0iW1xcdyM7Lz86QCY9KyQsLn4qXFwnKClbXFxdXSsiLHM9e2NsYXNzTmFtZToic3RyaW5nIixyZWxldmFuY2U6MCx2YXJpYW50czpbe2JlZ2luOi8nLyxlbmQ6LycvfSx7YmVnaW46LyIvLGVuZDovIi99LHtiZWdpbjovXFMrL31dLGNvbnRhaW5zOltlLkJBQ0tTTEFTSF9FU0NBUEUse2NsYXNzTmFtZToidGVtcGxhdGUtdmFyaWFibGUiLHZhcmlhbnRzOlt7YmVnaW46Int7IixlbmQ6In19In0se2JlZ2luOiIleyIsZW5kOiJ9In1dfV19LGk9ZS5pbmhlcml0KHMse3ZhcmlhbnRzOlt7YmVnaW46LycvLGVuZDovJy99LHtiZWdpbjovIi8sZW5kOi8iL30se2JlZ2luOi9bXlxzLHt9W1xdXSsvfV19KSxsPXtlbmQ6IiwiLGVuZHNXaXRoUGFyZW50OnRydWUsZXhjbHVkZUVuZDp0cnVlLGNvbnRhaW5zOltdLGtleXdvcmRzOm4scmVsZXZhbmNlOjB9LHQ9e2JlZ2luOiJ7IixlbmQ6In0iLGNvbnRhaW5zOltsXSxpbGxlZ2FsOiJcXG4iLHJlbGV2YW5jZTowfSxnPXtiZWdpbjoiXFxbIixlbmQ6IlxcXSIsY29udGFpbnM6W2xdLGlsbGVnYWw6IlxcbiIscmVsZXZhbmNlOjB9LGI9W3tjbGFzc05hbWU6ImF0dHIiLHZhcmlhbnRzOlt7YmVnaW46Ilxcd1tcXHcgOlxcLy4tXSo6KD89WyBcdF18JCkifSx7YmVnaW46JyJcXHdbXFx3IDpcXC8uLV0qIjooPz1bIFx0XXwkKSd9LHtiZWdpbjoiJ1xcd1tcXHcgOlxcLy4tXSonOig/PVsgXHRdfCQpIn1dfSx7Y2xhc3NOYW1lOiJtZXRhIixiZWdpbjoiXi0tLXMqJCIscmVsZXZhbmNlOjEwfSx7Y2xhc3NOYW1lOiJzdHJpbmciLGJlZ2luOiJbXFx8Pl0oWzAtOV0/WystXSk/WyBdKlxcbiggKilbXFxTIF0rXFxuKFxcMltcXFMgXStcXG4/KSoifSx7YmVnaW46IjwlWyU9LV0/IixlbmQ6IlslLV0/JT4iLHN1Ykxhbmd1YWdlOiJydWJ5IixleGNsdWRlQmVnaW46dHJ1ZSxleGNsdWRlRW5kOnRydWUscmVsZXZhbmNlOjB9LHtjbGFzc05hbWU6InR5cGUiLGJlZ2luOiIhXFx3KyEiK2F9LHtjbGFzc05hbWU6InR5cGUiLGJlZ2luOiIhPCIrYSsiPiJ9LHtjbGFzc05hbWU6InR5cGUiLGJlZ2luOiIhIithfSx7Y2xhc3NOYW1lOiJ0eXBlIixiZWdpbjoiISEiK2F9LHtjbGFzc05hbWU6Im1ldGEiLGJlZ2luOiImIitlLlVOREVSU0NPUkVfSURFTlRfUkUrIiQifSx7Y2xhc3NOYW1lOiJtZXRhIixiZWdpbjoiXFwqIitlLlVOREVSU0NPUkVfSURFTlRfUkUrIiQifSx7Y2xhc3NOYW1lOiJidWxsZXQiLGJlZ2luOiJcXC0oPz1bIF18JCkiLHJlbGV2YW5jZTowfSxlLkhBU0hfQ09NTUVOVF9NT0RFLHtiZWdpbktleXdvcmRzOm4sa2V5d29yZHM6e2xpdGVyYWw6bn19LHtjbGFzc05hbWU6Im51bWJlciIsYmVnaW46IlxcYlswLTldezR9KC1bMC05XVswLTldKXswLDJ9KFtUdCBcXHRdWzAtOV1bMC05XT8oOlswLTldWzAtOV0pezJ9KT8oXFwuWzAtOV0qKT8oWyBcXHRdKSooWnxbLStdWzAtOV1bMC05XT8oOlswLTldWzAtOV0pPyk/XFxiIn0se2NsYXNzTmFtZToibnVtYmVyIixiZWdpbjplLkNfTlVNQkVSX1JFKyJcXGIifSx0LGcsc10sYz1bLi4uYl07cmV0dXJuIGMucG9wKCksYy5wdXNoKGkpLGwuY29udGFpbnM9Yyx7bmFtZToiWUFNTCIsY2FzZV9pbnNlbnNpdGl2ZTp0cnVlLGFsaWFzZXM6WyJ5bWwiLCJZQU1MIl0sY29udGFpbnM6Yn19fSgpKTsKCn0pKCk7Ci8vIyBzb3VyY2VNYXBwaW5nVVJMPUNvZGVXb3JrZXIuanMubWFwCgo=', null, false);
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
        let item = htmlToElement(`<div class="menu-item">${text}</div>`);
        this.items.push({
            element: item,
            hide: hide
        });
        item.addEventListener('click', () => { action(this.target); this.hide(); });
        this.firstElementChild.appendChild(item);
        return this;
    }
    addSubMenu(text, hide) {
        let item = htmlToElement(`<div class="menu-item has-sub-menu">${text}<div class="sub-menu"></div></div>`);
        let subMenuEle = item.querySelector('.sub-menu');
        this.items.push({
            element: item,
            hide: hide
        });
        item.addEventListener('click', () => { item.classList.toggle("show"); });
        this.firstElementChild.appendChild(item);
        const subMenu = {
            addItem: (text, action) => {
                let item = htmlToElement(`<div class="menu-item">${text}</div>`);
                item.addEventListener('click', (event) => { event.stopPropagation(); action(this.target); this.hide(); item.classList.toggle("show", false); });
                subMenuEle.append(item);
                return subMenu;
            }
        };
        return subMenu;
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
        if (options?.class) {
            if (Array.isArray(options.class)) {
                this.classList.add(...options.class);
            }
            else {
                this.classList.add(options.class);
            }
        }
    }
    get value() {
        return Reflect.get(this.obj, this.key);
    }
    set value(value) {
        Reflect.set(this.obj, this.key, value);
    }
    label(name) {
        return new InputLabel(this, name, { wrapped: true });
    }
    clear() {
        this.value = undefined;
    }
}
class AbstractHTMLInput extends HTMLInputElement {
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
        if (options?.class) {
            if (Array.isArray(options.class)) {
                this.classList.add(...options.class);
            }
            else {
                this.classList.add(options.class);
            }
        }
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
    clear() {
        Reflect.set(this.obj, this.key, undefined);
        this.value = null;
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
        if (options?.placeholder) {
            this.setAttribute('placeholder', options?.placeholder);
        }
        // Provide autocomplete options for the input
        if (options?.options) {
            // lazily create input options
            let lazyInit = async () => {
                this.buildOptions(Array.isArray(options.options) ? options.options : await options.options());
                this.removeEventListener('mouseover', lazyInit);
            };
            this.addEventListener('mouseover', lazyInit);
        }
        this.addEventListener('change', () => {
            let value = this.value;
            Reflect.set(obj, key, value);
            if (options?.callback)
                options?.callback(value, this);
        });
    }
    buildOptions(parsedOptions) {
        // dump the datalist out
        let id = uuid$1();
        let list = htmlToElement(`<datalist id="${id}">`
            + parsedOptions.map(v => `<option value="${v.value ? v.value : v}">${v.name ? v.name : v}</option>`).join('')
            + '</datalist>');
        document.body.append(list);
        // by default the list component only shows the items that match the input.value, which isn't very useful for a picker
        this.addEventListener('focus', () => this.value = '');
        this.setAttribute('list', id);
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
            let v = this.value;
            let value = v !== undefined ? parseFloat(this.value) : v;
            Reflect.set(obj, key, value);
            if (options?.callback)
                options?.callback(value);
        });
    }
}
customElements.define('ui-numberinput', NumberInput, { extends: 'input' });
class SliderInput extends AbstractInput {
    input;
    constructor(obj, key, options) {
        super(obj, key, options);
        this.innerHTML = `<input type="range"/><div></div>`;
        this.onselectstart = () => false;
        this.input = this.querySelector('input');
        let display = this.querySelector('div');
        this.setAttribute('ui-sliderinput', '');
        if (options?.size)
            this.style.width = (options?.size * 24) + "px";
        if (options?.color)
            this.style.setProperty('--color', options?.color);
        this.input.setAttribute('min', (options?.min ?? 0) + "");
        this.input.setAttribute('max', (options?.max ?? 100) + "");
        this.input.setAttribute('step', (options?.step ?? 1) + "");
        this.input.value = Reflect.get(obj, key);
        if (options?.displayFunc) {
            display.innerHTML = options.displayFunc(this.value);
        }
        else {
            display.innerHTML = "" + this.value;
        }
        this.input.addEventListener('input', () => {
            let value = this.input.valueAsNumber;
            Reflect.set(obj, key, value);
            if (options?.displayFunc) {
                display.innerHTML = options.displayFunc(this.value);
            }
            else {
                display.innerHTML = "" + this.value;
            }
            if (options?.callback)
                options?.callback(value);
        });
    }
    update() {
        this.input.value = Reflect.get(this.obj, this.key);
    }
}
customElements.define('ui-sliderinput', SliderInput);
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
        this.innerHTML = "";
        for (let opt of options) {
            let option = document.createElement('option');
            if (typeof opt != 'object' || !('display' in opt)) {
                if (opt == value)
                    option.setAttribute('selected', '');
                option.innerText = '' + opt;
            }
            else {
                if (opt.value == value)
                    option.setAttribute('selected', '');
                option.innerText = opt.display ?? opt.value;
                option.value = '' + opt.value;
            }
            this.append(option);
        }
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
customElements.define('ui-selectinput', SelectInput, { extends: 'select' });
class MultiSelectInput extends AbstractInput {
    options;
    list;
    constructor(obj, key, options) {
        super(obj, key);
        this.options = options;
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
            this.options.callback?.();
        });
        this.append(select);
        this.renderList();
    }
    renderList() {
        this.list.innerHTML = "";
        this.list.append(...this.value.map((v, index) => {
            let badge = new Badge(v);
            badge.append(new Button('', () => {
                // remove this item and redraw
                this.value.splice(index, 1);
                this.renderList();
                this.options.callback?.();
            }, { icon: 'fa-times', style: 'text', color: 'error-color' }));
            return badge;
        }));
    }
}
customElements.define('ui-multiselectinput', MultiSelectInput);
class MultiStringInput extends AbstractInput {
    options;
    list;
    constructor(obj, key, options) {
        super(obj, key);
        this.options = options;
        if (!Array.isArray(this.value))
            this.value = [];
        let list = document.createElement("content");
        this.list = list;
        this.append(list);
        // picker
        let addItem = () => {
            this.value.push(input.value);
            input.value = "";
            this.renderList();
            this.options.callback?.();
        };
        const DATA = {
            value: ""
        };
        let input = new StringInput(DATA, "value", {});
        input.addEventListener("keypress", (e) => {
            if (e.key == "Enter") {
                addItem();
            }
        });
        let row = new Row();
        row.append(input);
        row.append(new Button("Add", addItem));
        if (options.clearButton) {
            row.append(new Button("Clear", () => {
                this.value = [];
                this.renderList();
            }, { clazz: "delete" }));
        }
        this.append(row);
        this.renderList();
    }
    renderList() {
        this.list.innerHTML = "";
        this.list.append(...this.value.map((v, index) => {
            let badge = new Badge(v);
            badge.append(new Button('', () => {
                // remove this item and redraw
                this.value.splice(index, 1);
                this.renderList();
                this.options.callback?.();
            }, { icon: 'fa-times', style: 'text', color: 'error-color' }));
            return badge;
        }));
    }
}
customElements.define('ui-multistringinput', MultiStringInput);
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
class TextInput extends AbstractInput {
    constructor(obj, key) {
        super(obj, key);
        let text = document.createElement('textarea');
        let resize = () => {
            text.style["height"] = "1px";
            text.style["height"] = text.scrollHeight + "px";
        };
        text.onkeyup = resize;
        text.addEventListener('change', () => {
            this.value = text.value;
        });
        text.value = this.value ?? "";
        this.append(text);
        setTimeout(resize, 10);
    }
}
customElements.define('ui-text-input', TextInput);
class ToggleInput extends AbstractInput {
    options;
    input;
    unset;
    constructor(obj, key, options) {
        super(obj, key);
        this.options = options;
        this.innerHTML = `<input type="checkbox"/><div><span></span></div>`;
        this.setAttribute("ui-toggle", "");
        if (this.options?.allowUnset) {
            if (super.value == undefined) {
                this.unset = true;
                this.classList.toggle('indeterminate', this.unset);
            }
        }
        this.input = this.querySelector('input');
        this.input.checked = this.value;
        this.querySelector('input').addEventListener('change', () => {
            this.value = this.input.checked;
        });
    }
    get value() {
        if (this.options?.allowUnset && this.unset) {
            return null;
        }
        return super.value;
    }
    set value(value) {
        if (this.options?.allowUnset && value === undefined) {
            this.unset = true;
        }
        else {
            this.unset = false;
        }
        this.classList.toggle('indeterminate', this.unset);
        super.value = value;
    }
    update() {
        this.input.checked = this.value;
    }
}
customElements.define('ui-toggleinput', ToggleInput);
class InputLabel extends HTMLLabelElement {
    input;
    constructor(inputElement, display, { wrapped = false, clearable = false } = {}) {
        super();
        this.setAttribute("ui-label", "");
        if (wrapped) {
            // wrap the item with the label
            this.innerHTML = `<span class="label">${display}</span>`;
        }
        else {
            let id = inputElement.id;
            if (id == null) {
                // generate a unique id and use it
                id = uuid$1();
                inputElement.id = id;
            }
            this.setAttribute('for', id);
            this.innerText = display;
        }
        if (clearable) {
            this.append(new UI.Button('', (event) => {
                inputElement.clear();
                event.preventDefault();
                event.stopPropagation();
            }, { icon: "fa-times", style: "text" }));
        }
        if (wrapped) {
            this.append(inputElement);
        }
        this.input = inputElement;
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
        super(new type(json, key, options), options?.name ?? key, { wrapped: true });
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
        return hash
            // unescape the hash
            .replaceAll("%7C", "|").replaceAll("%7c", "|")
            // split into non-empty chunks
            .split('|').filter(i => i != '')
            // map the to objects
            .map(pair => pair.includes('=') ? pair.split('=', 2) : [null, pair]);
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
        let pairs = HashManager.hashPairs();
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
            direction = dirs[Math.floor(random() * dirs.length)];
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
class List extends BasicElement {
    // weakmap will ensure that we don't hold elements after they have fallen out of both the DOM and the data list
    dedupeFunction;
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
    // internal filters
    #filters = [];
    // extenally provided filtering
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
        if (options.dedupeFunction) {
            this.elementMap = new Map();
            this.dedupeFunction = options.dedupeFunction;
        }
        else {
            this.dedupeFunction = (t) => t;
        }
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
		<span class="sort"></span>
		<span class="filter"></span>
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
            "displayFunc": (typeof displayFunc == "string") ? i => i[displayFunc] : displayFunc,
            sortable: valueFunc != null
        };
        this.dirty = true;
        return this;
    }
    addAttr(name, options) {
        let valueFunc = options.value ?? name;
        let displayFunc = options.render ?? valueFunc;
        let attr = {
            id: uuid++,
            name: name,
            width: options.display?.width,
            // @ts-ignore
            value: typeof valueFunc === "string" ? (i) => i[valueFunc] : valueFunc,
            // @ts-ignore
            displayFunc: typeof displayFunc === "string" ? (i) => i[displayFunc] : displayFunc,
            sortable: valueFunc != null && (options.display?.sortable ?? true),
        };
        this.attrs[name] = attr;
        if (valueFunc != null && (options.display?.filterable ?? false)) {
            this.addFilter({
                attr: [name],
                value: '',
                suggest: options.display?.filterable == 'suggest'
            });
        }
        this.dirty = true;
        return this;
    }
    getFilters() {
        return this.#filters;
    }
    addFilter(filter) {
        this.#filters.push(filter);
        return this;
    }
    #internalFilter(item) {
        filters: for (let filter of this.#filters) {
            if (filter.value) {
                const filterValue = filter.value.toLocaleLowerCase();
                for (let attr of filter.attr) {
                    let value = ('' + this.attrs[attr]?.value(item)).toLowerCase();
                    if (value.toLowerCase().includes(filterValue)) {
                        // we've passed this filter
                        continue filters;
                    }
                }
                // we failed this filter
                return false;
            }
        }
        return true;
    }
    _filtered(item) {
        return this.#internalFilter(item) && (this._filterFunc == null || this._filterFunc(item));
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
        if (Object.values(this.attrs).length == 0 || this.data.length == 0)
            wrapper.style.display = "none";
    }
    filterDisplay() {
        let wrapper = this.querySelector('.filter');
        if (!wrapper.hasChildNodes()) {
            for (let filter of this.#filters) {
                wrapper.append(new StringInput(filter, 'value', {
                    placeholder: 'Search',
                    callback: async (newValue) => {
                        this.dirty = true;
                        await this.page();
                    }
                }));
            }
        }
        if (Object.values(this.attrs).length == 0 || this.data.length == 0)
            wrapper.style.display = "none";
    }
    async render(forceRedraw = false) {
        // TODO render busy spinner?
        if (forceRedraw) {
            this.dirty = true;
        }
        // render headers
        this.sortDisplay();
        // render filters
        this.filterDisplay();
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
                        if (typeof a == 'number' && typeof b == 'number')
                            return asc * (a - b);
                        return asc * ('' + a).localeCompare('' + b, "en", { sensitivity: 'base', ignorePunctuation: true, numeric: true });
                    });
                }
                this.dirty = false;
                this.pageNumber = 0;
            }
            // compute paging numbers
            let visibleCount = this.display.length;
            let pages = this.itemsPerPage < Infinity ? Math.ceil(visibleCount / this.itemsPerPage) : 1;
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
            let start = this.itemsPerPage == Infinity ? 0 : this.pageNumber * this.itemsPerPage;
            for (let index = start; index < (this.pageNumber + 1) * this.itemsPerPage && index < visibleCount; index++) {
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
        let key = this.dedupeFunction(item);
        if (!this.elementMap.has(key)) {
            let ele = await this.renderItem(item);
            if (typeof item == "string") {
                // TODO support caching of string based item elements....
                return ele;
            }
            this.elementMap.set(key, ele);
        }
        return this.elementMap.get(key);
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

const HashController = new (class HashController {
    map = new Map();
    constructor() {
        window.addEventListener('hashchange', () => this.update());
    }
    update() {
        let pairs = this.#hashPairs();
        for (let entry of this.map.values()) {
            let pair = pairs.find(i => i[0] == entry.path);
            let value = this.#parse(pair?.[1], entry.type);
            if (entry.value !== value) {
                entry.value = value;
                entry.events.forEach(l => l(value));
            }
        }
    }
    getEntry(key) {
        if (!this.map.has(key)) {
            this.map.set(key, {
                path: key,
                type: "string",
                value: null,
                events: []
            });
        }
        return this.map.get(key);
    }
    listen(key, changeEvent) {
        let entry = this.getEntry(key);
        entry.value = this.#read(key);
        entry.events.push(changeEvent);
        changeEvent(entry.value);
    }
    set(key, value, passive = false) {
        let entry = this.getEntry(key);
        if (entry.value !== value) {
            this.#write(key, value, passive);
            entry.value = value;
            if (!passive) {
                entry.events.forEach(l => l(value));
            }
        }
    }
    #hashPairs() {
        let hash = window.location.hash.substring(1);
        return hash
            // unescape the hash
            .replaceAll("%7C", "|").replaceAll("%7c", "|")
            // split into non-empty chunks
            .split('|').filter(i => i != '')
            // map the to objects
            .map(pair => pair.includes('=') ? pair.split('=', 2) : [null, pair]);
    }
    #read(key) {
        let path = key;
        let type = this.getEntry(key).type;
        let pairs = this.#hashPairs();
        let pair = pairs.find(i => i[0] == path);
        let value = pair?.[1];
        if (value) {
            value = this.#parse(value, type);
        }
        return value;
    }
    #parse(input, type) {
        let value = input;
        if (value) {
            switch (type) {
                case 'number':
                    value = parseFloat(input);
                    break;
                case 'boolean':
                    value = (input.toLowerCase() == 'true');
                    break;
                case 'json':
                    value = JSON.parse(input);
                    break;
            }
        }
        return value;
    }
    #write(key, value, passive = false) {
        let path = key;
        let type = this.getEntry(key).type;
        let pairs = this.#hashPairs();
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
})();

/**
 * Table is a special case of List with a more automatic layout
 */
class Table extends List {
    constructor(options = {}) {
        super(async (item) => {
            let tr = document.createElement('tr');
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
	<!-- headers -->
	<tr class="headers"></tr>
	<!-- filters -->
	<tr class="filter"></tr>
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
    /**
     * Display the sorting headers
     */
    filterDisplay() {
        let filterRow = this.querySelector('.filter');
        if (!filterRow.hasChildNodes()) {
            let headers = Object.values(this.attrs);
            let filters = this.getFilters();
            for (let header of headers) {
                let cell = htmlToElement('<td></td>', 'tr');
                let filter = filters.find(f => f.attr.includes(header.name));
                if (filter) {
                    let options = {
                        placeholder: 'Search',
                        callback: async (newValue, element) => {
                            this.dirty = true;
                            await this.page();
                            element.blur();
                        }
                    };
                    if (filter.suggest) {
                        options['options'] = async () => [...new Set(this.data.map((t) => header.value(t).toString()))].sort();
                    }
                    cell.append(new StringInput(filter, 'value', options));
                }
                filterRow.append(cell);
            }
        }
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

class Tabs extends BasicElement {
    activeTab = null;
    constructor(options) {
        super(`<header></header><content></content>`, options);
        this.setAttribute("ui-tabs", '');
    }
    tab(title, content) {
        let tab;
        let tabElement = htmlToElement("<div class='tab'></div>");
        let openFunction = () => {
            // highlight open tab
            this.querySelectorAll('header .tab').forEach(e => {
                e.classList.toggle('active', e == tabElement);
            });
            // set content
            this.querySelector('content').innerHTML = "";
            append(this.querySelector('content'), typeof content == 'function' ? content() : content);
            return tab;
        };
        tabElement.addEventListener('click', openFunction);
        append(tabElement, title);
        this.querySelector('header').append(tabElement);
        tab = {
            open: openFunction
        };
        if (this.activeTab == null) {
            this.activeTab = tab;
            this.activeTab.open();
        }
        else {
            // de-parent the items
            if (content instanceof HTMLElement) {
                content.remove();
            }
            else if (Array.isArray(content)) {
                content.forEach(c => c instanceof HTMLElement ? c.remove() : '');
            }
        }
        return tab;
    }
}
customElements.define('ui-tabs', Tabs);

class Viewport extends BasicElement {
    #view = {
        parent: null,
        // what position the top left corner maps to
        x: 0,
        y: 0,
        zoom: 1, // 1 pixel = 1 pixel
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
            // return;
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
                console.log("update attachment...", attachment, t);
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
            e.preventDefault();
            let v = this.toView(e.x, e.y);
            // this looks funky but give a nice UX
            let zoom = Math.exp((Math.log(this.#view.zoom) * 480 - e.deltaY) / 480);
            this.setZoom(zoom, v.x, v.y);
            this.render();
        });
        // TODO the events here are document scoped - they should check if they are actually viewport based
        this.addEventListener('mousedown', (e) => {
            e.preventDefault();
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
            if (e.button == MIDDLE_MOUSE && drag) {
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

const style = `

:host{
	display: block;
    max-width: 100vw;
	position: relative;
}

:host > slot#slider{
	width: 100%;
    overflow: hidden;
    display: flex;
    box-sizing: border-box;
}

:host ::slotted(*){
    width: var(--element-width) !important;
    margin-left: var(--element-margin) !important;
	margin-right: var(--element-margin) !important;
    flex: 0 0 auto !important;
    box-sizing: border-box !important;
}

:host slot.button{
	position: absolute;
	top:0;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	opacity: 0.5;
	transition: opacity 0.3s;
}

:host(:hover) slot.button{
	opacity: 0.8;
}

:host slot.button:hover{
	opacity: 1; 
}

:host slot.button.inactive{
	opacity: 0.2;
	pointer-events: none;
}

slot#back{
	left:0;
}

slot#forward{
	right:0;
}`;
class Slider extends HTMLElement {
    sliderContainer;
    backButton;
    forwardButton;
    #index = 0;
    itemsPerPage = 1;
    itemWidth = 1;
    #options = {
        minElementWidth: 140,
        elementMargin: 20,
        visibleElementCallback: null
    };
    #initializedItems = new WeakSet();
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.innerHTML = `
		<style>${style}</style>
		<slot id="slider"></slot>
		<slot class="button" id="back" name="back"><span style="font-size: 40px">〈</span></slot>
		<slot class="button" id="forward" name="forward"><span style="font-size: 40px">〉</span></slot>
		`;
        this.forwardButton = shadowRoot.querySelector('#forward');
        this.forwardButton.addEventListener("click", this.slideForward.bind(this));
        this.backButton = shadowRoot.querySelector('#back');
        this.backButton.addEventListener("click", this.slideBack.bind(this));
        this.sliderContainer = shadowRoot.querySelector('slot');
        this.#bindTouchEvents(this.sliderContainer);
        new ResizeObserver(this.redraw.bind(this)).observe(this);
        this.index = 0;
    }
    slideForward() {
        // if we are at the end scroll to the start, otherwise scroll forward
        this.index = (this.index == this.length - this.itemsPerPage) ? 0 : Math.min(this.length - this.itemsPerPage, this.index + this.itemsPerPage);
    }
    slideBack() {
        this.index = Math.max(0, this.index - this.itemsPerPage);
    }
    get index() {
        return this.#index;
    }
    set index(i) {
        if (this.length == 0)
            return;
        this.#index = i;
        this.backButton.classList.toggle('inactive', this.index == 0);
        // scroll
        this.scrollToIndex(true);
    }
    get options() {
        return this.#options;
    }
    set options(options) {
        this.#options = options;
        this.redraw();
    }
    redraw() {
        if (this.length == 0)
            return;
        // compute the number of elements that should be visible per scroll
        let rect = this.sliderContainer.getBoundingClientRect();
        let width = rect.width;
        let maxElements = Math.floor(width / (this.options.minElementWidth + 2 * this.options.elementMargin));
        this.itemsPerPage = maxElements;
        // set the element size to match
        this.itemWidth = (width / maxElements) - this.options.elementMargin * 2;
        this.style.setProperty('--element-width', this.itemWidth + "px");
        this.style.setProperty('--element-margin', this.options.elementMargin + "px");
        // we'll need to update our scroller
        this.scrollToIndex(false);
    }
    get length() {
        return this.children.length;
    }
    scrollToIndex(smooth) {
        if (this.length == 0)
            return;
        // Find items that are now visible, or will be visible in one scroll, and trigger callback
        if (this.options.visibleElementCallback) {
            for (let itemIndex = this.index - this.itemsPerPage; itemIndex < this.index + this.itemsPerPage * 2; itemIndex++) {
                let wrappedIndex = itemIndex < 0 ? this.length - (-itemIndex % this.length) : itemIndex % this.length;
                console.log(wrappedIndex);
                let item = this.children[wrappedIndex];
                if (!this.#initializedItems.has(item)) {
                    this.#initializedItems.add(item);
                    this.options.visibleElementCallback(item);
                }
            }
        }
        // actually scroll the slider
        let element = this.children[this.index];
        let position = element.offsetLeft - this.sliderContainer.offsetLeft - this.options.elementMargin;
        if (smooth) {
            this.sliderContainer.scrollTo({
                top: 0,
                left: position,
                behavior: 'smooth'
            });
        }
        else {
            this.sliderContainer.scrollLeft = position;
        }
    }
    #bindTouchEvents(frame) {
        let touchOffset = null;
        frame.addEventListener('touchstart', (event) => {
            let touch = event.touches[0];
            if (!touchOffset) {
                touchOffset = {
                    originX: this.sliderContainer.scrollLeft,
                    x: touch.pageX,
                    y: touch.pageY,
                    amountX: 0,
                    amountY: 0,
                    time: Date.now()
                };
            }
        });
        frame.addEventListener('touchmove', (event) => {
            let touch = event.touches[0];
            touchOffset.amountX = touchOffset.x - touch.pageX;
            touchOffset.amountY = touchOffset.y - touch.pageY;
            this.sliderContainer.scrollLeft = touchOffset.amountX + touchOffset.originX;
        });
        frame.addEventListener('touchend', (event) => {
            console.log(touchOffset);
            // decide if the user scrolled far enough
            if (Math.abs(touchOffset.amountX) > this.itemWidth) {
                // SCROLL
                if (touchOffset.amountX > 0) {
                    this.slideForward();
                }
                else {
                    this.slideBack();
                }
            }
            else {
                this.scrollToIndex(true);
            }
            touchOffset = null;
        });
    }
}
customElements.define('ui-slider', Slider);

class Row extends BasicElement {
}
customElements.define('ui-row', Row);
class Column extends BasicElement {
}
customElements.define('ui-col', Column);

let css = [
    // URL + "/../ui.css",
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
    HashManager, HashController,
    InputLabel,
    Json,
    JsonInput,
    LabelledInput,
    TextInput,
    List,
    Modal,
    MultiSelectInput,
    MultiStringInput,
    NumberInput,
    Panel,
    SelectInput,
    Slider,
    SliderInput,
    Spacer,
    Spinner,
    Splash,
    StringInput,
    Table,
    Tabs,
    Toast,
    Toggle,
    ToggleInput,
    Viewport,
    info: info,
    warn: warn,
    error: error,
    html: htmlToElement,
    uuid: uuid$1,
    sleep: sleep,
    utils,
    factory,
    mixin
};
// @ts-ignore
window["UI"] = UI;
let createElement = htmlToElement;
const html = htmlToElement;

export { Badge, BasicElement, Button, Cancel, Card, Code, Column, ContextMenu, Form, Form2, Grid, HashController, HashManager, InputLabel, Json, JsonInput, LabelledInput, List, Modal, MultiSelectInput, MultiStringInput, NumberInput, Panel, Row, SelectInput, Slider, SliderInput, Spacer, Spinner, Splash, StringInput, Table, Tabs, TextInput, Toast, Toggle, ToggleInput, Viewport, createElement, UI as default, factory, html, mixin, utils };
//# sourceMappingURL=ui.js.map
