var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import "./Card.css";
import { BasicElement } from "../BasicElement.js";
export class Card extends BasicElement {
    constructor(content) {
        super();
        this.setAttribute("ui-card", '');
        let con = content || this.innerHTML;
        this.innerHTML = `<div class="card"></div>`;
        this.setContent(con);
    }
    setContent(content) {
        if (typeof content == 'string') {
            this.querySelector('.card').innerHTML = content !== null && content !== void 0 ? content : '';
        }
        else {
            this.querySelector('.card').append(content);
        }
    }
    flip() {
        return __awaiter(this, void 0, void 0, function* () {
            this.flipped = !this.flipped;
            let v = this.cssNumber('--duration');
            return new Promise(res => setTimeout(res, v));
        });
    }
    get flipped() {
        return this.getAttribute("flipped") == null;
    }
    set flipped(bool) {
        if (bool) {
            this.removeAttribute("flipped");
        }
        else {
            this.setAttribute("flipped", '');
        }
    }
}
customElements.define('ui-card', Card);
//# sourceMappingURL=Card.js.map