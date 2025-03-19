import { NumberInput } from "../ui.js";
import { Grid } from "../layout/Grid.js";
import {AbstractHTMLInput, AbstractInput, LabelledInput } from "./Input.js";

export type Template = Record<string, TemplateParam | TemplateInterface>
export type Form2Input = typeof AbstractInput | typeof AbstractHTMLInput
export type TemplateParam = Form2Input | [Form2Input, {}]
export interface TemplateInterface extends Template {}

export type Form2Options = {

}

export class Form2 extends Grid {

	json;

	constructor(template: Template, json: any, options: Form2Options){
		super();

		this.json = json;

		this.build(template, json);
	}

	build(template: Template, json: any){
		console.log("build", template, json);
		for(let key of Object.keys(template)){
			let pattern = template[key];
			
			if(typeof pattern == 'function'){
				// shorthand - a direct type declaration
				this.append(new LabelledInput(json, key, pattern));
			}else if(Array.isArray(pattern)){
				// a component has been named to deal with this - handover to it
				this.append(new LabelledInput(json, key, pattern[0], pattern[1]));
			}else{
				// compounded type....
				let subJson = Reflect.get(json, key);
				// initalize nulls
				if(subJson == null){
					subJson = {};
					Reflect.set(json, key, subJson);
				}
				// build a component for this pattern
				this.build(pattern, subJson);
			}
		}
	}

	get value(){
		return this.json;
	}

}
customElements.define('ui-form2', Form2);
