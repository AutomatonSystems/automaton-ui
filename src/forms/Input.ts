import UI from "../ui.js";
import { BasicElement } from "../BasicElement.js";
import "./Input.css";

type AbstractInputOptions = {
	callback?: Function
	class?: string|string[]
	size?:number
	color?:string
	placeholder?:string
}

export class AbstractInput extends BasicElement{
	obj: any;
	key: any;

	/**
	 * 
	 * @param obj json object/array to keep up to date
	 * @param key json key/indes to keep up to date
	 * @param options configuration parameters 
	 */
	constructor(obj: any, key: any, options?: AbstractInputOptions){
		super();

		this.obj = obj;
		this.key = key;

		this.setAttribute("ui-input", '');

		if(options.class){
			if(Array.isArray(options.class)){
				this.classList.add(...options.class);
			}else{
				this.classList.add(options.class);
			}
		}
	}

	get value(){
		return Reflect.get(this.obj, this.key);
	}

	set value(value){
		Reflect.set(this.obj, this.key, value);
	}

	/**
	 * 
	 * @param {String} name 
	 * 
	 * @returns {InputLabel}
	 */
	label(name: string){
		return new InputLabel(this, name, {wrapped: true});
	}
}

export class AbstractHTMLInput extends HTMLInputElement{


	/**
	 * 
	 * @param obj json object/array to keep up to date
	 * @param key json key/indes to keep up to date
	 * @param options configuration parameters 
	 */
	constructor(obj: any, key: any, options: AbstractInputOptions){
		super();

		this.setAttribute("ui-input", '');

		if(options.class){
			if(Array.isArray(options.class)){
				this.classList.add(...options.class);
			}else{
				this.classList.add(options.class);
			}
		}
	}

	/**
	 * 
	 * @param {String} name 
	 * 
	 * @returns {InputLabel}
	 */
	label(name: string){
		return new InputLabel(<AbstractInput><any>this, name, {wrapped: true});
	}
}

export class StringInput extends AbstractHTMLInput{

	/**
	 * 
	 * @param obj json object/array to keep up to date
	 * @param key json key/indes to keep up to date
	 * @param options configuration parameters 
	 */
	constructor(obj: any, key: any, options: AbstractInputOptions){
		super(obj, key, options);

		this.type = "text";
		
		this.value = Reflect.get(obj, key) ?? null;

		if(options?.size)
			this.style.width = (options?.size*24)+"px";
		
		if(options?.color)
			this.style.setProperty('--color', options?.color);

		if(options?.placeholder){
			this.setAttribute('placeholder', options?.placeholder);
		}

		this.addEventListener('change', ()=>{
			let value = this.value;
			Reflect.set(obj, key, value);
			if(options?.callback)
				options?.callback(value);
		});
	}
}
customElements.define('ui-stringinput', StringInput, {extends:'input'});


/**
 * A number input that keeps a json object 
 * up to date with it's value
 * 
 */
export class NumberInput extends AbstractHTMLInput{

	/**
	 * 
	 * @param {*} obj json object/array to keep up to date
	 * @param {*} key json key/indes to keep up to date
	 * @param {{callback?: Function, size?:Number, color?:String, placeholder?:string}} params configuration parameters 
	 */
	constructor(obj: any, key: any, options: AbstractInputOptions){
		super(obj, key, options);

		this.type = "number";
		
		this.value = Reflect.get(obj, key);

		if(options?.size)
			this.style.width = (options?.size*24)+"px";
		
		if(options?.color)
			this.style.setProperty('--color', options?.color);

		if(options?.placeholder)
			this.setAttribute('placeholder', options?.placeholder);

		this.addEventListener('change', ()=>{
			let value = parseFloat(this.value);
			Reflect.set(obj, key, value);
			if(options?.callback)
				options?.callback(value);
		});
	}
	
}
customElements.define('ui-numberinput', NumberInput, {extends:'input'});

type SelectInputOptions = AbstractInputOptions & {
	options: (()=>Promise<SelectInputOption[]>) | SelectInputOption[]
}

type SelectInputOption = {
	value: any
	display: any
} | string


export class SelectInput extends HTMLSelectElement{

	_value: any = null;
	obj: any;
	key: any;

	constructor(obj: any, key: any, options: SelectInputOptions = {options: []}){
		super();
		this.obj = obj;
		this.key = key;

		this.setAttribute("ui-input", '');

		if(options?.size)
			this.style.width = (options?.size*24)+"px";
		
		if(options?.color)
			this.style.setProperty('--color', options?.color);

		if(options?.placeholder)
			this.setAttribute('placeholder', options?.placeholder);

		this.addEventListener('change', ()=>{
			let value = this.value;
			this.setValue(value);
			if(options?.callback)
				options?.callback(value);
		});

		this.renderOptions(options.options);
	}

