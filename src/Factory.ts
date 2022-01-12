import { Form, FormTemplate } from "./forms/Form.js";
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
export async function popupForm(template: FormTemplate|FormTemplate[], {
		value = {},
		title = '',
		submitText = "Submit",
		wrapper = <(form:Form)=>HTMLElement>null,
		dismissable = true
}={}){
	return new Promise(res=>{
		let form = new Form(template);
		form.build(value).then(()=>{
			let body: HTMLElement = form;
			if(wrapper)
				body = wrapper(form)
			let modal = new Modal(body, {
				title: title, 
				buttons: '<ui-cancel></ui-cancel><ui-spacer></ui-spacer>',
				dismissable: dismissable
			});
			modal.close = ()=>{
				modal.self.remove();
				res(null);
				return modal;
			}
			modal.panel.footer(new Button(submitText, ()=>{
				modal.self.remove();
				res(form.json());
			}));
			modal.show();
		});
	})
}

export function info(...args: any[]|any){
	new Toast(args, {level: 'info'});
}

export function warn(...args: any[]|any){
	new Toast(args, {level: 'warn'});
}

export function error(...args: any[]|any){
	new Toast(args, {level: 'error'});
}