import { append, sleep } from "./utils.js";
import { BasicElement } from "./BasicElement.js";

import "./HashManager.css";

export class HashHandler{

	/** @type {RegExp}*/
	path;

	pathVariables = [];

	func;

	constructor(path, func){
		// extract path args
		while(path.includes('{')){
			let variable = path.substring(path.indexOf('{'), path.indexOf('}')+1);
			path = path.replace(variable, "([^/]*)");
			this.pathVariables.push(HashHandler.v(variable.substring(1,variable.length-1)));
		}
		
		this.path = new RegExp(path);
	
		this.func = func;
	}

	static v(input){
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

	/**
	 * @param {String} path 
	 * 
	 * @returns {Promise<[Element,number]|false>}
	 */
	async handle(path, oldPath){

		let parts = path.match(this.path);
		if(!parts)
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

export class HashManager extends BasicElement {


	key = null;
	hash = "";
	depth = 0;

	/** @type {HashHandler[]} */
	handlers = [];


	static DIRECTION = {
		NONE: 0,

		LEFT: 1,
		RIGHT: 2,
		BOTTOM: 3,
		TOP: 4,

		RANDOM: 100
	};


	static Handler = HashHandler;

	constructor(key=null) {
		super();
		this.key = key;
		window.addEventListener('hashchange', () => this.hashChange());
	}

	get value(){
		return this.hash;
	}

	handler(path, func){
		this.handlers.push(new HashHandler(path, func));
		return this;
	}

	addHandler(h) {
		this.handlers.push(h);
	}

	set(value){
		let hash = window.location.hash.substring(1);
		let pairs = hash.split('|').filter(i=>i!='').map(pair=>pair.includes('=')?pair.split('=',2):[null,pair]);
		let pair = pairs.find(i=>i[0]==this.key);
		if(pair == null){
			pair = [this.key,null];
			pairs.push(pair);
		}
		pair[1] = value;

		window.location.hash = pairs.map(p=>p[0]?p.join('='):p[1]).join('|');
	}

	async hashChange() {
		let hash = window.location.hash.substring(1);
		let pairs = hash.split('|').map(pair=>pair.includes('=')?pair.split('=',2):[null,pair]);

		
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
				await this.swapContent(result[0], result[1]);
				break;
			}
		}

	}


	async swapContent(body, direction = HashManager.DIRECTION.RIGHT) {
		let content = document.createElement('content');

		append(content, body);

		if (this.firstElementChild == null)
			return this.appendChild(content);


		let enter, exit;
		if (direction == HashManager.DIRECTION.RANDOM) {
			let dirs = [HashManager.DIRECTION.RIGHT, HashManager.DIRECTION.LEFT, HashManager.DIRECTION.TOP, HashManager.DIRECTION.BOTTOM];
			direction = dirs[Math.floor(Math.random() * dirs.length)];
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
