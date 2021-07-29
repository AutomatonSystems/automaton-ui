export class Viewport extends BasicElement {
    constructor({ flipY }?: {
        flipY?: boolean;
    });
    attachments: any[];
    canvas: HTMLCanvasElement;
    addAttachment(element: any, update?: boolean): void;
    removeAttachment(element: any, update?: boolean): void;
    /**
     * @deprecated use setZoom instead
     *
     * Move the view so vx,vy is in the center of the viewport
     *
     * @param {Number} vx
     * @param {Number} vy
     */
    center(vx: number, vy: number): void;
    /**
     * Move the view so vx,vy is in the center of the viewport
     *
     * @param {Number} vx
     * @param {Number} vy
     */
    setCenter(vx: number, vy: number): void;
    /**
     * Get the current worldspace coordinate at the center of the viewport
     *
     * @returns {{x,y}}
     */
    getCenter(): {
        x;
        y;
    };
    /**
     * @deprecated use setZoom instead
     *
     * Zoom on a point in screen space, keeping that point in the same place
     *
     * @param {Number} vz target zoom level
     * @param {Number} vx point to keep in the same position on screen
     * @param {Number} vy point to keep in the same position on screen
     */
    zoom(vz: number, vx: number, vy: number): void;
    /**
     *
     * Zoom on a point in screen space, keeping that point in the same place
     *
     * @param {Number} vz target zoom level
     * @param {Number?} vx point to keep in the same position on screen
     * @param {Number?} vy point to keep in the same position on screen
     */
    setZoom(vz: number, vx?: number | null, vy?: number | null): void;
    /**
     *
     * @param {Number} rsx
     * @param {Number} rsy
     */
    pan(rsx: number, rsy: number): void;
    /**
     *
     * @param {Number} rsx
     * @param {Number} rsy
     */
    panScreen(rsx: number, rsy: number): void;
    /**
     * convert the element-relative screen cordinates to the location
     * in the viewspace
     *
     * @param {Number} sx
     * @param {Number} sy
     *
     * @returns {{x:number,y:number, out: boolean}}
     */
    toView(sx: number, sy: number): {
        x: number;
        y: number;
        out: boolean;
    };
    /**
     * convert the viewport cordinates to screen co-ordinates
     *
     * @param {Number} sx
     * @param {Number} sy
     *
     * @returns {{x:number,y:number}}
     */
    toScreen(vx: any, vy: any): {
        x: number;
        y: number;
    };
    get element(): DOMRect;
    grid: {
        step: number;
        offset: number;
        color: string;
    }[];
    render(): void;
    updateAttachments(): void;
    /***********/
    bindMouse(): void;
    #private;
}
import { BasicElement } from "../BasicElement.js";
