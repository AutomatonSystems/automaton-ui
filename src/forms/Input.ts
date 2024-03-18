import { createBuilderStatusReporter } from "typescript";
import { BasicElement } from "../BasicElement.js";
import { Badge } from "../component/Badge.js";
import UI, { utils } from "../ui.js";
import { htmlToElement, uuid } from "../utils.js";
import { Button } from "./Button.js";
import "./Input.css";

type AbstractInputOptions = {
	callback?: Function
	class?: string|string[]
	size?:number
	color?:string
	placeholder?:string
}

export class AbstractInput<T> extends BasicElement{
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

		if(options?.class){
			if(Array.isArray(options.class)){
				this.classList.add(...options.class);
			}else{
				this.classList.add(options.class);
			}
		}
	}

	get value(): T{
		return Reflect.get(this.obj, this.key);
	}

	set value(value: T){
		Reflect.set(this.obj, this.key, value);
	}

	label(name: string): InputLabel{
		return new InputLabel(this, name, {wrapped: true});
	}

	clear(){
		this.value = undefined;
	}
}

export class AbstractHTMLInput extends HTMLInputElement{

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

		this.obj= obj;
		this.key=key;

		this.setAttribute("ui-input", '');

		if(options?.class){
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
		return new InputLabel(<AbstractInput<any>><any>this, name, {wrapped: true});
	}

	clear(){
		Reflect.set(this.obj, this.key, undefined);
		this.value = null;
	}
}

export type StringInputOptions = AbstractInputOptions & {
	options?: (()=>Promise<SelectInputOption<string>[]>) | SelectInputOption<string>[]
}

export class StringInput extends AbstractHTMLInput{

	/**
	 * 
	 * @param obj json object/array to keep up to date
	 * @param key json key/indes to keep up to date
	 * @param options configuration parameters 
	 */
	constructor(obj: any, key: any, options: StringInputOptions){
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

		// Provide autocomplete options for the input
		if(options?.options){
			// lazily create input options
			let lazyInit = async ()=>{
				this.buildOptions(Array.isArray(options.options)?options.options:await options.options());
				this.removeEventListener('mouseover', lazyInit);
			};
			this.addEventListener('mouseover', lazyInit);
		}

		this.addEventListener('change', ()=>{
			let value = this.value;
			Reflect.set(obj, key, value);
			if(options?.callback)
				options?.callback(value, this);
		});
	}

	buildOptions(parsedOptions: any[]){
		// dump the datalist out
		let id = uuid();
		let list = htmlToElement(
			`<datalist id="${id}">`
			+ parsedOptions.map(v => `<option value="${v.value ? v.value : v}">${v.name ? v.name : v}</option>`).join('')
			+ '</datalist>');
		document.body.append(list);
		// by default the list component only shows the items that match the input.value, which isn't very useful for a picker
		this.addEventListener('focus', ()=>this.value = '');
		this.setAttribute('list', id);
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
			let v = this.value;
			let value = v!==undefined?parseFloat(this.value):v;
			Reflect.set(obj, key, value);
			if(options?.callback)
				options?.callback(value);
		});
	}
	
}
customElements.define('ui-numberinput', NumberInput, {extends:'input'});


type SliderInputOptions = AbstractInputOptions & {
	min?: number
	max?: number
	step?: number
	displayFunc?: (value: number)=>string
}

export class SliderInput extends AbstractInput<number>{

	input: HTMLInputElement;

	constructor(obj: any, key: any, options: SliderInputOptions){
		super(obj, key, options);
		
		this.innerHTML = `<input type="range"/><div></div>`

		this.onselectstart = ()=>false;

		this.input = <HTMLInputElement>this.querySelector('input');
		let display = <HTMLInputElement>this.querySelector('div');

		this.setAttribute('ui-sliderinput', '');

		if(options?.size)
			this.style.width = (options?.size*24)+"px";
		if(options?.color)
			this.style.setProperty('--color', options?.color);

		this.input.setAttribute('min', (options?.min ?? 0)+"");
		this.input.setAttribute('max', (options?.max ?? 100)+"");
		this.input.setAttribute('step', (options?.step ?? 1)+"");
		this.input.value = Reflect.get(obj, key);

		if(options?.displayFunc){
			display.innerHTML = options.displayFunc(this.value);
		}else{
			display.innerHTML = ""+this.value;
		}

		this.input.addEventListener('input', ()=>{
			let value = this.input.valueAsNumber;
			Reflect.set(obj, key, value);

			if(options?.displayFunc){
				display.innerHTML = options.displayFunc(this.value);
			}else{
				display.innerHTML = ""+this.value;
			}

			if(options?.callback)
				options?.callback(value);
		});
	}

