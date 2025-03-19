export const sleep = (time: number, value?: any)=>new Promise(r=>setTimeout(()=>r(value),time));

(<any>self)['sleep'] = sleep;

export type Appendable = Node|string|number|boolean|Appendable[]

/**
 * Add items onto a element
 * 
 * @param element 
 * @param content 
 */
export function append(element: HTMLElement, content: Appendable){
	if(!element || content === undefined || content === null)
		return;
	if(Array.isArray(content)){
		for(let a of content)
			append(element, a);
	}else if(typeof content == 'string' || typeof content == 'number' || typeof content == 'boolean'){
		let d = document.createElement('div');
		d.innerHTML = ''+content;
		let nodes = [...d.childNodes];
		for(let node of nodes)
			element.appendChild(node);
	}else{
		element.appendChild(content);
	}
}

const IDs = new Set();

export let random = Math.random;

export function setRandom(rng: ()=>number){
	random = rng;
}

export function uuid(){
	let id = null;
	do{
		id = "ui-" + random().toString(16).slice(2);
	}while(IDs.has(id) || document.querySelector('#'+id));
	IDs.add(id);
	return id;
}

/**
 * Convert html text to a HTMLElement
 * 
 * @param html 
 * 
 * @returns
 */
export function htmlToElement(html: string, wrapper='div'): HTMLElement{
	let d = document.createElement(wrapper);
	d.innerHTML = html;
	return <HTMLElement>d.firstElementChild;
}

/**
 *
 * @param  {...Element} elements
 *
 * @returns {HTMLElement[]}
 */
export function castHtmlElements(...elements: any[]): HTMLElement[] {
	return <HTMLElement[]> ([...elements]);
}

/**
 * shuffle the contents of an array
 * 
 * @param {*[]} array 
 */
export function shuffle<T>(array: T[]): T[] {
	var currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

/**
 * Downloads a file to the users machine - must be called from within a click event (or similar)
 * 
 * @param {String} filename 
 * @param {Object} json 
 */
export function downloadJson(filename: string, json: any){
	const a = document.createElement('a');
	a.href = URL.createObjectURL( new Blob([JSON.stringify(json, null, '\t')], { type:`text/json` }) );
	a.download = filename;
	a.click();
}

/**
 * 
 * Load a script
 * 
 * @param {String} url 
 * 
 * @returns {Promise}
 */
export async function dynamicallyLoadScript(url: string) {
	return new Promise(res=>{
		var script = document.createElement('script');  // create a script DOM node
		script.src = url;  // set its src to the provided URL
		// @ts-ignore
		script.onreadystatechange = res;
		script.onload = res;
		document.head.appendChild(script);  
	});
}
