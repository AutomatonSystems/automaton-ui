import { BasicElement } from "../BasicElement.js";
export type KeyboardShortcutOptions = {
    display?: string;
    event?: () => {};
};
declare class KeyboardShortcut extends BasicElement {
    options: KeyboardShortcutOptions;
    constructor(key: string, options?: KeyboardShortcutOptions);
    keydown(): void;
    keyup(): void;
}
export default KeyboardShortcut;
