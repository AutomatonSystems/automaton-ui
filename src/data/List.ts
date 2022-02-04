import "./List.css";
import {Appendable, castHtmlElements, sleep} from "../utils.js";
import { BasicElement } from "../BasicElement";
import { StringInput } from "../ui.js";

let uuid = 0;

type ItemElementFunction<T> = (item: T) => HTMLElement | Promise<HTMLElement>;

type ValueElement =  string | number | boolean;
type ValueFunction<T> = (item:T) => ValueElement;

type DisplayFunction<T> = (item:T) => Appendable | Promise<Appendable>;

type Attr<T> = {
	"id": number,
	"name": string,
	"width": string,
	"value": ValueFunction<T>,
	"displayFunc": DisplayFunction<T>,

	sortable: boolean
}

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

type ListOptions = {
	itemColumns?:number
	itemsPerPage?: number
}

type Filter = {
	attr: string[]
	value: string
}

type AttrOptions<T> = {
	value?: string | ValueFunction<T>
	render?: string | DisplayFunction<T>

	display?: {
		width?: string
		sortable?: boolean
		filterable?: boolean
	}
}

export class List<T> extends BasicElement{

	// weakmap will ensure that we don't hold elements after they have fallen out of both the DOM and the data list
	elementMap = new WeakMap<any, HTMLElement>();

	static ASC = true;
	static DESC = false;

	/** @type {boolean} indictes if the item display state is out of date */
	dirty = true;

	_busy = false;

	_sort : {attr: Attr<T>, asc: Boolean} = null;

	attrs : Record<string, Attr<T>>= {};

	listBody: HTMLElement = null;


	_data: any[] = null;

	static ITEMS_COLUMNS_KEY = "--item-columns";
	static ITEMS_PER_PAGE_KEY = "--items-per-page";
	display: any[];
	lookup: {};

	// internal filters
	#filters: Filter[] = [];

	// extenally provided filtering
	_filterFunc: any;
	_itemDisplayFunc: ItemElementFunction<T>;
	pageNumber: number;

	constructor(itemDisplay: ItemElementFunction<T>, options: ListOptions = {}) {
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

		if(options.itemColumns)
			this.itemColumns = options.itemColumns;
		if(options.itemsPerPage)
			this.itemsPerPage = options.itemsPerPage;
	}

	async notBusy(){
		while(this._busy)
			await sleep(10);
	}

	set itemColumns(value: number){
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
	</footer>`
	}

	set data(data){``
		this._data = data;
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
	addAttribute(name: string, valueFunc: string|ValueFunction<T> = (i: any)=>i[name], displayFunc: string | ValueFunction<T> | DisplayFunction<T> = valueFunc, width: string = null) {
		this.attrs[name] = {
			"id": uuid++,
			"name": name,
			"width": width,
			"value": (typeof valueFunc == "string") ? i => (<any>i)[valueFunc] : valueFunc,
			"displayFunc": (typeof displayFunc == "string") ? i => (<any>i)[displayFunc] : displayFunc,

			sortable: valueFunc != null
		};
		this.dirty = true;
		return this;
	}

	addAttr(name: string, options: AttrOptions<T>){
		let valueFunc = options.value ?? name;
		let displayFunc = options.render ?? valueFunc;

		let attr: Attr<T> = {
			id: uuid++,
			name: name,

			width: options.display?.width,

			// @ts-ignore
			value: typeof valueFunc === "string" ? (i: any) => i[valueFunc] : valueFunc,
			// @ts-ignore
			displayFunc: typeof displayFunc === "string" ? (i: any) => i[displayFunc] : displayFunc,

			sortable: valueFunc != null && (options.display?.sortable ?? true),
		}
		this.attrs[name] = attr;
		if(valueFunc != null && (options.display?.filterable ?? false)){
			this.addFilter({
				attr: [name],
				value: ''
			})
		}
		this.dirty = true;
		return this;
	}

	getFilters(){
		return this.#filters;
	}

	addFilter(filter: Filter){
		this.#filters.push(filter);
		return this;
	}

	#internalFilter(item: T): boolean{
		filters:
		for(let filter of this.#filters){
			if(filter.value){
				for(let attr of filter.attr){
					let value = ('' + this.attrs[attr]?.value(item)).toLowerCase();
					if(value.toLowerCase().includes(filter.value)){
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

	_filtered(item: T) {
		return this.#internalFilter(item) && (this._filterFunc == null || this._filterFunc(item));
	}

	filter(func=this._filterFunc){
		this._filterFunc = func;
		this.dirty = true;
		this.notBusy()
			.then(()=>this.page(0));
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

		if(Object.values(this.attrs).length==0 || this.data.length ==0)
			wrapper.style.display = "none";
	}

	filterDisplay(){
		let wrapper = this.querySelector('.filter');

		if(!wrapper.hasChildNodes()){
			for(let filter of this.#filters){
				wrapper.append(new StringInput(filter, 'value', {
					placeholder: 'Search',
					callback: async (newValue: string)=>{
						this.dirty = true;
						await this.page();
					}
				}));
			}
		}

		if(Object.values(this.attrs).length==0 || this.data.length ==0)
			wrapper.style.display = "none";
	}

	async render(forceRedraw=false) {
		// TODO render busy spinner?
		if(forceRedraw){
			this.dirty = true;
		}
		// render headers
		this.sortDisplay();

		// render filters
		this.filterDisplay();
		
		// setup paging
		await this.page();
	}

	async sort(attribute: string|Attr<T> = this._sort?.attr, asc = !this._sort?.asc) {
		this.dirty = true;

		let attr = (typeof attribute == 'string')?this.attrs[attribute]:attribute;

		if(attribute == null){
			this._sort = null;
		}else{
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
		try{
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
						return asc*(''+a).localeCompare(''+b, "en", {sensitivity: 'base', ignorePunctuation: true, numeric: true});
					});
				}
				this.dirty = false;
				this.pageNumber = 0;
			}
			
			// compute paging numbers
			let visibleCount = this.display.length;
			let pages = this.itemsPerPage<Infinity?Math.ceil(visibleCount / this.itemsPerPage):1;
			let needsPaging = pages > 1;
			this.pageNumber = isNaN(page)?0:Math.max(Math.min(page, pages-1), 0);

			// render the paging if needed
			if (needsPaging) {
				let paging = this.pagingMarkup(this.pageNumber, pages, visibleCount);
				this.querySelector('.paging.top').innerHTML = paging;
				this.querySelector('.paging.bottom').innerHTML = paging;

				// add auto paging callback 
				castHtmlElements(...this.querySelectorAll('[data-page]')).forEach(ele => ele.addEventListener('click', () => {
					this.page(parseInt(ele.dataset['page']));
				}));
			}else{
				this.querySelector('.paging.top').innerHTML = "";
				this.querySelector('.paging.bottom').innerHTML = "";
			}

			// finally actually add the items to the page
			this.listBody.innerHTML = "";
			let start = this.itemsPerPage==Infinity?0:this.pageNumber*this.itemsPerPage;
			for(let index = start; index < (this.pageNumber+1)*this.itemsPerPage && index < visibleCount; index++){
				let item = this.display[index];
				let ele = (await this.getItemElement(item));
				if(ele instanceof BasicElement){
					ele.attach(this.listBody);
				}else{
					this.listBody.appendChild(ele);
				}
			}
		}finally{
			this._busy = false;
		}
	}

	async getItemElement(item: any){
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

	async renderItem(item: any){
		return await this._itemDisplayFunc(item);
	}

	pagingMarkup(page: number, pages: number, visibleCount: number){
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


