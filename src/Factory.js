import { Form } from "./forms/Form.js";
import { Button } from "./forms/Button.js";
import { Modal } from "./Modal.js";
import { Toast } from "./feedback/Toast.js";

// ! utility methods for common patterns

/**
 * 
 * @param {*} template 
 * @param {*} param1 
 * 
 * @returns {Promise<*>} returns the response from the user (the populated form json)
 */
export async function popupForm(template, {
		value = {},
		title = null,
		submitText = "Submit",
		wrapper = null
}={}){
	return new Promise(res=>{
		let form = new Form(template);
		form.build(value).then(()=>{
			let body = form;
			if(wrapper)
				body = wrapper(body)
			let modal = new Modal(body, {title: title, buttons: '<ui-cancel></ui-cancel><ui-spacer></ui-spacer>'});
			modal.close = ()=>{
				modal.self.remove();
				res(null);
			}
			modal.panel.footer(new Button(submitText, ()=>{
				modal.self.remove();
				res(form.json());
			}));
			modal.show();
		});
	})
}

export function info(...args){
	new Toast(args, {level: 'info'});
}

export function warn(...args){
	new Toast(args, {level: 'warn'});
}

export function error(...args){
	new Toast(args, {level: 'error'});
}