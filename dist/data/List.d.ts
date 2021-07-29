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
export class List extends BasicElement {
    static ASC: boolean;
    static DESC: boolean;
    static ITEMS_COLUMNS_KEY: string;
    static ITEMS_PER_PAGE_KEY: string;
    /**
     *
     * @param {itemElement} itemDisplay
     * @param {{itemColumns?:number, itemsPerPage?: number}} options
     */
    constructor(itemDisplay: itemElement, options?: {
        itemColumns?: number;
        itemsPerPage?: number;
    });
    /** @type {WeakMap<Object,HTMLElement>} */
    elementMap: WeakMap<Object, HTMLElement>;
    /** @type {boolean} indictes if the item display state is out of date */
    dirty: boolean;
    /** @type {{attr: Attr, asc: Boolean}|null} */
    _sort: {
        attr: Attr;
        asc: boolean;
    } | null;
    /** @type {Object.<String, Attr>} */
    attrs: any;
    listBody: HTMLElement;
    _data: any[];
    display: any[];
    lookup: {};
    _filterFunc: any;
    _itemDisplayFunc: itemElement;
    pageNumber: number;
    set itemColumns(arg: any);
    set itemsPerPage(arg: number);
    get itemsPerPage(): number;
    get listLayout(): string;
    set data(arg: any[]);
    get data(): any[];
    /**
     *
     * @param {String} name
     * @param {*} valueFunc
     * @param {*} displayFunc
     * @param {*} width
     */
    addAttribute(name: string, valueFunc?: any, displayFunc?: any, width?: any): List;
    _filtered(item: any): any;
    filter(func?: any): void;
    /**
     * Display the sorting headers
     */
    sortDisplay(): void;
    render(forceRedraw?: boolean): Promise<void>;
    getItemElement(item: any): Promise<HTMLElement>;
    renderItem(item: any): Promise<HTMLElement>;
    /**
     *
     * @param {Attr|String} attribute name of the attribute to sort on
     * @param {Boolean} asc ASC of DESC sort
     */
    sort(attribute?: Attr | string, asc?: boolean): Promise<void>;
    /**
     *
     * @param {Number} page ZERO-INDEXED page number
     */
    page(page?: number): Promise<void>;
    pagingMarkup(page: any, pages: any, visibleCount: any): string;
    #private;
}
/**
 * Table is a special case of List with a more automatic layout
 */
export class Table extends List {
    /**
     *
     * @param {{itemsPerPage?: number}} options
     */
    constructor(options?: {
        itemsPerPage?: number;
    });
    #private;
}
export type itemElement = (item: Object) => HTMLElement;
export type attributeValue = (item: Object) => number | string;
export type attributeDisplayValue = (item: Object) => string;
export type Attr = {
    id: number;
    name: string;
    value: attributeValue;
};
import { BasicElement } from "../BasicElement";
