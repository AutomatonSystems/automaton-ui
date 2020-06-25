
export const sleep = (time, value)=>new Promise(r=>setTimeout(()=>r(value),time));
window['sleep'] = sleep;

export class BasicElement extends HTMLElement{
	constructor(content){
		super();

		this.self = this;

		if(content){
			this.innerHTML = content;
		}

		this.remove = this.remove.bind(this);
	}

	get visible(){
		return this.self.hidden == false;
	}

	/**
	 * @param {Boolean} boolean
	 */
	set visible(boolean){
		if(boolean){
			this.self.removeAttribute("hidden");
		}else{
			this.self.setAttribute("hidden", '');
		}
	}

	show(parent=null){
		// attach to dom if I haven't already
		this.self.attach(parent);
		// and show
		this.self.visible = true;
		return this;
	}

	hide(){
		this.self.visible = false;
		return this;
	}

	remove(){
		this.self.parentElement?.removeChild(this.self);
		return this;
	}

	/**
	 * Walk up dom tree looking for a closable element
	 */
	close(){
		let ele = this.parentElement;
		while(ele['close']==null){
			ele = ele.parentElement;
		}
		ele['close']();
		return this;
	}

	attach(parent=null){
		if(!this.self.parentElement){
			if(parent==null)
				parent = document.body;
			parent.appendChild(this.self);
		}
		return this;
	}
}
customElements.define('ui-basic', BasicElement);

export class Spacer extends BasicElement{
	constructor(){
		super();
	}
}
customElements.define('ui-spacer', Spacer);

export class Button extends BasicElement{
	constructor(content, callback, {icon=''}={}){
		super(content);

		this.addEventListener('click', callback);

		icon = icon || this.attributes.getNamedItem("icon")?.value;
		if(icon){
			let i = document.createElement('i');
			i.classList.add("fa", icon.trim());
			this.prepend(i);
		}
	}
}
customElements.define('ui-button', Button);

export class Badge extends BasicElement{
	constructor(content, {icon=''}={}){
		super(content);

		icon = icon || this.attributes.getNamedItem("icon")?.value;
		if(icon){
			let i = document.createElement('i');
			i.classList.add("fa", icon.trim());
			this.prepend(i);
		}
	}
}
customElements.define('ui-badge', Badge);

export class Cancel extends BasicElement{
	constructor(){
		super("Cancel");

		this.addEventListener('click', this.close.bind(this));
	}
}
customElements.define('ui-cancel', Cancel);

export class Panel extends BasicElement{

	/**
	 * 
	 * @param {String} content 
	 * @param {{title?: String, clazz?: String, buttons?: String}} param1 
	 */
	constructor(content = '', {title='', clazz='', buttons=''}={}){
		super();
		if(!this.innerHTML.trim()){
			this.innerHTML = `
				${title?`<header>${title}</header>`:''}
				<content></content>
				${buttons?`<footer>${buttons}</footer>`:''}
			`;

			if(typeof content == 'string')
				this.querySelector('content').innerHTML = content;
			else
				this.querySelector('content').appendChild(content);
		}

		if(clazz){
			this.classList.add(clazz);
		}
	}

	append(...elements){
		this.querySelector('content').append(...elements);
	}
}
customElements.define('ui-panel', Panel);

export class Splash extends BasicElement{
	
	constructor(content, {dismissable=false}={}){
		super(content);

		if(dismissable){
			this.addEventListener('mousedown', this.remove);
		}
	}
}
customElements.define('ui-splash', Splash);

export class Modal extends Splash{
	constructor(content, {title='', clazz='', buttons=''}={}){
		super('',{dismissable: true});

		let panel = new Panel(content, {title, clazz, buttons});
		panel.addEventListener("mousedown",()=>event.stopPropagation());
		// rebind panel to parent splash so hide/show etc call parent
		panel.self = this;
		this.appendChild(panel);
	}

	close(){
		this.self.remove();
		return this;
	}
}
customElements.define('ui-modal', Modal);


export class Code extends BasicElement{

	static _workerContent = window.URL.createObjectURL(new Blob([
		`onmessage = (event) => {
			importScripts('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.1.0/highlight.min.js');
			const hljs = self.hljs;
			hljs.configure({})
			const result = hljs.highlightAuto(event.data);
			postMessage(result.value);
		};`]));

