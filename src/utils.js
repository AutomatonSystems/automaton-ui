export const sleep = (time, value=null)=>new Promise(r=>setTimeout(()=>r(value),time));
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
		content = content.filter(c=>c!==null && c!==undefined);
		element.append(...content);
	}else{
		element.appendChild(content);
	}
}

const IDs = new Set();

export function uuid(){
	let id = null;
	do{
		id = "ui-" + Math.random().toString(16).slice(2);
	}while(IDs.has(id) || document.querySelector('#'+id));
	IDs.add(id);
	return id;
}

/**
 * Convert html text to a HTMLElement
 * 
 * @param {String} html 
 * 
 * @returns {HTMLElement}
 */
export function htmlToElement(html, wrapper='div'){
	let d = document.createElement(wrapper);
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
 * Fisher–Yates shuffle the contents of an array
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


/**
 * Check the element is totally visible in the viewport
 * 
 * @returns {Boolean}
 */ 
export function isTotallyInViewport(el){ 
	var rect = el.getBoundingClientRect(); 
	return rect.top >= 0 
		&& rect.left >= 0
		&& rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
		&& rect.right <= (window.innerWidth || document.documentElement.clientWidth); 
} 
