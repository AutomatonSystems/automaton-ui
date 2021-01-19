import "./Viewport.css";

import { BasicElement } from "../BasicElement.js";
export class Viewport extends BasicElement{

	#view = {
		parent: null,
		// what position the top left corner maps to
		x: 0, 
		y: 0,
		zoom: 1, // 1 pixel = 1 pixel

		/** @type {Number} */
		get width(){
			return this.parent.element.width / this.zoom;
		},

		/** @type {Number} */
		get height(){
			return this.parent.element.height / this.zoom;
		}
	};

	attachments = [];

	constructor(){
		super();
		this.#view.parent = this;
		this.canvas = document.createElement('canvas');
		this.append(this.canvas);
	}

	addAttachment(element){
		this.attachments.push(element);
		this.append(element);
	}

	removeAttachment(element){
		this.attachments = this.attachments.filter(e=>e!=element);
		this.removeChild(element);
	}

	/**
	 * Move the view so vx,vy is in the center of the viewport
	 * 
	 * @param {Number} vx 
	 * @param {Number} vy 
	 */
	center(vx,vy){
		this.#view.x = vx - (this.#view.width/2);
		this.#view.y = vy - (this.#view.height/2);
	}

	/**
	 * 
	 * Zoom on a point in screen space, keeping that point in the same place
	 * 
	 * @param {Number} vz target zoom level
	 * @param {Number} vx point to keep in the same position on screen
	 * @param {Number} vy point to keep in the same position on screen
	 */
	zoom(vz, vx, vy){
		let s1 = this.toScreen(vx, vy);
		this.#view.zoom = vz;
		let s2 = this.toScreen(vx, vy);
		let px = s2.x-s1.x;
		let py = s2.y-s1.y;
		this.pan(px, py);
	}

	/**
	 * 
	 * @param {Number} rsx 
	 * @param {Number} rsy 
	 */
	pan(rsx, rsy){
		this.#view.x += rsx / this.#view.zoom;
		this.#view.y += rsy / this.#view.zoom;
	}

	/**
	 * convert the element-relative screen cordinates to the location
	 * in the viewspace
	 * 
	 * @param {Number} sx 
	 * @param {Number} sy 
	 * 
	 * @returns {{x:number,y:number, out: boolean}}
	 */
	toView(sx,sy){
		let v = this.#view;
		let e = this.element;
		let xy = {
			x: (sx-e.x)/v.zoom + v.x,
			y: (sy-e.y)/v.zoom + v.y,
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
	toScreen(vx, vy){
		let v = this.#view;
		return {
			x: (vx - v.x)*v.zoom,
			y: (vy - v.y)*v.zoom
		}
	}

	get element(){
		return this.getBoundingClientRect();
	}

	#lastV;

	render(){
		let v = this.#view;
		let lv = JSON.stringify({x:v.x,y:v.y,w:v.width,h:v.height,z:v.zoom});
		if(!(this.#lastV == null || this.#lastV != lv)){
			this.#lastV = lv;
			this.updateAttachments();
			return;
		}
		this.#lastV = lv;

		let element = this.element;
		if(this.canvas.width!=element.width || this.canvas.height!=element.height){
			this.canvas.width=element.width;
			this.canvas.height=element.height;
		}		

		// clear the canvas
		let context = this.canvas.getContext("2d");
		context.resetTransform();
		context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// set correct position
		
		context.setTransform(v.zoom, 0, 0, v.zoom, -v.x * v.zoom, -v.y * v.zoom);

		let onePixel = 1.01/v.zoom;
		// draw grid

		let xmin = v.x;
		let xmax = v.x + v.width;

		let ymin = v.y;
		let ymax = v.y + v.height;

		context.lineWidth = onePixel;// + "px";
		// grid
		context.beginPath();
		context.strokeStyle = "#7772";
		for(let offset = 1; offset < 1000; offset+=1){
			if(offset > ymin && offset < ymax){
				context.moveTo(xmin, offset);
				context.lineTo(xmax, offset);
			}
			if(-offset > ymin && -offset < ymax){
				context.moveTo(xmin, -offset);
				context.lineTo(xmax, -offset);
			}
			if(offset > xmin && offset < xmax){
				context.moveTo(offset, ymin);
				context.lineTo(offset, ymax);
			}
			if(-offset > xmin && -offset < xmax){
				context.moveTo(-offset, ymin);
				context.lineTo(-offset, ymax);
			}
		}
		context.stroke();

		// grid
		context.beginPath();
		context.strokeStyle = "#7773";
		for(let offset = 6; offset < 1000; offset+=12){
			if(offset > ymin && offset < ymax){
				context.moveTo(xmin, offset);
				context.lineTo(xmax, offset);
			}
			if(-offset > ymin && -offset < ymax){
				context.moveTo(xmin, -offset);
				context.lineTo(xmax, -offset);
			}
			if(offset > xmin && offset < xmax){
				context.moveTo(offset, ymin);
				context.lineTo(offset, ymax);
			}
			if(-offset > xmin && -offset < xmax){
				context.moveTo(-offset, ymin);
				context.lineTo(-offset, ymax);
			}
		}
		context.stroke();

		// grid
		context.beginPath();
		context.strokeStyle = "#7777";
		for(let offset = 12; offset < 1000; offset+=12){
			if(offset > ymin && offset < ymax){
				context.moveTo(xmin, offset);
				context.lineTo(xmax, offset);
			}
			if(-offset > ymin && -offset < ymax){
				context.moveTo(xmin, -offset);
				context.lineTo(xmax, -offset);
			}
			if(offset > xmin && offset < xmax){
				context.moveTo(offset, ymin);
				context.lineTo(offset, ymax);
			}
			if(-offset > xmin && -offset < xmax){
				context.moveTo(-offset, ymin);
				context.lineTo(-offset, ymax);
			}
		}
		context.stroke();

		// main axis
		context.strokeStyle = "#777f";
		context.beginPath();
		context.moveTo(-10000, 0);
		context.lineTo(10000, 0);
		context.moveTo(0,-10000);
		context.lineTo(0, 10000);
		context.stroke();

		this.updateAttachments();
	}

	updateAttachments(){
		let v = this.#view;
		for(let attachment of this.attachments){
			let x = (attachment.x ?? 0) - v.x;
			let y = (attachment.y ?? 0) - v.y;
			let t = `translate(${x * v.zoom}px, ${y * v.zoom}px) scale(${v.zoom})`;
			attachment.style.transform = t;
		}
	}
}
customElements.define('ui-viewport', Viewport);