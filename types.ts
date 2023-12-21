export {};
declare global {
    type KeyboardKey = "Shift" | "Control" | "Alt" | "f";
    interface MyKeyboardEvent extends KeyboardEvent {
        key: KeyboardKey;
    }
}
