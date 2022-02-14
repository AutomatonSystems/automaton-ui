import "./List.css";
import { Appendable } from "../utils.js";
import { BasicElement } from "../BasicElement";
declare type ItemElementFunction<T> = (item: T) => HTMLElement | Promise<HTMLElement>;
declare type ValueElement = string | number | boolean;
declare type ValueFunction<T> = (item: T) => ValueElement;
declare type DisplayFunction<T> = (item: T) => Appendable | Promise<Appendable>;
declare type Attr<T> = {
    "id": number;
    "name": string;
    "width": string;
    "value": ValueFunction<T>;
    "displayFunc": DisplayFunction<T>;
    sortable: boolean;
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
declare type ListOptions<T> = {
    itemColumns?: number;
    itemsPerPage?: number;
    dedupeFunction?: (t: T) => any;
};
declare type Filter = {
    attr: string[];
    value: string;
    suggest?: boolean;
};
declare type AttrOptions<T> = {
    value?: string | ValueFunction<T>;
    render?: string | DisplayFunction<T>;
    display?: {
        width?: string;
        sortable?: boolean;
        filterable?: boolean | 'suggest';
    };
};
export declare class List<T> extends BasicElement {
    #private;
    dedupeFunction: (t: T) => any;
    elementMap: WeakMap<any, HTMLElement>;
    static ASC: boolean;
    static DESC: boolean;
    /** @type {boolean} indictes if the item display state is out of date */
    dirty: boolean;
    _busy: boolean;
    _sort: {
        attr: Attr<T>;
        asc: Boolean;
    };
    attrs: Record<string, Attr<T>>;
    listBody: HTMLElement;
    _data: any[];
    static ITEMS_COLUMNS_KEY: string;
    static ITEMS_PER_PAGE_KEY: string;
    display: any[];
    lookup: {};
    _filterFunc: any;
    _itemDisplayFunc: ItemElementFunction<T>;
    pageNumber: number;
    constructor(itemDisplay: ItemElementFunction<T>, options?: ListOptions<T>);
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
    addAttribute(name: string, valueFunc?: string | ValueFunction<T>, displayFunc?: string | ValueFunction<T> | DisplayFunction<T>, width?: string): this;
    addAttr(name: string, options: AttrOptions<T>): this;
    getFilters(): Filter[];
    addFilter(filter: Filter): this;
    _filtered(item: T): any;
    filter(func?: any): void;
    /**
     * Display the sorting headers
     */
    sortDisplay(): void;
    filterDisplay(): void;
    render(forceRedraw?: boolean): Promise<void>;
    sort(attribute?: string | Attr<T>, asc?: boolean): Promise<void>;
    /**
     *
     * @param {Number} page ZERO-INDEXED page number
     */
    page(page?: number): Promise<void>;
    getItemElement(item: T): Promise<HTMLElement>;
    renderItem(item: any): Promise<HTMLElement>;
    pagingMarkup(page: number, pages: number, visibleCount: number): string;
}
export {};
