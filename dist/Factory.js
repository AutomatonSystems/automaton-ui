var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
export function popupForm(template, { value = {}, title = null, submitText = "Submit", wrapper = null, dismissable = true } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(res => {
            let form = new Form(template);
            form.build(value).then(() => {
                let body = form;
                if (wrapper)
                    body = wrapper(body);
                let modal = new Modal(body, {
                    title: title,
                    buttons: '<ui-cancel></ui-cancel><ui-spacer></ui-spacer>',
                    dismissable: dismissable
                });
                modal.close = () => {
                    modal.self.remove();
                    res(null);
                };
                modal.panel.footer(new Button(submitText, () => {
                    modal.self.remove();
                    res(form.json());
                }));
                modal.show();
            });
        });
    });
}
export function info(...args) {
    new Toast(args, { level: 'info' });
}
export function warn(...args) {
    new Toast(args, { level: 'warn' });
}
export function error(...args) {
    new Toast(args, { level: 'error' });
}
//# sourceMappingURL=Factory.js.map