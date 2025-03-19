import "./Tabs.css";

import { BasicElement, BasicElementOpts } from "../BasicElement";
import { append, Appendable, htmlToElement } from "../utils.js";

export type TabsOptions = {
	
} & BasicElementOpts;

type Tab = {
	open: ()=>Tab
};

export class Tabs extends BasicElement {

	activeTab: Tab = null;

	constructor(options?: TabsOptions) {
		super(`<header></header><content></content>`, options);

		this.setAttribute("ui-tabs", '');
	}

	tab(title: Appendable, content: Appendable|(()=>Appendable)): Tab {
		let tab: Tab;

		let tabElement = htmlToElement("<div class='tab'></div>");
		let openFunction = ()=>{
			// highlight open tab
			this.querySelectorAll('header .tab').forEach(e=>{
				e.classList.toggle('active', e==tabElement);
			});
			// set content
			this.querySelector('content').innerHTML = "";
			append(this.querySelector('content'), typeof content == 'function'?content():content);

			return tab;
		};
		tabElement.addEventListener('click', openFunction);
		append(tabElement, title);
		this.querySelector('header').append(tabElement);

		tab = {
			open: openFunction
		};

		if(this.activeTab == null){
			this.activeTab = tab;
			this.activeTab.open();
		}else{
			// de-parent the items
			if(content instanceof HTMLElement){
				content.remove();
			}else if(Array.isArray(content)){
				content.forEach(c=>c instanceof HTMLElement?c.remove():'');
			}
		}

		return tab;
	}
}
customElements.define('ui-tabs', Tabs);