	constructor(content){
		super(content);

		content = this.preprocess(content || this.innerHTML);
		// send the stuff off to a webworker to be prettified
		let worker = new Worker(Code._workerContent);
		worker.onmessage = (event) => {
			this.classList.add('hljs');
			this.innerHTML = event.data;
		}
		worker.postMessage(content);
	}

	preprocess(content){
		return content;
	}
}
customElements.define('ui-code', Code);

export class Json extends Code{
	constructor(content){
		super(content);
	}

	preprocess(content){
		if(typeof content == 'object')
			return JSON.stringify(content,null,"\t");
		return JSON.stringify(JSON.parse(content),null,"\t");
	}
}
customElements.define('ui-json', Json);

export class Spinner extends BasicElement{
	constructor(){
		super();

		let size = this.attributes.getNamedItem("size")?.value || "1em";
		this.style.setProperty("--size", size);
	}
}
customElements.define('ui-spinner', Spinner);

export class SortableTable{

	constructor(tableElement){
		this.tableElement = tableElement;
		this.tableElement.classList.add('ui-table');

		this.getHeaders().forEach((h,i)=>{
			h.onclick = ()=>{
				this.sortHeader(i);
			};
		});
		this.sortIndex = 1;
		this.ascending = true;
	}

	getHeaders(){
		return [...this.tableElement.querySelectorAll('thead tr th')];
	}

	readValue(a, sortIndex){
		let aCells = [...a.children];
		if(aCells.length<sortIndex) {
			return null;
		}
		let aEle = aCells[sortIndex];
		let value = null;
		if(aEle.dataset['value']) {
			value = aEle.dataset['value'];
		} else {
			value = aEle.innerHTML;
		}
		if(isNaN(parseFloat(value))) {
			return (value+'').toLocaleLowerCase();
		}
		return parseFloat(value);
	}

	sortHeader(index, order){
		let headers = this.getHeaders();
		let h = headers[index];
		let asc = order ?? !h.classList.contains('asc');
		this.sort(index,asc);
		headers.forEach(h2=>h2.classList.remove('desc','asc'));
		h.classList.add(asc?'asc':'desc');
	}

	sort(sortIndex = this.sortIndex, ascending = this.ascending){
		let ascMult = ascending?1:-1;
		let body = this.tableElement.querySelector('tbody');
		let list = [...body.children];
		list.sort((a,b)=>{
			let av = this.readValue(a,sortIndex);
			let bv = this.readValue(b,sortIndex);
			if(isNaN(av) != isNaN(bv)){
				return isNaN(av)?1:-1;
			}else if(isNaN(av)){
				return ascMult * ((av+'').localeCompare(bv+''));
			}else{
				return ascMult * (av - bv);
			}
		});
		body.innerHTML = null;
		list.forEach(e=>body.appendChild(e));

		this.sortIndex = sortIndex;
		this.ascending = ascending;
	}
}
window["SortableTable"] = SortableTable;

let uuid = 0;

export class ManagedTable{

