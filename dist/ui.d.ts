declare class BasicElement extends HTMLElement {
    /**
     *
     * @param  {...Element} elements
     *
     * @returns {HTMLElement[]}
     */
    static castHtmlElements(...elements: Element[]): HTMLElement[];
    constructor(content: any, { clazz }?: {
        clazz?: string;
    });
    self: BasicElement;
    intervals: any[];
    /**
     * Starts a interval timer that will stop when this element is no longer on the DOM
     *
     * @param {*} callback
     * @param {Number} time in ms
     *
     * @returns {Number} interval id.
     */
    setInterval(callback: any, time: number): number;
    /**
     *
     * @param {String} variable
     *
     * @returns {String}
     */
    css(variable: string): string;
    /**
     *
     * @param {String} variable
     *
     * @returns {Number}
     */
    cssNumber(variable: string): number;
    setCss(name: any, value: any): void;
    getCss(name: any): void;
    /**
     * @param {Boolean} boolean
     */
    set visible(arg: boolean);
    get visible(): boolean;
    show(parent?: any): BasicElement;
    hide(): BasicElement;
    /**
     * Walk up dom tree looking for a closable element
     */
    close(): BasicElement;
    attach(parent?: any): BasicElement;
    droppable: boolean;
    makeDraggable(type?: string, data?: any): void;
    makeDroppable(): void;
    onDragOver(type: any, behaviour: any): void;
    onDrop(type: any, behaviour: any): void;
    #private;
}

/**
 * Add items onto a element
 *
 * @param {Element} element
 * @param {Element|String|Element[]} content
 */
declare function append(element: Element, content: Element | string | Element[]): void;
declare function uuid(): string;
/**
 * Convert html text to a HTMLElement
 *
 * @param {String} html
 *
 * @returns {HTMLElement}
 */
declare function htmlToElement(html: string, wrapper?: string): HTMLElement;
/**
 *
 * @param  {...Element} elements
 *
 * @returns {HTMLElement[]}
 */
declare function castHtmlElements(...elements: Element[]): HTMLElement[];
/**
 * Fisher–Yates shuffle the contents of an array
 *
 * @param {*[]} array
 */
declare function shuffle(array: any[]): any[];
/**
 * Downloads a file to the users machine - must be called from within a click event (or similar)
 *
 * @param {String} filename
 * @param {Object} json
 */
declare function downloadJson(filename: string, json: Object): void;
/**
 *
 * Load a script
 *
 * @param {String} url
 *
 * @returns {Promise}
 */
declare function dynamicallyLoadScript(url: string): Promise<any>;
/**
 * Check the element is totally visible in the viewport
 *
 * @returns {Boolean}
 */
declare function isTotallyInViewport(el: any): boolean;
declare function sleep(time: any, value: any): Promise<any>;

declare const utils_append: typeof append;
declare const utils_uuid: typeof uuid;
declare const utils_htmlToElement: typeof htmlToElement;
declare const utils_castHtmlElements: typeof castHtmlElements;
declare const utils_shuffle: typeof shuffle;
declare const utils_downloadJson: typeof downloadJson;
declare const utils_dynamicallyLoadScript: typeof dynamicallyLoadScript;
declare const utils_isTotallyInViewport: typeof isTotallyInViewport;
declare const utils_sleep: typeof sleep;
declare namespace utils {
  export {
    utils_append as append,
    utils_uuid as uuid,
    utils_htmlToElement as htmlToElement,
    utils_castHtmlElements as castHtmlElements,
    utils_shuffle as shuffle,
    utils_downloadJson as downloadJson,
    utils_dynamicallyLoadScript as dynamicallyLoadScript,
    utils_isTotallyInViewport as isTotallyInViewport,
    utils_sleep as sleep,
  };
}

/**
 *
 * @param {*} template
 * @param {*} param1
 *
 * @returns {Promise<*>} returns the response from the user (the populated form json)
 */
declare function popupForm(template: any, { value, title, submitText, wrapper, dismissable }?: any): Promise<any>;
declare function info(...args: any[]): void;
declare function warn(...args: any[]): void;
declare function error(...args: any[]): void;

declare const factory_popupForm: typeof popupForm;
declare const factory_info: typeof info;
declare const factory_warn: typeof warn;
declare const factory_error: typeof error;
declare namespace factory {
  export {
    factory_popupForm as popupForm,
    factory_info as info,
    factory_warn as warn,
    factory_error as error,
  };
}

declare class Badge extends BasicElement {
    constructor(content: any, { icon, clazz }?: {
        icon?: string;
        clazz?: string;
    });
    #private;
}

