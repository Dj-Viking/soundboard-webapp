import { MIDIAccessRecord } from "./app/MIDIController";

export {};
declare global {
    interface Navigator {
        requestMIDIAccess(): Promise<MIDIAccessRecord>;
    }
    type KeyboardKey = "Shift" | "Control" | "Alt" | "f";
    interface MyKeyboardEvent extends KeyboardEvent {
        key: KeyboardKey;
    }
    interface ObjectConstructor {
        keys<O extends object>(o: O): Array<keyof O>;
        values<O extends object>(o: O): Array<O[keyof O]>;
        entries<O extends object>(o: O): Array<[keyof O, O[keyof O]]>;
    }
    interface EventTarget {
        value: any;
    }
}
