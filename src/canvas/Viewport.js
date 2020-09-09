import { BasicElement } from "./BasicElement.js";
export default class Viewport extends BasicElement{

	#view = {
		// what position the top left corner maps to
		x: 0, 
		y: 0,
		zoom: 1, // 1 pixel = 1 pixel

		/** @type {Number} */
		get width(){
			return this.element.width * this.view.zoom;
		},

		/** @type {Number} */
		get height(){
			return this.element.height * this.view.zoom;
		}
	};

	constructor(){
		this.canvas = document.createElement('canvas');
		this.append(canvas);
	}

	/**
	 * Move the view so vx,vy is in the center of the viewport
	 * 
	 * @param {Number} vx 
	 * @param {Number} vy 
	 */
	center(vx,vy){
		this.#view.x = vx - this.#view.width/2;
		this.#view.y = vy - this.#view.height/2;
	}

	/**
	 * 
	 * Zoom on a point in screen space, keeping that point in the same place
	 * 
	 * @param {Number} vz target zoom level
	 * @param {Number} sx screen point to keep in the same position on screen
	 * @param {Number} sy screen point to keep in the same position on screen
	 */
	zoom(vz, sx, sy){
		// TODO CLAMP zoom

		let vxy = this.toView(sx, sy);
		
		this.#view.zoom = vz;

		let vxy2 = this.toView(sx, sy);
		
		this.#view.x += vxy.x - vxy2.x;
		this.#view.y += vxy.y - vxy2.y;
	}

	/**
	 * 
	 * @param {Number} rsx 
	 * @param {Number} rsy 
	 */
	pan(rsx, rsy){
		this.#view.x += rsx * this.#view.zoom;
		this.#view.y += rsy * this.#view.zoom;

		// TODO CLAMP position
	}

	/**
	 * convert the element-relative screen cordinates to the location
	 * in the viewspace
	 * 
	 * @param {Number} sx 
	 * @param {Number} sy 
	 * 
	 * @returns {{x:number,y:number}}
	 */
	toView(sx,sy){
		return {
			x: sx/this.#view.zoom + this.view.x,
			y: sy/this.#view.zoom + this.view.y
		};
	}

	get element(){
		return this.getBoundingClientRect();
	}

	render(){
		let element = this.element;
		if(this.canvas.width!=element.width || this.canvas.height!=element.height){
			this.canvas.width=element.width;
			this.canvas.height=element.height;
		}

		// clear the canvas
		let context = this.canvas.getContext("2d");
		context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// set correct position
		context.setTransform(this.#view.zoom, 0, 0, this.#view.zoom, -this.#view.x, -this.#view.y);

		let onePixel = 1/this.#view.zoom;
		// draw grid

		context.strokeStyle = "red";
		context.lineWidth = onePixel + "px";
		context.moveTo(-10000, 0);
		context.lineTo(-10000, 0);
		context.moveTo(0,-10000);
		context.lineTo(0, 10000);
		context.stroke();

		// callback


	}
}