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
	.addAttr("name", {
		display: {
			filterable: true
		}
	})
	.addAttribute("img", null, i=>`<img src="${i.img}"/>`);
list.data = POKEMON;
list.sort("id", List.ASC);

let table = new Table({itemsPerPage: 4});
table
	.addAttribute("id")
	.addAttr("name", {
		display: {
			filterable: true
		}
	})
	.addAttribute("img", null, i=>`<img src="${i.img}"/>`);
table.data = POKEMON;
table.sort("id", List.ASC);

export {list,table};