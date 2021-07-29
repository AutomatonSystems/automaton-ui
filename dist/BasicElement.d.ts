export class BasicElement extends HTMLElement {
    /**
     *
     * @param  {...Element} elements
     *
     * @returns {HTMLElement[]}
     */
    static castHtmlElements(...elements: Element[]): HTMLElement[];
    constructor(content: any, { clazz }?: {
        clazz?: string;
    });
    self: BasicElement;
    intervals: any[];
    /**
     * Starts a interval timer that will stop when this element is no longer on the DOM
     *
     * @param {*} callback
     * @param {Number} time in ms
     *
     * @returns {Number} interval id.
     */
    setInterval(callback: any, time: number): number;
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
    setCss(name: any, value: any): void;
    getCss(name: any): void;
    /**
     * @param {Boolean} boolean
     */
    set visible(arg: boolean);
    get visible(): boolean;
    show(parent?: any): BasicElement;
    hide(): BasicElement;
    /**
     * Walk up dom tree looking for a closable element
     */
    close(): BasicElement;
    attach(parent?: any): BasicElement;
    droppable: boolean;
    makeDraggable(type?: string, data?: any): void;
    makeDroppable(): void;
    onDragOver(type: any, behaviour: any): void;
    onDrop(type: any, behaviour: any): void;
    #private;
}
