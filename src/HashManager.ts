import { append, sleep } from "./utils.js";
import { BasicElement } from "./BasicElement.js";

import "./HashManager.css";
import { utils } from "./ui.js";

type HashVariableMapperFunction = {
	name: string,
	set: (obj: any, value: any)=>void;
}

type SlideProperty = number | [number, number];
type HashResponse = false | HTMLElement | [HTMLElement, SlideProperty];
type HashChangeHandler = (value: {[index:string]:string|number|boolean|object})=> HashResponse | Promise<HashResponse>;

type BasicHashHandler = {
	handle: (path: string, oldPath: string)=>Promise<HashResponse>;
}

export class HashHandler{

	/** @type {RegExp}*/
	path: RegExp;

	/** @type {} */
	pathVariables: HashVariableMapperFunction[] = [];

	func: HashChangeHandler;

	constructor(path: string, func: HashChangeHandler){
		// extract path args
		while(path.includes('{')){
			let variable = path.substring(path.indexOf('{'), path.indexOf('}')+1);
			path = path.replace(variable, "([^/]*)");
			this.pathVariables.push(HashHandler.v(variable.substring(1,variable.length-1)));
		}
		
		this.path = new RegExp(path);
	
		this.func = func;
	}

	/**
	 * 
	 * @param {Number|Boolean|Object} input 
	 * 
	 * @returns {{name: String, set: Function}}
	 */
	static v(input: string):HashVariableMapperFunction{
		let [name,type] = input.split(':');
		return {
			name: name,
			set: (obj, value)=>{
				if(!value)
					return;
				switch(type){
					case 'number':
						value = parseFloat(value);
						break;
					case 'boolean':
						value = (value.toLowerCase() == 'true');	
						break;
					case 'json':
						value = JSON.parse(value);	
						break;
				}
				obj[name] = value;
			}
		}
		
	}

	async handle(path: string, oldPath: string):Promise<HashResponse>{

		let parts = path.match(this.path);
		// if no match or it didn't match the whole string
		if(!parts || parts[0].length != path.length)
			return false;

		// compute vars
		let args = {};
		parts.shift();
		for(let v of this.pathVariables)
			v.set(args, parts.shift());

		// and call the function
		return await this.func(args);
	}
}

/**
 * @example
 * 
 * ```
 * let hash = new HashManager();
 * handler('home', ()=>new Panel("home"));
 * handler('settings', ()=>new Panel("settings"));
 * hash.attach(document.body);
 * ```
 */
export class HashManager extends BasicElement {


	key:string = null;
	hash:string = null;
	depth = 0;

	eventlistener: ()=>void;

	handlers: BasicHashHandler[] = [];

	position = [0,0];

	static DIRECTION = {
		NONE: 0,

		LEFT: 1,
		RIGHT: 2,
		BOTTOM: 3,
		TOP: 4,

		RANDOM: 100
	};


	static Handler = HashHandler;

	constructor(key:string=null) {
		super();
		this.key = key;

		this.eventlistener = () => this.hashChange()

		window.addEventListener('hashchange', this.eventlistener);
	}

	static hashPairs(){
		let hash = window.location.hash.substring(1);
		return hash
			// unescape the hash
			.replaceAll("%7C", "|").replaceAll("%7c", "|")
			// split into non-empty chunks
			.split('|').filter(i=>i!='')
			// map the to objects
			.map(pair=>pair.includes('=')?pair.split('=',2):[null,pair]);
	}

	static read(pathlike: string){
		let [path, type] = pathlike?pathlike.split(':'):[null];
		
		let pairs = HashManager.hashPairs();
		let pair = pairs.find(i=>i[0]==path);

		let value: any = pair?.[1];

		if(value){
			switch(type){
				case 'number':
					value = parseFloat(value);
					break;
				case 'boolean':
					value = (value.toLowerCase() == 'true');	
					break;
				case 'json':
					value = JSON.parse(value);	
					break;
			}
		}

		return value;
	}