	getValue(){
		return Reflect.get(this.obj, this.key) ?? null;
	}

	setValue(value: any){
		Reflect.set(this.obj, this.key, value);
	}
	async renderOptions(optionsArg: (()=>Promise<SelectInputOption[]>) | SelectInputOption[]){
		let options: SelectInputOption[] = null;
		if(typeof optionsArg == 'function'){
			options = await optionsArg();
		}else{
			options = optionsArg;
		}
		let value = this.getValue();
		for(let opt of options){
			let option = document.createElement('option');
			if(typeof opt == 'string'){
				if(opt == value)
					option.setAttribute('selected', '');
				option.innerText = opt;
			}else{
				if(opt.value == value)
					option.setAttribute('selected', '');
				option.innerText = opt.display ?? opt.value;
				option.value = opt.value;
			}
			this.append(option);
		}
	}
}
customElements.define('ui-selectinput', SelectInput, {extends:'select'});

type MultiSelectInputOptions = {
	options: any
}

export class MultiSelectInput extends AbstractInput{
	list: HTMLElement;
	constructor(obj: any , key: any, options: MultiSelectInputOptions){
		super(obj, key);

		if(!Array.isArray(this.value))
			this.value = [];

		let list = document.createElement("content");
		this.list = list;
		this.append(list);

		// picker
		// TODO other string picker options
		let select = document.createElement("select");
		select.innerHTML = "<option selected disabled hidden>Add...</option>"+options.options.map((o: any)=>`<option>${o}</option>`).join('');
		select.addEventListener("change", ()=>{
			this.value.push(select.value);
			select.value = "Add...";
			this.renderList();
		});
		this.append(select);

		this.renderList();
	}

	renderList(){
		this.list.innerHTML = "";
		this.list.append(...this.value.map((v: any, index: number)=>{
			let badge = new UI.Badge(v);
			badge.append(new UI.Button('', ()=>{
				// remove this item and redraw
				this.value.splice(index, 1);
				this.renderList();
			}, {icon: 'fa-times', style: 'text', color: 'error-color'}))
			return badge;
		}));
	}
}
customElements.define('ui-multiselectinput', MultiSelectInput);

export class JsonInput extends AbstractInput{

	constructor(obj: any, key: any){
		super(obj, key);

		let text = document.createElement('textarea');
		text.onkeydown = (e)=>{
			if(e.key=='Tab'){
				e.preventDefault();
				let s = text.selectionStart;
				this.value = this.value.substring(0,text.selectionStart) + "\t" + this.value.substring(text.selectionEnd);
				text.selectionEnd = s+1; 
			}
		}
		let resize = ()=>{
			text.style["height"] = "1px";
			text.style["height"] = text.scrollHeight+"px";
		}
		text.onkeyup = resize;
		text.addEventListener('change', ()=>{
			try{
				let json = JSON.parse(text.value);
				this.value = json;
				this.classList.toggle('error', false);
			}catch(e){
				this.classList.toggle('error', true);
			}
		});
		text.value = JSON.stringify(this.value ?? "", null, "\t");
		this.append(text);

		setTimeout(resize, 10);
	}


}
customElements.define('ui-json-input', JsonInput);

export class InputLabel extends HTMLLabelElement{

	input: AbstractInput;

	constructor(inputElement: AbstractInput, display: string, {wrapped = false}= {}){
		super();

		if(wrapped){
			// wrap the item with the label
			this.innerHTML = `<span class="label">${display}</span>`;
			this.append(inputElement);
		}else{

			let id = inputElement.id;
			if(id==null){
				// generate a (likely) unique id and use it
				id =  "ui-" + Math.random().toString(16).slice(2);
				inputElement.id = id;
			}

			this.setAttribute('for', id);

			this.innerText = display;
		}
	}

	get value(){
		return this.input.value;
	}

	set value(v){
		this.input.value = v;
	}
}
customElements.define('ui-label', InputLabel, {extends:'label'});

type LabelledInputOptions = AbstractInputOptions & {
	name?: string
}

export class LabelledInput extends InputLabel{
	constructor(json: any, key: string, type: typeof AbstractInput| typeof AbstractHTMLInput, options?:LabelledInputOptions){
		super(<AbstractInput>new type(json, key, options), options.name ?? key, {wrapped: true});
	}
}
customElements.define('ui-labelledinput', LabelledInput, {extends:'label'});