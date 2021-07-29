export class Grid extends BasicElement {
    /**
     * @param {{padding?: string, columnGap?: string, rowGap?: string}}
     */
    constructor({ padding, columnGap, rowGap }?: {
        padding?: string;
        columnGap?: string;
        rowGap?: string;
    });
    set columns(arg: number);
    get columns(): number;
    set rows(arg: number);
    get rows(): number;
    /**
     *
     * @param {HTMLElement|HTMLElement[]} element
     * @param {Number} column
     * @param {Number} row
     * @param {Number} width
     * @param {Number} height
     */
    put(element: HTMLElement | HTMLElement[], row: number, column: number, width?: number, height?: number): void;
    #private;
}
import { BasicElement } from "../BasicElement";
