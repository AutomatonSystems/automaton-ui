declare type BasicType = "string" | "number" | "json" | "boolean";
declare type HashMapEntry<T> = {
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
    "__#6@#hashPairs"(): string[][];
    "__#6@#read"(key: string): any;
    "__#6@#parse"(input: string, type: BasicType): any;
    "__#6@#write"(key: string, value: any, passive?: boolean): void;
};
export {};
