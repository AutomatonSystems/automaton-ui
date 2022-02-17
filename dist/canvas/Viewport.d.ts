import "./Viewport.css";
import { BasicElement } from "../BasicElement.js";
declare type GridLine = {
    step: number;
    offset: number;
    color: string;
};
export declare type RenderableHTMLElement = HTMLElement & {
    render?: (viewport: Viewport) => void;
    scalar?: number;
    x?: number;
    y?: number;
};
export declare class Viewport extends BasicElement {
    #private;
    attachments: RenderableHTMLElement[];
    canvas: HTMLCanvasElement;
    grid: GridLine[];
    constructor();
    addAttachment(element: RenderableHTMLElement, update?: boolean): void;
    removeAttachment(element: RenderableHTMLElement, update?: boolean): void;
    /**
     * Move the view so vx,vy is in the center of the viewport
     */
    setCenter(vx: number, vy: number): void;
    /**
     * Get the current worldspace coordinate at the center of the viewport
     *
     * @returns {{x,y}}
     */
    getCenter(): {
        x: number;
        y: number;
        out: boolean;
    };
    /**
     *
     * Zoom on a point in screen space, keeping that point in the same place
     *
     * @param {number} vz target zoom level
     * @param {number?} vx point to keep in the same position on screen
     * @param {number?} vy point to keep in the same position on screen
     */
    setZoom(vz: number, vx?: number, vy?: number): void;
    getZoom(): number;
    getView(): {
        x: number;
        y: number;
        zoom: number;
        width: number;
        height: number;
    };
    /**
     * Pan the viewport by screen pixels
     *
     * @param {number} sx
     * @param {number} sy
     */
    panScreen(sx: number, sy: number): void;
    /**
     * convert the screen cordinates to the location
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
    toScreen(vx: number, vy: number): {
        x: number;
        y: number;
    };
    get bounds(): DOMRect;
    render(): void;
    updateAttachments(): void;
    /***********/
    bindMouse(): void;
}
export {};