declare class Button extends BasicElement {
    /**
     *
     * @param {String|HTMLElement} content
     * @param {EventListenerOrEventListenerObject|String} callback callback when the button is clicked
     * @param {{icon?: String, style?: String, color?: String|boolean}} options
     */
    constructor(content: string | HTMLElement, callback: EventListenerOrEventListenerObject | string, { icon, style, color }?: {
        icon?: string;
        style?: string;
        color?: string | boolean;
    });
    listeners: any[];
    setCallback(callback: any): void;
    #private;
}

declare class Cancel extends BasicElement {
    constructor();
    #private;
}

declare class Card extends BasicElement {
    constructor(content: any);
    setContent(content: any): void;
    flip(): Promise<any>;
    set flipped(arg: boolean);
    get flipped(): boolean;
    #private;
}

declare class Code extends BasicElement {
    constructor(content: any);
    preprocess(content: any): any;
    setContent(content: any): void;
    #private;
}

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
declare class ContextMenu extends BasicElement {
    constructor(element?: any);
    target: any;
    items: any[];
    /**
     * Add the context menu to show on the provided element context events
     *
     * @param {HTMLElement} element
     */
    for(element: HTMLElement): ContextMenu;
    renderMenu(element: any, x: any, y: any): void;
    detach(element: any): void;
    /**
     * Add a new item to the context menu
     *
     * @param {String} text
     * @param {Function} action
     * @param {Function} hide
     */
    addItem(text: string, action: Function, hide?: Function): ContextMenu;
    /**
     * Add a line break to the context menu
     */
    addBreak(): ContextMenu;
    clearMenuItems(): void;
    #private;
}

declare class Toggle extends BasicElement {
    constructor(v: any, changeCallback: any);
    changeCallback: any;
    set value(arg: any);
    get value(): any;
    #private;
}

/****** FORM COMPONENTS ******/
interface FormTemplateJSON {
    key?: string;
    name?: string;
    hint?: string;
    placeholder?: string;
    default?: string;
    disabled?: boolean;
    type?: string | Function;
    format?: string;
    hidden?: Function;
    redraw?: string | string[];
    options?: any[] | Function;
    style?: "INLINE" | "ROW";
    children?: FormTemplate | FormTemplate[];
    afterRender?: Function;
}
declare type FormTemplate = FormTemplateJSON | string;
interface FormStyle {
    parent: string;
    wrap: string;
    label: string;
    value: string;
}
declare class Form extends BasicElement {
    static STYLE: Record<string, FormStyle>;
    static TRUE_STRINGS: Set<string>;
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
    constructor(template: FormTemplate | FormTemplate[]);
    build(json: any): Promise<this>;
    onChange(): Promise<void>;
    json(includeHidden?: boolean): any;
    _readValue(element: HTMLElement, includeHidden?: boolean): any;
    jsonToHtml(templates: FormTemplate | FormTemplate[], json: any, jsonKey?: string, options?: {
        style: FormStyle;
    }): Promise<HTMLElement[]>;
    _readJsonWithKey(json: any, key: string): any;
    oneItem(template: FormTemplateJSON, itemValue: any, jsonKey: string, { style }?: {
        style?: FormStyle;
    }): Promise<HTMLElement>;
}

declare class Grid extends BasicElement {
    /**
     * @param {{padding?: string, columnGap?: string, rowGap?: string}}
     */
    constructor({ padding, columnGap, rowGap }?: {
        padding?: string;
        columnGap?: string;
        rowGap?: string;
    });
    set columns(arg: number);
    get columns(): number;
    set rows(arg: number);
    get rows(): number;
    /**
     *
     * @param {HTMLElement|HTMLElement[]} element
     * @param {Number} column
     * @param {Number} row
     * @param {Number} width
     * @param {Number} height
     */
    put(element: HTMLElement | HTMLElement[], row: number, column: number, width?: number, height?: number): void;
    #private;
}

