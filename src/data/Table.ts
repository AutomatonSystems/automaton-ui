import "./Table.css";

import { append, htmlToElement } from "../utils.js";
import { List } from "./List";
import { StringInput, StringInputOptions } from "../forms/Input.js";

/**
 * Table is a special case of List with a more automatic layout
 */

export class Table<T> extends List<T> {

	constructor(options: { itemsPerPage?: number; } = {}) {
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

	override get listLayout() {
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
	override sortDisplay() {
		let header = this.querySelector('thead tr.headers');
		let headers = Object.values(this.attrs);
		let html = '';
		for (let header of headers) {
			html += `<th data-table-id="${header.id}" ${this.attrs[header.name].value ? `data-sort="${header.name}"` : ''} style="${header.width ? `width:${header.width}` : ''}">${header.name}</th>`;
		}
		header.innerHTML = html;
		header.querySelectorAll('th').forEach(
			ele => {
				// if it's a sortable column add the click behaviour
				if (ele.dataset.sort) {
					ele.onclick = (event) => {
						this.sort(ele.dataset.sort);
					};
				}
			}
		);

		// highlight the sorted header
		if (this._sort)
			this.querySelector(`thead tr.headers th[data-table-id='${this._sort.attr.id}']`).classList.add(this._sort.asc ? 'asc' : 'desc');
	}

	/**
	 * Display the sorting headers
	 */
	 override filterDisplay() {
		let filterRow = this.querySelector('.filter');
		if(!filterRow.hasChildNodes()){
			let headers = Object.values(this.attrs);
			let filters = this.getFilters();
			for (let header of headers) {
				let cell = htmlToElement('<td></td>', 'tr');
				let filter = filters.find(f=>f.attr.includes(header.name))
				if(filter){
					let options: StringInputOptions = {
						placeholder: 'Search',
						callback: async (newValue: string, element: HTMLInputElement)=>{
							this.dirty = true;
							await this.page();
							element.blur();
						}
					};
					if(filter.suggest){
						options['options'] = async ()=>[...new Set(this.data.map((t:T)=>header.value(t).toString()))].sort();
					}
					cell.append(new StringInput(filter, 'value', options));
				}
				filterRow.append(cell);
			}
		}
	}
}
customElements.define('ui-table', Table);
