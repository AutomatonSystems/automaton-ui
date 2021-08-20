var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import "./List.css";
import { append } from "../utils.js";
import { BasicElement } from "../BasicElement";
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
export class List extends BasicElement {
    /**
     *
     * @param {itemElement} itemDisplay
     * @param {{itemColumns?:number, itemsPerPage?: number}} options
     */
    constructor(itemDisplay, options = {}) {
        super();
        // weakmap will ensure that we don't hold elements after they have fallen out of both the DOM and the data list
        /** @type {WeakMap<Object,HTMLElement>} */
        this.elementMap = new WeakMap();
        /** @type {boolean} indictes if the item display state is out of date */
        this.dirty = true;
        /** @type {{attr: Attr, asc: Boolean}|null} */
        this._sort = null;
        /** @type {Object.<String, Attr>} */
        this.attrs = {};
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
        if (options.itemColumns)
            this.itemColumns = options.itemColumns;
        if (options.itemsPerPage)
            this.itemsPerPage = options.itemsPerPage;
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
        this.page(0);
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
    render(forceRedraw = false) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO render busy spinner?
            if (forceRedraw) {
                this.dirty = true;
            }
            //render headers
            this.sortDisplay();
            // setup paging
            yield this.page();
        });
    }
    getItemElement(item) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.elementMap.has(item)) {
                let ele = yield this.renderItem(item);
                if (typeof item == "string") {
                    // TODO support caching of string based item elements....
                    return ele;
                }
                this.elementMap.set(item, ele);
            }
            return this.elementMap.get(item);
        });
    }
    renderItem(item) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._itemDisplayFunc(item);
        });
    }
    /**
     *
     * @param {Attr|String} attribute name of the attribute to sort on
     * @param {Boolean} asc ASC of DESC sort
     */
    sort(attribute, asc) {
        var _c, _d;
        if (attribute === void 0) { attribute = (_c = this._sort) === null || _c === void 0 ? void 0 : _c.attr; }
        if (asc === void 0) { asc = !((_d = this._sort) === null || _d === void 0 ? void 0 : _d.asc); }
        return __awaiter(this, void 0, void 0, function* () {
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
            yield this.render();
        });
    }
    /**
     *
     * @param {Number} page ZERO-INDEXED page number
     */
    page(page = this.pageNumber) {
        return __awaiter(this, void 0, void 0, function* () {
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
                        return asc * ('' + a).localeCompare('' + b, "en", { sensitivity: 'base', ignorePunctuation: 'true', numeric: true });
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
                BasicElement.castHtmlElements(...this.querySelectorAll('[data-page]')).forEach(ele => ele.addEventListener('click', () => {
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
                let ele = (yield this.getItemElement(item));
                if (ele instanceof BasicElement) {
                    ele.attach(this.listBody);
                }
                else {
                    this.listBody.appendChild(ele);
                }
            }
        });
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
List.ASC = true;
List.DESC = false;
List.ITEMS_COLUMNS_KEY = "--item-columns";
List.ITEMS_PER_PAGE_KEY = "--items-per-page";
customElements.define('ui-list', List);
/**
 * Table is a special case of List with a more automatic layout
 */
export class Table extends List {
    /**
     *
     * @param {{itemsPerPage?: number}} options
     */
    constructor(options = {}) {
        super((item) => __awaiter(this, void 0, void 0, function* () {
            let tr = document.createElement('tr');
            tr.dataset['tableId'] = item.__id;
            // render item (possible hidden)
            for (let header of Object.values(this.attrs)) {
                let cell = document.createElement('td');
                let content = yield header.displayFunc(item);
                append(cell, content);
                tr.append(cell);
            }
            return tr;
        }), options);
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
//# sourceMappingURL=List.js.map