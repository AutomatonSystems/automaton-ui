import {List, Table, Panel} from '../dist/ui.js';

import POKEMON from './data/Pokemon.js';

let list = new List(item=>{
	return new Panel(`<img src="${item.img}"/><div>${item.name}</div>`);
	},{
		itemColumns: 3,
		itemsPerPage: 9
	});

list
	.addAttribute("id")
	.addAttribute("name")
	.addAttribute("img", null, i=>`<img src="${i.img}"/>`)
	.addFilter({
		attr: ["name"],
		value: "",
		suggest: true
	});
list.data = POKEMON;
list.sort("id", List.ASC);

let table = new Table({itemsPerPage: 4});
table
	.addAttribute("id")
	.addAttr("name", {
		display: {
			filterable: 'suggest'
		}
	})
	.addAttribute("img", null, i=>`<img src="${i.img}"/>`);
table.data = POKEMON;
table.sort("id", List.ASC);

export {list,table};