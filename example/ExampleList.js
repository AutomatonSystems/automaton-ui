import {List, Table, Panel} from '../dist/ui.js';

import DATA from './ListData.js';

let list = new List(item=>{
	return new Panel(`<img src="${item.img}"/><div>${item.name}</div>`);
	},{
		itemColumns: 3,
		itemsPerPage: 9
	});

list
	.addAttribute("id")
	.addAttribute("name")
	.addAttribute("img", null, i=>`<img src="${i.img}"/>`);
list.data = DATA;
list.sort("id", List.ASC);

let table = new Table({itemsPerPage: 4});
table
	.addAttribute("id")
	.addAttribute("name")
	.addAttribute("img", null, i=>`<img src="${i.img}"/>`);
table.data = DATA;
table.sort("id", List.ASC);

export {list,table};