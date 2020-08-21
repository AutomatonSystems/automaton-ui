export const sleep = (time, value)=>new Promise(r=>setTimeout(()=>r(value),time));
window['sleep'] = sleep;

/**
 * Add items onto a element
 * 
 * @param {Element} element 
 * @param {Element|String|Element[]} content 
 */
export function append(element, content){
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