	update(){
		this.input.value = Reflect.get(this.obj, this.key);
	}

}
customElements.define('ui-sliderinput', SliderInput);

type SelectInputOptions<T> = AbstractInputOptions & {
	options: (()=>Promise<SelectInputOption<T>[]>) | SelectInputOption<T>[]
}

type SelectInputOption<T> = {
	value: T
	display: any
} | T


export class SelectInput<T> extends HTMLSelectElement{

	_value: any = null;
	obj: any;
	key: any;

	constructor(obj: any, key: any, options: SelectInputOptions<T> = {options: []}){
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
	async renderOptions(optionsArg: (()=>Promise<SelectInputOption<T>[]>) | SelectInputOption<T>[]){
		let options: SelectInputOption<T>[] = null;
		if(typeof optionsArg == 'function'){
			options = await optionsArg();
		}else{
			options = optionsArg;
		}
		let value = this.getValue();
		this.innerHTML = "";
		for(let opt of options){
			let option = document.createElement('option');
			if(typeof opt != 'object' || !('display' in opt)){
				if(opt == value)
					option.setAttribute('selected', '');
				option.innerText = '' + opt;
			}else{
				if(opt.value == value)
					option.setAttribute('selected', '');
				option.innerText = opt.display ?? opt.value;
				option.value = '' + opt.value;
			}
			this.append(option);
		}
	}

	/**
	 * 
	 * @param {String} name 
	 * 
	 * @returns {InputLabel}
	 */
	label(name: string){
		return new InputLabel(<AbstractInput<any>><any>this, name, {wrapped: true});
	}
}
customElements.define('ui-selectinput', SelectInput, {extends:'select'});

type MultiSelectInputOptions = {
	options: any
}

export class MultiSelectInput extends AbstractInput<string[]>{
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
			let badge = new Badge(v);
			badge.append(new Button('', ()=>{
				// remove this item and redraw
				this.value.splice(index, 1);
				this.renderList();
			}, {icon: 'fa-times', style: 'text', color: 'error-color'}))
			return badge;
		}));
	}
}
customElements.define('ui-multiselectinput', MultiSelectInput);

export class JsonInput extends AbstractInput<string>{

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

type ToggleInputOptions = {
	allowUnset?: boolean
}

export class ToggleInput extends AbstractInput<boolean> {

	options: ToggleInputOptions;

	input: HTMLInputElement;

	unset: boolean;

	constructor(obj: any, key: any, options?: ToggleInputOptions) {
		super(obj, key);

		this.options = options;

		this.innerHTML = `<input type="checkbox"/><div><span></span></div>`;
		this.setAttribute("ui-toggle", "");

		if(this.options?.allowUnset){
			if(super.value == undefined){
				this.unset = true;
				this.classList.toggle('indeterminate', this.unset);
			}
		}

		this.input = <HTMLInputElement>this.querySelector('input');
		this.input.checked = this.value;

		this.querySelector('input').addEventListener('change', ()=>{
			this.value = this.input.checked;
		});
	}

	override get value(): boolean {
		if(this.options?.allowUnset && this.unset){
			return null;
		}
		return super.value;
	}
	override set value(value: boolean) {
		if(this.options?.allowUnset && value === undefined){
			this.unset = true;
		}else{
			this.unset = false;
		}
		this.classList.toggle('indeterminate', this.unset);
		super.value = value;
	}

	update(){
		this.input.checked = this.value;
	}
}
customElements.define('ui-toggleinput', ToggleInput);


export class InputLabel extends HTMLLabelElement{

	input: AbstractInput<any>;

	constructor(inputElement: AbstractInput<any>, display: string, {wrapped = false, clearable = false}= {}){
		super();

		this.setAttribute("ui-label", "");

		if(wrapped){
			// wrap the item with the label
			this.innerHTML = `<span class="label">${display}</span>`;
		}else{

			let id = inputElement.id;
			if(id==null){
				// generate a unique id and use it
				id = utils.uuid();
				inputElement.id = id;
			}

			this.setAttribute('for', id);

			this.innerText = display;
		}

		if(clearable){
			this.append(new UI.Button('', (event)=>{
				inputElement.clear();
				event.preventDefault();
				event.stopPropagation();
			}, {icon: "fa-times", style: "text"}));
		}

		if(wrapped){
			this.append(inputElement);
		}

		this.input = inputElement;
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
		super(<AbstractInput<any>>new type(json, key, options), options?.name ?? key, {wrapped: true});
	}
}
customElements.define('ui-labelledinput', LabelledInput, {extends:'label'});