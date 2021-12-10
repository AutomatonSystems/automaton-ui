import "./List.css";
import { BasicElement } from "../BasicElement";
declare type ItemElementFunction<T> = (item: T) => HTMLElement | Promise<HTMLElement>;
declare type ValueFunction<T> = (item: T) => string | number;
declare type DisplayFunction<T> = (item: T) => string | HTMLElement | HTMLElement[] | Promise<string | HTMLElement | HTMLElement[]>;
declare type Attr<T> = {
    "id": number;
    "name": string;
    "width": string;
    "value": ValueFunction<T>;
    "displayFunc": DisplayFunction<T>;
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
export declare class List<T> extends BasicElement {
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
    constructor(itemDisplay: ItemElementFunction<T>, options?: {
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
    addAttribute(name: string, valueFunc?: string | ValueFunction<T>, displayFunc?: string | ValueFunction<T> | DisplayFunction<T>, width?: string): this;
    _filtered(item: any): any;
    filter(func?: any): void;
    /**
     * Display the sorting headers
     */
    sortDisplay(): void;
    render(forceRedraw?: boolean): Promise<void>;
    sort(attribute?: string | Attr<T>, asc?: boolean): Promise<void>;
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
export declare class Table<T> extends List<T> {
    constructor(options?: {
        itemsPerPage?: number;
    });
    get listLayout(): string;
    /**
     * Display the sorting headers
     */
    sortDisplay(): void;
}
export {};