	constructor(tableElement){
		this.tableElement = tableElement;
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
		`

		this.tbody = this.tableElement.querySelector('tbody');

		this.sortColumn = null;
		this.sortAsc = false;

		this.columns = [];
		this.data = [];

		this.lookup = {};

		this.filter = null;

		this.pageNumber = 0;
		this.itemsPerPage = 20;
	}

	addColumn(title, valueFunc, displayFunc = valueFunc, width = null){
		this.columns.push({
			"id": uuid++,
			"title": title,
			"width": width,
			"value": (typeof valueFunc == "string")?i=>i[valueFunc]:valueFunc,
			"displayFunc": (typeof displayFunc == "string")?i=>i[displayFunc]:displayFunc
		});
		return this;
	}

	_filtered(item){
		return this.filter==null || this.filter(item);
	}

	_sort(){
		if(this.sortColumn==null)
			return;

		this.data.sort((a,b)=>
			(this.sortColumn.value(a) - this.sortColumn.value(b)) * (this.sortAsc?1:-1)
		);
	}

	sortBy(column, asc){
		this.sort(this.columns.find(c=>c.title==column), asc);
	}

	render(){
		this._sort();

		//render headers
		let header = this.tableElement.querySelector('thead tr.headers');
		let html = ``;
		let headers = this.getHeaders();
		for(let header of headers){
			html += `<th data-table-id="${header.id}" style="${header.width?`width:${header.width}`:''}">${header.title}</th>`
		}
		header.innerHTML=html;
		header.querySelectorAll('th').forEach((h,i)=>{
			h.onclick = ()=>{
				this.sort(headers[i]);
			};
		});
		if(this.sortColumn)
			this.tableElement.querySelector(`thead tr.headers th[data-table-id='${this.sortColumn.id}']`).classList.add(this.sortAsc?'asc':'desc');

		// render items
		this.tbody.style.display = 'none';
		let bodyhtml = '';
		for(let item of this.data){
			if(item.__id==null)
				item.__id = item.id? item.id:(''+ uuid++);
			
			// render item (possible hidden)
			let row = `<tr data-table-id="${item.__id}">`;
			for(let header of headers){
				row+=`<td>${header.displayFunc(item)}</td>`
			}
			row+=`</tr>`;
			bodyhtml+=row;
		}
		this.tbody.innerHTML = bodyhtml;

		// do lookup 
		let eles = [...this.tbody.children]
		for(let item of this.data){
			this.lookup[item.__id] = {
				item: item,
				ele: eles.find(ele=>item.__id == ele.dataset['tableId'])
			}
		}

		// setup paging
		this.page(0);

		// show the body
		this.tbody.style.removeProperty('display');
	}

	getHeaders(){
		return this.columns;
	}

	sort(sortIndex = this.sortColumn, ascending = !this.sortAsc){
		
		this.sortColumn = sortIndex;
		this.sortAsc = ascending;

		if(this.data.length==0)
			return;

		this.tbody.style.display = 'none';
		// sort the underlying data
		this._sort();

		// update the header
		this.tableElement.querySelectorAll('thead tr.headers th').forEach(e=>{e.classList.remove('desc');e.classList.remove('asc')});
		this.tableElement.querySelector(`thead tr.headers th[data-table-id='${this.sortColumn.id}']`).classList.add(this.sortAsc?'asc':'desc');

		// update the rows
		let rows = [];
		// remove
		[...this.tbody.children]
			.forEach(e=>{e.parentElement.removeChild(e)});
		// re-add 
		let body = this.tbody;
		for(let item of this.data){
			let ele = this.lookup[item.__id].ele;
			body.append(ele);
		}

		// do paging
		this.page(0);

		this.tbody.style.removeProperty('display');
	}

	page(page = this.pageNumber){
		this.pageNumber = page;
		let visibleCount = 0;
		let needsPaging = false;
		[...this.tbody.children]
			.forEach((ele,index)=>{
				let id = ele.dataset['tableId'];
				let show = this._filtered(this.lookup[id].item);
				if(show)
					visibleCount++;
				let onPaged = false;
					
				if(visibleCount >= this.pageNumber*this.itemsPerPage 
					&& visibleCount < (1+this.pageNumber)*this.itemsPerPage){
					
					onPaged = true;
				}else{
					needsPaging = true;
				}

				if(show && onPaged)
					ele.style.removeProperty('display');
				else
					ele.style.display = 'none';
			});
		if(needsPaging){
			let html = '';
			let pages = Math.ceil(visibleCount/this.itemsPerPage);
			let extraButtons = 2;
			html += `<td colspan="${this.getHeaders().length}">
				${visibleCount} items
				<ui-button data-page="0" class="near" icon="fa-fast-backward"></ui-button>
				<ui-button data-page="${this.pageNumber-1}" class="near" icon="fa-step-backward"></ui-button>`
			for(let p = 0; p<pages; p++){
				let near = p >= this.pageNumber - extraButtons && p <= this.pageNumber +extraButtons;
				html += `<ui-button data-page="${p}" class="${p==this.pageNumber?'active':''} ${near?'near':''}">${p+1}</ui-button>`
			}
			html += `<ui-button data-page="${this.pageNumber+1}" class="near" icon="fa-step-forward"></ui-button>
			<ui-button data-page="${pages-1}" class="near" icon="fa-fast-forward"></ui-button>
			</td>`

			this.tableElement.querySelector('.paging.top').innerHTML = html;
			this.tableElement.querySelector('.paging.bottom').innerHTML = html;
			
			this.tableElement.querySelectorAll('.paging ui-button').forEach(ele=>
				ele.addEventListener('click', ()=>{
					this.page(parseInt(ele.dataset['page']));
				}));
		}
	}
}
window["SortableTable"] = SortableTable;

export class Toaster extends BasicElement{
	constructor(){
		super();
		this.attach();
	}
}
customElements.define('ui-toaster', Toaster);

export class Toast extends BasicElement{
	constructor(message, {level='info'}={}){
		super(message);

		let i = document.createElement('i');
		let icon = {'debug': 'fa-bug','info': 'fa-info','warn': 'fa-exclamation','error': 'fa-exclamation'}[level];
		i.classList.add("fa", icon);
		this.prepend(i);

		if(!document.querySelector('ui-toaster')){
			new Toaster();
		}
		let toaster = document.querySelector('ui-toaster');

		this.classList.add(level);
		toaster.prepend(this);
		let count = document.querySelectorAll('ui-toast').length;
		setTimeout(()=>this.style.marginTop = '10px',10);
		setTimeout(()=>{this.style.marginTop = '-50px'; this.style.opacity =  '0'},4800);
		setTimeout(()=>this.remove(),5000);
	}
}
customElements.define('ui-toast', Toast);

export class Form extends BasicElement{
	constructor(template){
		super();

		this.template = template;
		this.changeListeners = [];
		this.onChange = this.onChange.bind(this);

		this.value = {};
	}

	async build(json){
		this.changeListeners = [];
		let eles = await this.jsonToHtml(this.template, json);
		this.innerHTML = "<table></table>";
		this.querySelector('table').append(...eles);
		// add change listeners
		let inputs = this.querySelectorAll('[data-key]');
		for(let input of inputs){
			input.addEventListener('change', this.onChange);
		}
		// finally trigger them for the starting state
		this.onChange();

		return this;
	}

	onChange(){
		let json = this.json();
		this.changeListeners.forEach(l=>l(json));
		this.value = json;
	}

	json(){
		let json = {};

		let inputs = this.querySelectorAll('[data-key]');
		for(let input of inputs){
			let parent = json;
			// grab the correct place to store this value
			let keys = input['dataset']['key'].split('.');
			let key = keys.pop();
			// initialize any nesting
			for(let k of keys){
				parent[k] = parent[k] ?? {};
				parent = parent[k];
			}
			// read the value
			let value = input['value'];
			// finally assign it to out return object
			parent[key] = value;
		}

		return json;
	}

	async jsonToHtml(template, json, jsonKey = ''){
		let elements = [];
		for(let item of template){
			if(typeof item == "string"){
				item = {
					key: item.split(':')[0],
					type: item.split(':')[1]
				}
			}
			elements.push(await this.oneItem(item, json[item.key], (jsonKey ? jsonKey + ".":'') + item.key));
		}
		return elements;
	}

	async oneItem(template, json, jsonKey){

		let element = document.createElement('tr');
		
		if(template.hidden){
			this.changeListeners.push((json)=>{
				element.hidden = template.hidden(json);
			});
		}

		let label = document.createElement("th");
		label.innerHTML = template.name ?? template.key;
		if(template.hint){
			let hint = document.createElement('div');
			hint.innerHTML = template.hint;
			label.append(hint);
		}
		element.append(label);

		let wrapper = document.createElement("td");
		element.append(wrapper);

		if(typeof template.type == "string"){
			let html = '';
			switch(template.type){
				case 'list':
					html += `<select data-key="${jsonKey}">`
					let options = template.options;
					if(!Array.isArray(options))
						options = await options();
					html += options.map(v=>`<option 
							${(json == (v.value?v.value:v))?'selected':''}
							value=${v.value?v.value:v}>${v.name?v.name:v}</option>`).join('');
					html += `</select>`
					break;
				case 'text':
					html += `<textarea data-key="${jsonKey}">${json ?? ''}</textarea>`
					break;
				case 'string':
					html += `<input data-key="${jsonKey}" type="text" value="${json ?? ''}" placeholder="${template.placeholder??''}"/>`
					break;
				case 'number':
					html += `<input data-key="${jsonKey}" type="number" value="${json ?? ''}"/>`
					break;
			}
			wrapper.innerHTML = html;

		}else if(Array.isArray(template.type)){
			wrapper.append(...await this.jsonToHtml(template.type, json ?? {}, jsonKey));
		}
		return element;
	}
}
customElements.define('ui-form', Form);