	static write(pathlike: string, value:any, passive=false){
		let [path, type] = pathlike?pathlike.split(':'):[null];
		let pairs = HashManager.hashPairs();
		if(value!==null && value!==""){
			let pair = pairs.find(i=>i[0]==path);
			if(pair == null){
				pair = [path,null];
				pairs.push(pair);
			}
			if(type == "json")
				value = JSON.stringify(value);
			pair[1] = value;
		}else{
			pairs = pairs.filter(i=>i[0]!=path);
		}

		if(passive){
			history.replaceState(undefined, undefined, "#" + pairs.map(p=>p[0]?p.join('='):p[1]).join('|'));
		}else{
			window.location.hash = pairs.map(p=>p[0]?p.join('='):p[1]).join('|');
		}
	}

	override remove(){
		super.remove();
		window.removeEventListener('hashchange', this.eventlistener);
		return this;
	}
	
	get value(){
		return this.hash;
	}

	handler(path: string, func: HashChangeHandler){
		this.handlers.push(new HashHandler(path, func));
		return this;
	}

	addHandler(h: BasicHashHandler) {
		this.handlers.push(h);
	}

	set(value: any, fireOnChange=false, noHistory=false){
		HashManager.write(this.key, value, noHistory);
		if(fireOnChange)
			return this.hashChange();
	}

	async hashChange() {
		let pairs = HashManager.hashPairs();

		let pair = pairs.find(i=>i[0]==this.key);
		if(pair == null)
			pair = [this.key,""];
		let newHash = pair[1];
		let oldHash = this.hash;
		
		this.hash = newHash;

		if(this.hash == oldHash)
			return;

		// work out the new content
		for (let handler of this.handlers) {
			let result = await handler.handle(newHash, oldHash);
			if (result) {
				if(Array.isArray(result)){
					await this.swapContent(result[0], result[1]);
				}else{
					await this.swapContent(result, null);
				}
				break;
			}
		}

	}

	async swapContent(body:HTMLElement, direction: SlideProperty = HashManager.DIRECTION.RIGHT) {
		let content = document.createElement('content');

		append(content, body);

		if (this.firstElementChild == null)
			return this.appendChild(content);

		if(direction == null){
			this.firstElementChild.remove();
			this.appendChild(content);
			return;
		}

		let enter: string, exit: string;
		if (direction == HashManager.DIRECTION.RANDOM) {
			let dirs = [HashManager.DIRECTION.RIGHT, HashManager.DIRECTION.LEFT, HashManager.DIRECTION.TOP, HashManager.DIRECTION.BOTTOM];
			direction = dirs[Math.floor(utils.random() * dirs.length)];
		}
		if(Array.isArray(direction)){
			console.log(this.position, direction);
			let newPosition = direction;
			// positional slide mode
			if(this.position[0] != direction[0]){
				if(this.position[0] > direction[0]){
					direction = HashManager.DIRECTION.LEFT;
				}else{
					direction = HashManager.DIRECTION.RIGHT;
				}
			}else if(this.position[1] != direction[1]){
				if(this.position[1] < direction[1]){
					direction = HashManager.DIRECTION.BOTTOM;
				}else{
					direction = HashManager.DIRECTION.TOP;
				}
			}else{
				// both the same... thanks
				direction = HashManager.DIRECTION.RIGHT;
			}
			this.position = newPosition;
		}
		switch (direction) {
			case HashManager.DIRECTION.RIGHT:
				[enter, exit] = ['right', 'left'];
				break;
			case HashManager.DIRECTION.LEFT:
				[enter, exit] = ['left', 'right'];
				break;
			case HashManager.DIRECTION.TOP:
				[enter, exit] = ['top', 'bottom'];
				break;
			case HashManager.DIRECTION.BOTTOM:
				[enter, exit] = ['bottom', 'top'];
				break;
		}

		// how long the animation will take is defined in css
		let timing = this.cssNumber('--timing');

		// add new content in start position
		content.classList.add(enter);
		this.appendChild(content);

		// later...
		sleep(50).then(() => {
			// slide in new content
			content.classList.remove(enter);

			// and slide old content out
			this.firstElementChild.classList.add(exit);

			// remove old content once done
			setTimeout(() => this.firstElementChild.remove(), timing);
		});

	}
}

customElements.define('ui-hash', HashManager);
