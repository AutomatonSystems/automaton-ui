import "./Table.css";
import { List } from "./List";
/**
 * Table is a special case of List with a more automatic layout
 */
export declare class Table<T> extends List<T> {
    constructor(options?: {
        itemsPerPage?: number;
    });
    get listLayout(): string;
    /**
     * Display the sorting headers
     */
    sortDisplay(): void;
    /**
     * Display the sorting headers
     */
    filterDisplay(): void;
}
