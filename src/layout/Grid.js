import "./Grid.css";

import { BasicElement } from "../BasicElement";
import UI from "../ui.js";
export class Grid extends BasicElement{

	#columns = 0;
	#rows = 0;

	/**
	 * @param {{padding?: string, columnGap?: string, rowGap?: string}}
	 */
	constructor({padding, columnGap, rowGap}= {}){
		super();

		this.setAttribute('ui-grid', '');
		
		if(padding !== undefined){
			this.setCss('--padding', padding);
		}

		if(rowGap !== undefined){
			this.setCss('row-gap', rowGap);
		}

		if(columnGap !== undefined){
			this.setCss('column-gap', columnGap);
		}
	}

	get columns(){
		return this.#columns;
	}

	set columns(n){
		this.#columns = n;
		this.setCss('--columns', n);
	}

	get rows(){
		return this.#rows;
	}

	set rows(n){
		this.#columns = n;
		this.setCss('--rows', n);
	}

	/**
	 * 
	 * @param {HTMLElement|HTMLElement[]} element 
	 * @param {Number} column 
	 * @param {Number} row 
	 * @param {Number} width 
	 * @param {Number} height 
	 */
	put(element, row, column, width=1, height=1){
		// auto expand rows
		if(this.rows < row + height - 1){
			this.rows = row + height - 1;
		}
		// auto expand rows
		if(this.columns < column + width - 1){
			this.columns = column + width - 1;
		}
		if(Array.isArray(element)){
			element = new UI.BasicElement(element);
			element.style.display = "flex";
		}
		element.style.setProperty('grid-area', `${row} / ${column} / span ${height} / span ${width}`);
		this.append(element);
	}
}
customElements.define('ui-grid', Grid);