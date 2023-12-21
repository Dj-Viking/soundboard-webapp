export {};
declare global {
    type KeyboardKey = "Shift" | "Control" | "Alt";
    interface MyKeyboardEvent extends KeyboardEvent {
        key: KeyboardKey;
    }
}
