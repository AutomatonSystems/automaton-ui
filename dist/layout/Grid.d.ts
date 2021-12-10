import "./Grid.css";
import { BasicElement } from "../BasicElement";
export declare type GridOptions = {
    padding?: string;
    columnGap?: string;
    rowGap?: string;
};
export declare class Grid extends BasicElement {
    #private;
    constructor(options?: GridOptions);
    get columns(): number;
    set columns(n: number);
    get rows(): number;
    set rows(n: number);
    put(element: HTMLElement | HTMLElement[], row: number, column: number, width?: number, height?: number): void;
}
