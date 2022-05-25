import { BasicElement } from "./BasicElement.js";
import { sleep, random} from "./utils.js";

type GConstructor<T = {}> = new (...args: any[]) => T;
type HTMLElementBase = GConstructor<HTMLElement>;
type ObjectBase = GConstructor<Object>;

export function Readyable<TBase extends ObjectBase>(Base: TBase) {
	return class extends Base {
		#ready: boolean = false;

		constructor(...args:any[]){
			super(...args);
		}

		get ready(){
			return this.#ready;
		}
	
		set ready(bool: boolean){
			this.#ready = bool;
		}
	
		async isReady(){
			while(!this.ready)
				await sleep(10);
		}
	};
}


export function Draggable<TBase extends HTMLElementBase>(Base: TBase){
	return class Draggable extends Base{
		#dropTypeSet = new Set<string>();
		droppable = false;

		dragdata: Record<string, any> = {};

		constructor(...args:any[]){
			super(...args);
		}

		/**
		 * 
		 * Make the element draggable
		 * 
		 * @param type a category of thing that is being dragged - eg a 'item', used to filter dropzones
		 * @param data 
		 */
		makeDraggable(type: string ='element', data: any = null, handle: HTMLElement = null){
			if(handle == null){
				this.draggable = true;
			}else{
				handle.addEventListener('mousedown', ()=>{
					this.draggable = true;
				}, true);
				this.addEventListener('dragend', ()=>{
					this.draggable = false;
				}, true);
			}

			// by default the data to send is just the element itself
			type = type.toLowerCase();
			if(data == null)
				data = this;
			this.dragdata[type] = data;

			// add the event listener
			this.addEventListener('dragstart', (event)=>{
				// setup a unique drag ID
				if(this.dataset['drag'] == null){
					let id = "D_"+Math.floor(1_000_000*random()).toString(16);
					// TODO collision detection
					this.dataset['drag'] = id;
				}

				// pass the drag ID as info
				let selector = `[data-drag="${this.dataset['drag']}"]`;
				event.dataTransfer.setData(type, selector);
			});
		}

		#makeDroppable(){
			this.droppable = true;
			let handler = (event: DragEvent)=>{
				let types = event.dataTransfer.types;
				for(let type of this.#dropTypeSet){
					if(types.includes(type)){
						event.preventDefault();
						return;
					}
				}
			}
			this.addEventListener('dragenter', handler);
			this.addEventListener('dragover', handler);
		}

		onDragOver(type: string, behaviour: (data: any, event: DragEvent, element: HTMLElement)=>void){
			type = type.toLowerCase();
			if(!this.droppable)
				this.#makeDroppable();
			this.#dropTypeSet.add(type);
			this.addEventListener('dragover', (event)=>{
				let datakey = event.dataTransfer.getData(type);
				if(datakey == "")
					return;
				if(datakey.startsWith('[data-drag')){
					let draggedElement = <Draggable>document.querySelector(datakey);
					let data = draggedElement.dragdata[type];
					behaviour(data, event, draggedElement);
				}else{
					// this shouldn't occur
				}
			});
		}

		onDrop(type: string, behaviour: (data: any, event: DragEvent, element: HTMLElement)=>void){
			type = type.toLowerCase();
			if(!this.droppable)
				this.#makeDroppable();
			this.#dropTypeSet.add(type);
			this.addEventListener('drop', (event)=>{
				let datakey = event.dataTransfer.getData(type);
				if(datakey == "")
					return;
				if(datakey.startsWith('[data-drag')){
					let draggedElement = <Draggable>document.querySelector(datakey);
					let data = draggedElement.dragdata[type];
					behaviour(data, event, draggedElement);
				}else{
					// this shouldn't occur
				}
			});
		}
	}
}