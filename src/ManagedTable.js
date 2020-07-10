import { BasicElement } from "./BasicElement";

let uuid = 0;
export class ManagedTable extends BasicElement{

	constructor() {
		super();
		this.innerHTML = "";
		this.tableElement = document.createElement('table');
		this.tableElement.classList.add('ui-table');

		this.tableElement.innerHTML =
			`<thead>
			<!-- pagination -->
			<tr class="paging top"></tr>

			<tr class="headers"></tr>
			<!-- filters -->
		</thead>
		<tbody>
		</tbody>
		<tfoot>
			<!-- pagination -->
			<tr class="paging bottom"></tr>
		</tfoot>
		`;

		this.tbody = this.tableElement.querySelector('tbody');

		this.append(this.tableElement);

		this.sortColumn = null;
		this.sortAsc = false;

		this.columns = [];
		this.data = [];

		this.lookup = {};

		this.filter = null;

		this.pageNumber = 0;
		this.itemsPerPage = 20;
	}

	addColumn(title, valueFunc, displayFunc = valueFunc, width = null) {
		this.columns.push({
			"id": uuid++,
			"title": title,
			"width": width,
			"value": (typeof valueFunc == "string") ? i => i[valueFunc] : valueFunc,
			"displayFunc": (typeof displayFunc == "string") ? i => i[displayFunc] : displayFunc
		});
		return this;
	}

	_filtered(item) {
		return this.filter == null || this.filter(item);
	}

	_sort() {
		if (this.sortColumn == null)
			return;

		this.data.sort((a, b) => (this.sortColumn.value(a) - this.sortColumn.value(b)) * (this.sortAsc ? 1 : -1)
		);
	}

	sortBy(column, asc) {
		this.sort(this.columns.find(c => c.title == column), asc);
	}

	render() {
		this._sort();

		//render headers
		let header = this.tableElement.querySelector('thead tr.headers');
		let html = ``;
		let headers = this.getHeaders();
		for (let header of headers) {
			html += `<th data-table-id="${header.id}" style="${header.width ? `width:${header.width}` : ''}">${header.title}</th>`;
		}
		header.innerHTML = html;
		header.querySelectorAll('th').forEach((h, i) => {
			if (headers[i].value) {
				h.onclick = () => {
					this.sort(headers[i]);
				};
			}
		});
		if (this.sortColumn)
			this.tableElement.querySelector(`thead tr.headers th[data-table-id='${this.sortColumn.id}']`).classList.add(this.sortAsc ? 'asc' : 'desc');

		// render items
		this.tbody.style.display = 'none';
		let bodyhtml = '';
		for (let item of this.data) {
			if (item.__id == null)
				item.__id = item.id ? item.id : ('' + uuid++);

			// render item (possible hidden)
			let row = `<tr data-table-id="${item.__id}">`;
			for (let header of headers) {
				row += `<td>${header.displayFunc(item)}</td>`;
			}
			row += `</tr>`;
			bodyhtml += row;
		}
		this.tbody.innerHTML = bodyhtml;

		// do lookup 
		let eles = /** @type HTMLElement[] */ ([...this.tbody.children]);
		for (let item of this.data) {
			this.lookup[item.__id] = {
				item: item,
				ele: eles.find(ele => item.__id == ele.dataset['tableId'])
			};
		}

		// setup paging
		this.page(0);

		// show the body
		this.tbody.style.removeProperty('display');
	}

	getHeaders() {
		return this.columns;
	}

	sort(sortIndex = this.sortColumn, ascending = !this.sortAsc) {

		this.sortColumn = sortIndex;
		this.sortAsc = ascending;

		if (this.data.length == 0)
			return;

		this.tbody.style.display = 'none';
		// sort the underlying data
		this._sort();

		// update the header
		this.tableElement.querySelectorAll('thead tr.headers th').forEach(e => { e.classList.remove('desc'); e.classList.remove('asc'); });
		this.tableElement.querySelector(`thead tr.headers th[data-table-id='${this.sortColumn.id}']`).classList.add(this.sortAsc ? 'asc' : 'desc');

		// update the rows
		let rows = [];
		// remove
		[...this.tbody.children]
			.forEach(e => { e.parentElement.removeChild(e); });
		// re-add 
		let body = this.tbody;
		for (let item of this.data) {
			let ele = this.lookup[item.__id].ele;
			body.append(ele);
		}

		// do paging
		this.page(0);

		this.tbody.style.removeProperty('display');
	}

	page(page = this.pageNumber) {
		this.pageNumber = page;
		let visibleCount = 0;
		let needsPaging = false;
		BasicElement.castHtmlElements(...this.tbody.children)
			.forEach((ele, index) => {
				let id = ele.dataset['tableId'];
				let show = this._filtered(this.lookup[id].item);
				if (show)
					visibleCount++;
				let onPaged = false;

				if (visibleCount > this.pageNumber * this.itemsPerPage
					&& visibleCount <= (1 + this.pageNumber) * this.itemsPerPage) {

					onPaged = true;
				}
				else {
					needsPaging = true;
				}

				if (show && onPaged)
					ele.style.removeProperty('display');
				else
					ele.style.display = 'none';
			});
		if (needsPaging) {
			let html = '';
			let pages = Math.ceil(visibleCount / this.itemsPerPage);
			if (pages == 1)
				return;
			let extraButtons = 2;
			html += `<td colspan="${this.getHeaders().length}">
				${visibleCount} items
				<ui-button data-page="0" class="near" icon="fa-fast-backward"></ui-button>
				<ui-button data-page="${this.pageNumber - 1}" class="near" icon="fa-step-backward"></ui-button>`;
			for (let p = 0; p < pages; p++) {
				let near = p >= this.pageNumber - extraButtons && p <= this.pageNumber + extraButtons;
				html += `<ui-button data-page="${p}" class="${p == this.pageNumber ? 'active' : ''} ${near ? 'near' : ''}">${p + 1}</ui-button>`;
			}
			html += `<ui-button data-page="${this.pageNumber + 1}" class="near" icon="fa-step-forward"></ui-button>
			<ui-button data-page="${pages - 1}" class="near" icon="fa-fast-forward"></ui-button>
			</td>`;

			this.tableElement.querySelector('.paging.top').innerHTML = html;
			this.tableElement.querySelector('.paging.bottom').innerHTML = html;

			BasicElement.castHtmlElements(...this.tableElement.querySelectorAll('.paging ui-button')).forEach(ele => ele.addEventListener('click', () => {
				this.page(parseInt(ele.dataset['page']));
			}));
		}
	}
}
customElements.define('ui-table', ManagedTable);
