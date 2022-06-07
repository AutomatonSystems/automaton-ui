type BasicType = "string"|"number"|"json"|"boolean";

type HashMapEntry<T> = {
	path: string
	type: BasicType
	value: T
	events: ((t:T)=>void)[]
}

export const HashController = new (class HashController{
	map = new Map<string, HashMapEntry<any>>();

	constructor(){
		window.addEventListener('hashchange', ()=>this.update());
	}

	update(){
		let pairs = this.#hashPairs();
		for(let entry of this.map.values()){
			let pair = pairs.find(i=>i[0]==entry.path);
			let value = this.#parse(pair?.[1], entry.type);

			if(entry.value !== value){
				entry.value = value;
				entry.events.forEach(l=>l(value));
			}
		}
	}

	getEntry(key: string){
		if(!this.map.has(key)){
			this.map.set(key, {
				path: key,
				type: "string",
				value: null,
				events: []
			});
		}
		return this.map.get(key);
	}

	listen(key: string, changeEvent: (value: string)=>void){
		let entry = this.getEntry(key);
		entry.value = this.#read(key);
		entry.events.push(changeEvent);
		changeEvent(entry.value);
	}

	set(key: string, value: any, passive: boolean = false){
		let entry = this.getEntry(key);
		if(entry.value !== value){
			this.#write(key, value, passive);
			entry.value = value;
			if(!passive){
				entry.events.forEach(l=>l(value));
			}
		}
	}

	#hashPairs(){
		let hash = window.location.hash.substring(1);
		return hash
			// unescape the hash
			.replaceAll("%7C", "|").replaceAll("%7c", "|")
			// split into non-empty chunks
			.split('|').filter(i=>i!='')
			// map the to objects
			.map(pair=>pair.includes('=')?pair.split('=',2):[null,pair]);
	}

	#read(key: string){
		let path = key;
		let type = this.getEntry(key).type;
		
		let pairs = this.#hashPairs();
		let pair = pairs.find(i=>i[0]==path);

		let value: any = pair?.[1];

		if(value){
			value = this.#parse(value, type);
		}

		return value;
	}

	#parse(input: string, type: BasicType){
		let value: any = input;
		if(value){
			switch(type){
				case 'number':
					value = parseFloat(input);
					break;
				case 'boolean':
					value = (input.toLowerCase() == 'true');	
					break;
				case 'json':
					value = JSON.parse(input);	
					break;
			}
		}
		return value;
	}

	#write(key: string, value:any, passive=false){
		let path = key;
		let type = this.getEntry(key).type;

		let pairs = this.#hashPairs();
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
})();
