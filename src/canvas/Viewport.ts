import "./Viewport.css";

import { BasicElement } from "../BasicElement.js";

type View = {
	parent: HTMLElement
	x: number
	y: number
	zoom: number

	width: number
	height: number
}

type GridLine = {
	step: number
	offset: number
	color: string
}

export type RenderableHTMLElement = HTMLElement & {
	render?: (viewport: Viewport)=>void
	scalar?: number
	x?: number
	y?: number
}

type XY = [number, number];

export class Viewport extends BasicElement{

	#view: View = {
		parent: null,
		// what position the top left corner maps to
		x: 0, 
		y: 0,
		zoom: 1, // 1 pixel = 1 pixel

		get width(){
			return this.parent.bounds.width / this.zoom;
		},

		get height(){
			return this.parent.bounds.height / this.zoom;
		}
	};
	
	// json of the last view rendered
	#lastV: string;

	attachments: RenderableHTMLElement[] = [];
	canvas: HTMLCanvasElement;

	// grid that gets drawn on the canvas
	grid: GridLine[] = [
		{step: 1, offset: 1, color: "#7772"},
		{step: 6, offset: 6, color: "#7772"},
		{step: 12, offset: 0, color: "#7774"},
		{step: Infinity, offset: 0, color: "#999"}
	]

	constructor(){
		super();
		this.#view.parent = this;
		this.canvas = document.createElement('canvas');
		this.append(this.canvas);
		// size of one screen pixel (in worldspace pixels)
		this.setCss("--pixel", this.#view.zoom);
	}
	
	addAttachment(element: RenderableHTMLElement, update = true){
		this.attachments.push(element);
		this.append(element);
		if(update){
			this.updateAttachments();
		}
	}

	removeAttachment(element: RenderableHTMLElement, update = true){
		this.attachments = this.attachments.filter(e=>e!=element);
		this.removeChild(element);
		if(update){
			this.updateAttachments();
		}
	}

	/**
	 * Move the view so vx,vy is in the center of the viewport
	 */
	setCenter(vx: number, vy: number){
		this.#view.x = vx - (this.#view.width/2);
		this.#view.y = vy - (this.#view.height/2);
	}

	/**
	 * Get the current worldspace coordinate at the center of the viewport
	 * 
	 * @returns {{x,y}} 
	 */
	getCenter(){
		return this.toView(this.#view.width/2, this.#view.height/2);
	}

	/**
	 * 
	 * Zoom on a point in screen space, keeping that point in the same place
	 * 
	 * @param {number} vz target zoom level
	 * @param {number?} vx point to keep in the same position on screen
	 * @param {number?} vy point to keep in the same position on screen
	 */
	setZoom(vz: number, vx:number = null, vy:number = null){
		if(vx==null){
			let vxy = this.getCenter();
			vx = vxy.x;
			vy = vxy.y;
		}
		let s1 = this.toScreen(vx, vy);
		this.#view.zoom = vz;
		this.setCss("--pixel", 1 / this.#view.zoom);
		let s2 = this.toScreen(vx, vy);
		let px = s2.x-s1.x;
		let py = s2.y-s1.y;
		this.panScreen(px, py);
	}

	getZoom(){
		return this.#view.zoom;
	}

	getView(){
		return {
			x: this.#view.x,
			y: this.#view.y,

			zoom: this.#view.zoom,

			width: this.#view.width,
			height: this.#view.height
		}
	}

	/**
	 * Pan the viewport by screen pixels
	 * 
	 * @param {number} sx 
	 * @param {number} sy 
	 */
	panScreen(sx: number, sy: number){
		this.#view.x += sx / this.#view.zoom;
		this.#view.y += sy / this.#view.zoom;
	}

	/**
	 * convert the screen cordinates to the location
	 * in the viewspace
	 * 
	 * @param {Number} sx 
	 * @param {Number} sy 
	 * 
	 * @returns {{x:number,y:number, out: boolean}}
	 */
	toView(sx: number, sy: number){
		let v = this.#view;
		let e = this.bounds;
		let xy = {
			x: (sx-e.x)/v.zoom + v.x,
			y: (sy-e.y)/v.zoom + v.y,
			out: false
		};
		xy.out = xy.x < v.x || xy.x > v.x + v.width 
			|| xy.y < v.y || xy.y > v.y + v.height;
		return xy;
	}

	/**
	 * convert the viewport cordinates to screen co-ordinates
	 * 
	 * @param {Number} sx 
	 * @param {Number} sy 
	 * 
	 * @returns {{x:number,y:number}}
	 */
	toScreen(vx: number, vy: number){
		let v = this.#view;
		return {
			x: (vx - v.x)*v.zoom,
			y: (vy - v.y)*v.zoom
		}
	}

	get bounds(){
		return this.getBoundingClientRect();
	}


	render(){
		let v = this.#view;
		let lv = JSON.stringify({x:v.x,y:v.y,w:v.width,h:v.height,z:v.zoom});
		if(!(this.#lastV == null || this.#lastV != lv)){
			this.#lastV = lv;
			// disabiling this - only onchange
			// this.updateAttachments();
			return;
		}
		this.#lastV = lv;

		let element = this.bounds;
		if(this.canvas.width!=element.width || this.canvas.height!=element.height){
			this.canvas.width=element.width;
			this.canvas.height=element.height;
		}		

		// clear the canvas
		let context = this.canvas.getContext("2d");
		context.resetTransform();
		context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		if(this.grid.length){
			// set correct position
			let xOff = -v.x * v.zoom;
			let yOff = -v.y * v.zoom;

			let xmin = 0;
			let xmax = v.width * v.zoom;

			let ymin = 0;
			let ymax = v.height * v.zoom;

			context.lineWidth = 1;
			// grid
			for(let grid of this.grid){
				if(v.zoom*grid.step < 10){
					continue;
				}
				context.beginPath();
				context.strokeStyle = grid.color;
				// TODO sort this out!
				for(let offset = grid.offset??0; offset < 1000*grid.step; offset+=grid.step){
					let offStep = offset * v.zoom;
					if(offStep+yOff > ymin && offStep+yOff < ymax){
						context.moveTo(xmin, offStep + yOff);
						context.lineTo(xmax, offStep + yOff);
					}
					if(-offStep+yOff > ymin && -offStep+yOff < ymax){
						context.moveTo(xmin, -offStep + yOff);
						context.lineTo(xmax, -offStep + yOff);
					}
					if(offStep+xOff > xmin && offStep+xOff < xmax){
						context.moveTo(offStep + xOff, ymin);
						context.lineTo(offStep + xOff, ymax);
					}
					if(-offStep+xOff > xmin && -offStep+xOff < xmax){
						context.moveTo(-offStep + xOff, ymin);
						context.lineTo(-offStep + xOff, ymax);
					}
				}
				context.stroke();
			}
		}

		this.updateAttachments();
	}

	updateAttachments(){
		let v = this.#view;
		for(let attachment of this.attachments){
			if(attachment.render){
				attachment.render(this);
			}else{
				let scale = attachment.scalar ?? 1;
				let x = (attachment.x ?? 0)*scale - v.x;
				let y = (attachment.y ?? 0)*scale - v.y;
				let t = `translate(${x * v.zoom}px, ${y * v.zoom}px) scale(${v.zoom * scale})`;
				attachment.style.transform = t;
			}
		}
	}

	/***********/

	bindMouse(){
		const LEFT_MOUSE = 0;
		const MIDDLE_MOUSE = 1;
		const RIGHT_MOUSE = 2;

		let lmouse = false;
		let rmouse = false;
		let drag: XY = null;

		this.addEventListener('contextmenu', (e)=>{
			e.preventDefault();
		});
		this.addEventListener('wheel', (e)=>{
			let v = this.toView(e.x, e.y);

			// this looks funky but give a nice UX
			let zoom = Math.exp((Math.log(this.#view.zoom)*480 - e.deltaY)/480);

			this.setZoom(zoom, v.x, v.y);
			this.render();
		});

		// TODO the events here are document scoped - they should check if they are actually viewport based
		document.addEventListener('mousedown', (e)=>{
			if(e.button==MIDDLE_MOUSE){
				drag = [e.x, e.y];
			}

			if(e.button==LEFT_MOUSE){
				lmouse = true;
			}
			
			if(e.button==RIGHT_MOUSE){
				rmouse = true;
			}
		});
		document.addEventListener('mousemove', (e)=>{
			if(drag){
				let ndrag:XY = [e.x, e.y];
				this.panScreen(drag[0]-ndrag[0],drag[1]-ndrag[1]);
				drag = ndrag;
				this.render();
			}

			if(lmouse){
				// dragging with leftmouse down
			}
			if(rmouse){
				// dragging with rightmouse down
			}
		});
		document.addEventListener('mouseup', (e)=>{
			
			if(e.button==MIDDLE_MOUSE){
				let ndrag: XY = [e.x, e.y];
				this.panScreen(drag[0]-ndrag[0],drag[1]-ndrag[1]);
				drag = null;
				this.render();
			}

			if(e.button==LEFT_MOUSE){
				lmouse = false;
			}
			if(e.button==RIGHT_MOUSE){
				rmouse = false;
			}
		});
	}
}
customElements.define('ui-viewport', Viewport);