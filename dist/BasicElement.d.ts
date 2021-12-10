/// <reference types="node" />
import { Appendable } from './utils.js';
export declare class BasicElement extends HTMLElement {
    #private;
    self: BasicElement;
    intervals: any[];
    constructor(content?: Appendable, { clazz }?: {
        clazz?: string;
    });
    /**
     * Starts a interval timer that will stop when this element is no longer on the DOM
     *
     * @param {*} callback
     * @param {Number} time in ms
     *
     * @returns {Number} interval id.
     */
    setInterval(callback: () => {}, time: number): NodeJS.Timeout;
    /**
     *
     * @param {String} variable
     *
     * @returns {String}
     */
    css(variable: string): string;
    /**
     *
     * @param {String} variable
     *
     * @returns {Number}
     */
    cssNumber(variable: string): number;
    setCss(name: string, value: string | number): void;
    getCss(name: string): void;
    get visible(): boolean;
    /**
     * @param {Boolean} boolean
     */
    set visible(boolean: boolean);
    show(parent?: HTMLElement): this;
    hide(): this;
    remove(): this;
    /**
     * Walk up dom tree looking for a closable element
     */
    close(): this;
    attach(parent?: HTMLElement): this;
    /**
     *
     * @param {String} string
     *
     * @returns {HTMLElement}
     */
    querySelector(string: string): HTMLElement;
    /**
     *
     * @param {String} string
     *
     * @returns {NodeList<HTMLElement>}
     */
    querySelectorAll(string: string): NodeListOf<HTMLElement>;
    droppable: boolean;
    dragdata: Record<string, any>;
    /**
     *
     * Make the element draggable
     *
     * @param type a category of thing that is being dragged - eg a 'item', used to filter dropzones
     * @param data
     */
    makeDraggable(type?: string, data?: any): void;
    onDragOver(type: string, behaviour: (data: any, event: DragEvent, element: BasicElement) => void): void;
    onDrop(type: string, behaviour: (data: any, event: DragEvent, element: BasicElement) => void): void;
}
