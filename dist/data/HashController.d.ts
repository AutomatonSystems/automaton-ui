type BasicType = "string" | "number" | "json" | "boolean";
type HashMapEntry<T> = {
    path: string;
    type: BasicType;
    value: T;
    events: ((t: T) => void)[];
};
export declare const HashController: {
    map: Map<string, HashMapEntry<any>>;
    update(): void;
    getEntry(key: string): HashMapEntry<any>;
    listen(key: string, changeEvent: (value: string) => void): void;
    set(key: string, value: any, passive?: boolean): void;
    "__#10470@#hashPairs"(): string[][];
    "__#10470@#read"(key: string): any;
    "__#10470@#parse"(input: string, type: BasicType): any;
    "__#10470@#write"(key: string, value: any, passive?: boolean): void;
};
export {};