declare class AbstractInput extends BasicElement {
    /**
     *
     * @param {*} obj json object/array to keep up to date
     * @param {*} key json key/indes to keep up to date
     * @param {{callback?: Function, size?:Number, color?:String, placeholder?:string}} params configuration parameters
     */
    constructor(obj: any, key: any, params: {
        callback?: Function;
        size?: number;
        color?: string;
        placeholder?: string;
    });
    obj: any;
    key: any;
    set value(arg: any);
    get value(): any;
    /**
     *
     * @param {String} name
     *
     * @returns {InputLabel}
     */
    label(name: string): InputLabel;
    #private;
}
declare class AbstractHTMLInput extends HTMLInputElement {
    /**
     *
     * @param {*} obj json object/array to keep up to date
     * @param {*} key json key/indes to keep up to date
     * @param {{callback?: Function, size?:Number, color?:String, placeholder?:string}} params configuration parameters
     */
    constructor(obj: any, key: any, params: {
        callback?: Function;
        size?: number;
        color?: string;
        placeholder?: string;
    });
    /**
     *
     * @param {String} name
     *
     * @returns {InputLabel}
     */
    label(name: string): InputLabel;
}
declare class StringInput extends AbstractHTMLInput {
    /**
     *
     * @param {*} obj json object/array to keep up to date
     * @param {*} key json key/indes to keep up to date
     * @param {{callback?: Function, size?:Number, color?:String, placeholder?:string}} params configuration parameters
     */
    constructor(obj: any, key: any, { callback, size, color, placeholder }?: {
        callback?: Function;
        size?: number;
        color?: string;
        placeholder?: string;
    });
}
/**
 * A number input that keeps a json object
 * up to date with it's value
 *
 */
declare class NumberInput extends AbstractHTMLInput {
    /**
     *
     * @param {*} obj json object/array to keep up to date
     * @param {*} key json key/indes to keep up to date
     * @param {{callback?: Function, size?:Number, color?:String, placeholder?:string}} params configuration parameters
     */
    constructor(obj: any, key: any, { callback, size, color, placeholder }?: {
        callback?: Function;
        size?: number;
        color?: string;
        placeholder?: string;
    });
}
declare class SelectInput extends HTMLSelectElement {
    constructor(obj: any, key: any, { options, callback, size, color, placeholder }?: {
        options?: any[];
        callback?: any;
        size?: any;
        color?: any;
        placeholder?: any;
    });
    _value: any;
    obj: any;
    key: any;
    getValue(): any;
    setValue(value: any): void;
    renderOptions(options: any): Promise<void>;
}
declare class MultiSelectInput extends AbstractInput {
    constructor(obj: any, key: any, { options }: {
        options: any;
    });
    list: HTMLElement;
    renderList(): void;
    #private;
}
declare class JsonInput extends AbstractInput {
    constructor(obj: any, key: any);
    #private;
}
declare class InputLabel extends HTMLLabelElement {
    /**
     *
     * @param {AbstractInput} inputElement
     * @param {String} display
     * @param {{wrapped?:boolean}}
     */
    constructor(inputElement: AbstractInput, display: string, { wrapped }?: {
        wrapped?: boolean;
    });
    /** @type {AbstractInput} */
    input: AbstractInput;
    set value(arg: any);
    get value(): any;
}
declare class LabelledInput extends InputLabel {
    /**
     *
     * @param {*} json
     * @param {String} key
     * @param {typeof AbstractInput| typeof AbstractHTMLInput} type
     * @param {*} options
     */
    constructor(json: any, key: string, type: typeof AbstractInput | typeof AbstractHTMLInput, options?: any);
}

/**
 * @typedef {typeof AbstractInput|[typeof AbstractInput, {}]} TemplateParam
 */
/**
 * @typedef {Object.<string, (TemplateParam|Object.<string, TemplateParam>)>} Template
 */
declare class Form2 extends Grid {
    /**
     *
     * @param {Template} template
     * @param {*} json
     * @param {*} options
     */
    constructor(template: Template, json: any, options: any);
    json: any;
    build(template: any, json: any): void;
    get value(): any;
    #private;
}
type TemplateParam = typeof AbstractInput | [typeof AbstractInput, {}];
type Template = {
    [x: string]: (TemplateParam | {
        [x: string]: TemplateParam;
    });
};

