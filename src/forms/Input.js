export class StringInput extends HTMLInputElement{
	constructor(obj, key, callback, {size=null, color=null} = {}){
		super();

		this.type = "text";
		
		this.value = Reflect.get(obj, key);

		if(size)
			this.style.width = (size*24)+"px";
		
		if(color)
			this.style.color = color;

		this.addEventListener('change', ()=>{
			let value = this.value;
			Reflect.set(obj, key, value);
			if(callback)
				callback(value);
		});
	}
}
customElements.define('ui-stringinput', StringInput, {extends:'input'});


/**
 * A number input that keeps a json object 
 * up to date with it's value
 * 
 */
export class NumberInput extends HTMLInputElement{

	/**
	 * 
	 * @param {*} obj json object/array to keep up to date
	 * @param {*} key json key/indes to keep up to date
	 * @param {Function} callback callback that occurs immediately after a change
	 * @param {{size?:Number, color?:String}} params configuration parameters 
	 */
	constructor(obj, key, callback, {size=null, color=null} = {}){
		super();

		this.type = "number";
		
		this.value = Reflect.get(obj, key);

		if(size)
			this.style.width = (size*24)+"px";
		
		if(color)
			this.style.color = color;

		this.addEventListener('change', ()=>{
			let value = parseFloat(this.value);
			Reflect.set(obj, key, value);
			if(callback)
				callback(value);
		});
	}
}
customElements.define('ui-numberinput', NumberInput, {extends:'input'});