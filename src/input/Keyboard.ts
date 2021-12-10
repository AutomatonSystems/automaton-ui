import { BasicElement } from "../BasicElement.js";

export type KeyboardShortcutOptions = {
	display?: string
	event?: ()=>{}
}

class KeyboardShortcut extends BasicElement{
	options: KeyboardShortcutOptions;
	constructor(key: string, options:KeyboardShortcutOptions= {}){
		super();
		// ensure we listen for key events
		activateKeyboard();

		this.options = options;

		// try to grab keyboard key from 
		if(key==null){
			key = this.innerHTML.trim();
			if(this.innerHTML == "Space"){
				key = " ";
			}
		}else{
			this.innerHTML = options?.display ?? key;
		}

		// bind the key!
		this.dataset.key = key;
	}

	keydown(){
		this.classList.add('keydown');
	}

	keyup(){
		this.click();
		this.classList.remove('keydown');
		this.options?.event();
	}
}
window.customElements.define("ui-key", KeyboardShortcut);

let activateKeyboard = ()=> {
	// unbind the activate method
	activateKeyboard = ()=>{};

	/** Stupidly simple keyboard listener; tries to find the related KeyboardShortcut hint element in the dom and click it! */
	document.addEventListener("keyup", (event)=>{
		(<KeyboardShortcut>document.body.querySelector(`ui-key[data-key='${event.key}']`))?.keyup();
	});

	/** Stupidly simple keyboard listener; tries to find the related KeyboardShortcut hint element in the dom and click it! */
	document.addEventListener("keydown", (event)=>{
		(<KeyboardShortcut>document.body.querySelector(`ui-key[data-key='${event.key}']`))?.keydown();
	});
}

export default KeyboardShortcut;