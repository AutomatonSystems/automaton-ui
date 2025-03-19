import "./Grid.css";

import { BasicElement } from "../BasicElement";
import UI from "../ui.js";

export type GridOptions = {
	padding?: string
	columnGap?: string
	rowGap?: string
}

export class Grid extends BasicElement{

	#columns = 0;
	#rows = 0;

	constructor(options?: GridOptions){
		super();

		this.setAttribute('ui-grid', '');
		
		if(options?.padding !== undefined){
			this.setCss('--padding', options?.padding);
		}

		if(options?.rowGap !== undefined){
			this.setCss('row-gap', options?.rowGap);
		}

		if(options?.columnGap !== undefined){
			this.setCss('column-gap', options?.columnGap);
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

	put(element: HTMLElement|HTMLElement[], row: number, column: number, width=1, height=1){
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