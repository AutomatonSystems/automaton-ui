export const sleep = (time, value)=>new Promise(r=>setTimeout(()=>r(value),time));
window['sleep'] = sleep;
export function append(element, content){
	if(typeof content == 'string')
		element.innerHTML = content;
	else if(Array.isArray(content))
		element.append(...content);
	else
		element.appendChild(content);
}