declare class HashHandler {
    /**
     *
     * @param {Number|Boolean|Object} input
     *
     * @returns {{name: String, set: Function}}
     */
    static v(input: number | boolean | Object): {
        name: string;
        set: Function;
    };
    constructor(path: any, func: any);
    /** @type {RegExp}*/
    path: RegExp;
    /** @type {} */
    pathVariables: any;
    func: any;
    /**
     * @param {String} path
     *
     * @returns {Promise<[Element,number]|false>}
     */
    handle(path: string, oldPath: any): Promise<[Element, number] | false>;
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
declare class HashManager extends BasicElement {
    static DIRECTION: {
        NONE: number;
        LEFT: number;
        RIGHT: number;
        BOTTOM: number;
        TOP: number;
        RANDOM: number;
    };
    static Handler: typeof HashHandler;
    static hashPairs(): any;
    static read(pathlike: any): any;
    static write(pathlike: any, value: any): void;
    constructor(key?: any);
    key: any;
    hash: any;
    depth: number;
    eventlistener: any;
    /** @type {HashHandler[]} */
    handlers: HashHandler[];
    position: number[];
    get value(): any;
    handler(path: any, func: any): HashManager;
    addHandler(h: any): void;
    set(value: any, fireOnChange?: boolean): Promise<void>;
    hashChange(): Promise<void>;
    /**
     *
     * @param {*} body
     * @param {Number|[Number,Number]} direction
     */
    swapContent(body: any, direction?: number | [number, number]): Promise<HTMLElement>;
    #private;
}

declare class Json extends Code {
    #private;
}

declare type ItemElementFunction = (item: any) => HTMLElement | Promise<HTMLElement>;
declare type valueFunction = (item: any) => string;
declare type displayFunction = (item: any) => string | HTMLElement | HTMLElement[] | Promise<string | HTMLElement | HTMLElement[]>;
declare type Attr = {
    "id": number;
    "name": string;
    "width": string;
    "value": valueFunction;
    "displayFunc": displayFunction;
};
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
declare class List extends BasicElement {
    elementMap: WeakMap<any, HTMLElement>;
    static ASC: boolean;
    static DESC: boolean;
    /** @type {boolean} indictes if the item display state is out of date */
    dirty: boolean;
    _busy: boolean;
    _sort: {
        attr: Attr;
        asc: Boolean;
    };
    attrs: Record<string, Attr>;
    listBody: HTMLElement;
    _data: any[];
    static ITEMS_COLUMNS_KEY: string;
    static ITEMS_PER_PAGE_KEY: string;
    display: any[];
    lookup: {};
    _filterFunc: any;
    _itemDisplayFunc: ItemElementFunction;
    pageNumber: number;
    constructor(itemDisplay: ItemElementFunction, options?: {
        itemColumns?: number;
        itemsPerPage?: number;
    });
    notBusy(): Promise<void>;
    set itemColumns(value: number);
    get itemsPerPage(): number;
    set itemsPerPage(value: number);
    get listLayout(): string;
    set data(data: any[]);
    get data(): any[];
    /**
     *
     * @param {String} name
     * @param {*} valueFunc
     * @param {*} displayFunc
     * @param {*} width
     */
    addAttribute(name: string, valueFunc?: string | valueFunction, displayFunc?: string | valueFunction, width?: string): this;
    _filtered(item: any): any;
    filter(func?: any): void;
    /**
     * Display the sorting headers
     */
    sortDisplay(): void;
    render(forceRedraw?: boolean): Promise<void>;
    sort(attribute?: string | Attr, asc?: boolean): Promise<void>;
    /**
     *
     * @param {Number} page ZERO-INDEXED page number
     */
    page(page?: number): Promise<void>;
    getItemElement(item: any): Promise<HTMLElement>;
    renderItem(item: any): Promise<HTMLElement>;
    pagingMarkup(page: number, pages: number, visibleCount: number): string;
}
/**
 * Table is a special case of List with a more automatic layout
 */
declare class Table extends List {
    constructor(options?: {
        itemsPerPage?: number;
    });
    get listLayout(): string;
    /**
     * Display the sorting headers
     */
    sortDisplay(): void;
}

declare class Splash extends BasicElement {
    constructor(content: any, { dismissable }?: {
        dismissable?: boolean;
    });
    #private;
}

declare class Panel extends BasicElement {
    /**
     *
     * @param {String|Element|Element[]} content
     * @param {{title?: String, clazz?: String, buttons?: String, header?: boolean, footer?: boolean}} param1
     */
    constructor(content?: string | Element | Element[], { title, clazz, buttons, header, footer }?: {
        title?: string;
        clazz?: string;
        buttons?: string;
        header?: boolean;
        footer?: boolean;
    });
    get content(): HTMLElement;
    header(...elements: any[]): void;
    footer(...elements: any[]): void;
    #private;
}

declare class Modal extends Splash {
    constructor(content: any, { title, clazz, buttons, dismissable, header, footer }?: {
        title?: string;
        clazz?: string;
        buttons?: string;
        dismissable?: boolean;
        header?: boolean;
        footer?: boolean;
    });
    /**
     * @type {Panel}
     */
    get panel(): Panel;
    #private;
}

declare class Spacer extends BasicElement {
    constructor();
    #private;
}

declare class Spinner extends BasicElement {
    constructor();
    #private;
}

declare class Toast extends BasicElement {
    constructor(message: any, { level }?: {
        level?: string;
    });
    #private;
}

declare class Viewport extends BasicElement {
    constructor({ flipY }?: {
        flipY?: boolean;
    });
    attachments: any[];
    canvas: HTMLCanvasElement;
    addAttachment(element: any, update?: boolean): void;
    removeAttachment(element: any, update?: boolean): void;
    /**
     * @deprecated use setZoom instead
     *
     * Move the view so vx,vy is in the center of the viewport
     *
     * @param {Number} vx
     * @param {Number} vy
     */
    center(vx: number, vy: number): void;
    /**
     * Move the view so vx,vy is in the center of the viewport
     *
     * @param {Number} vx
     * @param {Number} vy
     */
    setCenter(vx: number, vy: number): void;
    /**
     * Get the current worldspace coordinate at the center of the viewport
     *
     * @returns {{x,y}}
     */
    getCenter(): {
        x;
        y;
    };
    /**
     * @deprecated use setZoom instead
     *
     * Zoom on a point in screen space, keeping that point in the same place
     *
     * @param {Number} vz target zoom level
     * @param {Number} vx point to keep in the same position on screen
     * @param {Number} vy point to keep in the same position on screen
     */
    zoom(vz: number, vx: number, vy: number): void;
    /**
     *
     * Zoom on a point in screen space, keeping that point in the same place
     *
     * @param {Number} vz target zoom level
     * @param {Number?} vx point to keep in the same position on screen
     * @param {Number?} vy point to keep in the same position on screen
     */
    setZoom(vz: number, vx?: number | null, vy?: number | null): void;
    /**
     *
     * @param {Number} rsx
     * @param {Number} rsy
     */
    pan(rsx: number, rsy: number): void;
    /**
     *
     * @param {Number} rsx
     * @param {Number} rsy
     */
    panScreen(rsx: number, rsy: number): void;
    /**
     * convert the element-relative screen cordinates to the location
     * in the viewspace
     *
     * @param {Number} sx
     * @param {Number} sy
     *
     * @returns {{x:number,y:number, out: boolean}}
     */
    toView(sx: number, sy: number): {
        x: number;
        y: number;
        out: boolean;
    };
    /**
     * convert the viewport cordinates to screen co-ordinates
     *
     * @param {Number} sx
     * @param {Number} sy
     *
     * @returns {{x:number,y:number}}
     */
    toScreen(vx: any, vy: any): {
        x: number;
        y: number;
    };
    get element(): DOMRect;
    grid: {
        step: number;
        offset: number;
        color: string;
    }[];
    render(): void;
    updateAttachments(): void;
    /***********/
    bindMouse(): void;
    #private;
}

declare const UI: {
    BasicElement: typeof BasicElement;
    Badge: typeof Badge;
    Button: typeof Button;
    Cancel: typeof Cancel;
    Card: typeof Card;
    Code: typeof Code;
    ContextMenu: typeof ContextMenu;
    Form: typeof Form;
    Form2: typeof Form2;
    Grid: typeof Grid;
    HashManager: typeof HashManager;
    InputLabel: typeof InputLabel;
    Json: typeof Json;
    JsonInput: typeof JsonInput;
    LabelledInput: typeof LabelledInput;
    List: typeof List;
    Modal: typeof Modal;
    MultiSelectInput: typeof MultiSelectInput;
    NumberInput: typeof NumberInput;
    Panel: typeof Panel;
    SelectInput: typeof SelectInput;
    Spacer: typeof Spacer;
    Spinner: typeof Spinner;
    Splash: typeof Splash;
    StringInput: typeof StringInput;
    Table: typeof Table;
    Toast: typeof Toast;
    Toggle: typeof Toggle;
    Viewport: typeof Viewport;
    info: typeof info;
    warn: typeof warn;
    error: typeof error;
    html: typeof htmlToElement;
    uuid: typeof uuid;
    sleep: (time: any, value: any) => Promise<any>;
    utils: typeof utils;
    factory: typeof factory;
};
declare let createElement: typeof htmlToElement;

export { Badge, BasicElement, Button, Cancel, Card, Code, ContextMenu, Form, Grid, HashManager, InputLabel, Json, LabelledInput, List, Modal, MultiSelectInput, NumberInput, Panel, Spacer, Spinner, Splash, StringInput, Table, Toast, Toggle, Viewport, createElement, UI as default, factory, utils };
