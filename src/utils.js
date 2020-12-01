export const sleep = (time, value)=>new Promise(r=>setTimeout(()=>r(value),time));
window['sleep'] = sleep;

/**
 * Add items onto a element
 * 
 * @param {Element} element 
 * @param {Element|String|Element[]} content 
 */
export function append(element, content){
	if(!element || content === undefined || content === null)
		return;
	if(typeof content == 'string' || typeof content == 'number'){
		element.innerHTML = content;
	}else if(Array.isArray(content)){
		element.append(...content);
	}else{
		element.appendChild(content);
	}
}

/**
 * Convert html text to a HTMLElement
 * 
 * @param {String} html 
 * 
 * @returns {HTMLElement}
 */
export function htmlToElement(html){
	let d = document.createElement('div');
	d.innerHTML = html;
	return d.firstElementChild;
}

/**
 *
 * @param  {...Element} elements
 *
 * @returns {HTMLElement[]}
 */
export function castHtmlElements(...elements) {
	return /** @type {HTMLElement[]} */ ([...elements]);
}

/**
 * shuffle the contents of an array
 * 
 * @param {*[]} array 
 */
export function shuffle(array) {
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
export function downloadJson(filename, json){
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
export async function dynamicallyLoadScript(url) {
	return new Promise(res=>{
		var script = document.createElement('script');  // create a script DOM node
		script.src = url;  // set its src to the provided URL
		script.onreadystatechange = res;
		script.onload = res;
		document.head.appendChild(script);  
	});
}
