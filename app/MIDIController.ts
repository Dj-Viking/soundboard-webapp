/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { MIDIMappingPreference } from "./MIDIMapping";

/**
 * @see https://www.w3.org/TR/webmidi/#idl-def-MIDIPort
 * export interface MIDIPort : EventTarget {
    readonly    attribute DOMString               id;
    readonly    attribute DOMString?              manufacturer;
    readonly    attribute DOMString?              name;
    readonly    attribute MIDIPortType            type;
    readonly    attribute DOMString?              version;
    readonly    attribute MIDIPortDeviceState     state;
    readonly    attribute MIDIPortConnectionState connection;
                attribute EventHandler            onstatechange;
    Promise<MIDIPort> open ();
    Promise<MIDIPort> close ();
};
 */
export interface MIDIPort {
    IODevice: MIDIInput | MIDIOutput;
    open: () => Promise<MIDIPort>;
    close: () => Promise<MIDIPort>;
}
export interface TestMIDIConnectionEvent {
    isTrusted: boolean;
    bubbles: boolean;
    cancelBubble: boolean;
    cancelable: boolean;
    composed: boolean;
    target: MIDIInput;
}
export interface MIDIConnectionEvent {
    isTrusted: boolean;
    bubbles: boolean;
    cancelBubble: boolean;
    cancelable: boolean;
    composed: boolean;
    currentTarget: MIDIAccessRecord;
    defaultPrevented: boolean;
    eventPhase: number;
    path: Array<any>;
    readonly PORT: MIDIPort;
    returnValue: boolean;
    srcElement: MIDIAccessRecord;
    target: MIDIAccessRecord;
    timeStamp: number;
    type: string | "statechange";
}
export enum MIDIPortType {
    input = "input",
    output = "output",
}
export enum MIDIPortConnectionState {
    open = "open",
    closed = "closed",
    pending = "pending",
}
export enum MIDIPortDeviceState {
    disconnected = "disconnected",
    connected = "connected",
}

export interface TestMIDIMessageEvent {
    isTrusted: boolean;
    bubbles: boolean;
    cancelBubble: boolean;
    composed: boolean;
    target: MIDIInput;
    data: [number, number, number];
}

export interface MIDIMessageEvent {
    isTrusted: boolean;
    bubbles: boolean;
    cancelBubble: boolean;
    composed: boolean;
    currentTarget: MIDIInput;
    data: Uint8Array;
    defaultPrevented: boolean;
    eventPhase: number;
    path: Array<any>;
    returnValue: boolean;
    srcElement: MIDIInput;
    target: MIDIInput;
    timeStamp: number;
    type: "midimessage";
}

export type onstatechangeHandler = null | ((event: MIDIConnectionEvent) => unknown);
export interface MIDIInput {
    id: string;
    manufacturer: string;
    name: MIDIInputName;
    type: MIDIPortType.input;
    version: string;
    state: MIDIPortDeviceState;
    connection: MIDIPortConnectionState | string;
    onstatechange: undefined | onstatechangeHandler;
    onmidimessage: undefined | null | ((event: MIDIMessageEvent) => unknown);
}
export interface MIDIOutput {
    connection: MIDIPortConnectionState;
    id: string;
    manufacturer: string;
    name: string;
    type: MIDIPortType.output;
    state: MIDIPortDeviceState;
    version: string;
    onstatechange: undefined | onstatechangeHandler;
    onmidimessage: undefined | null | ((event: MIDIMessageEvent) => unknown);
}

export interface MIDIAccessRecord {
    readonly inputs: Map<MIDIInput["id"], MIDIInput>;
    readonly outputs: Map<MIDIOutput["id"], MIDIOutput>;
    onstatechange: onstatechangeHandler;
    readonly sysexEnabled: boolean;
}

export interface IMIDIController {
    inputs?: Array<MIDIInput>;
    inputs_size: number;
    outputs_size: number;
    recentlyUsed: MIDIInputName;
    controllerPreference: {
        hasPreference: boolean;
        midiMappingPreference: MIDIMappingPreference<MIDIInputName>;
    };
    outputs?: Array<MIDIOutput>;
    online?: boolean;
    getInstance: () => this;
}
export type MyIndexToKeyMap = Record<number, string>;
export const MY_INDEX_TO_KEY_MAP = {
    1: "1",
    2: "2",
    3: "3",
    4: "4",
    5: "q",
    6: "w",
    7: "e",
    8: "r",
    9: "a",
    10: "s",
    11: "d",
    12: "f",
} as MyIndexToKeyMap;

export type XONEK2_ControlNames =
    | "1_encoder"
    | "2_encoder"
    | "1_upper_knob"
    | "1_upper_button"
    | "1_middle_button"
    | "1_lower_button"
    | "1_middle_knob"
    | "1_lower_knob"
    | "2_upper_knob"
    | "2_middle_knob"
    | "2_lower_knob"
    | "1_fader"
    | "2_fader"
    | "3_fader"
    | "4_fader"
    | "1_b_button"
    | "1_a_button"
    | "1_c_button"
    | "1_d_button"
    | "2_e_button"
    | "2_f_button"
    | "2_g_button"
    | "2_h_button"
    | "3_i_button"
    | "3_j_button"
    | "3_k_button"
    | "3_l_button"
    | "4_m_button"
    | "4_n_button"
    | "4_o_button"
    | "4_p_button";

export type XONEK2_MIDIChannelTable = Record<number, XONEK2_ControlNames>;

export type LKMK3_ControlNames = "NOT SET YET" | "";

export type LKMK3_MIDIChannelTable = Record<number, LKMK3_ControlNames>;

export const LKMK3_MIDI_CHANNEL_TABLE: LKMK3_MIDIChannelTable = {
    1: "NOT SET YET",
};
export const XONEK2_MIDI_CHANNEL_TABLE: XONEK2_MIDIChannelTable = {
    0: "1_encoder",
    1: "2_encoder",
    4: "1_upper_knob",
    8: "1_middle_knob",
    12: "1_lower_knob",
    40: "1_lower_button",
    44: "1_middle_button",
    48: "1_upper_button",
    16: "1_fader",
    36: "1_a_button",
    37: "1_b_button",
    38: "1_c_button",
    39: "1_d_button",
    5: "2_upper_knob",
    9: "2_middle_knob",
    13: "2_lower_knob",
    17: "2_fader",
    32: "2_e_button",
    33: "2_f_button",
    34: "2_g_button",
    35: "2_h_button",
    18: "3_fader",
    28: "3_i_button",
    29: "3_j_button",
    30: "3_k_button",
    31: "3_l_button",
    19: "4_fader",
    24: "4_m_button",
    25: "4_n_button",
    26: "4_o_button",
    27: "4_p_button",
};
const possibleButtonNumbers = [1, 2, 3, 4, 5, 6, 7, 8] as const;
export type ButtonName<N extends (typeof possibleButtonNumbers)[number]> = `button_${N}_position` | "resetTimerButton";

export const DEFAULT_XONE_CONTROLNAME_TO_CHANNEL_MAPPING: Record<XONEK2_ControlNames, number> = {
    "1_encoder": 0,
    "2_encoder": 1,
    "1_upper_knob": 4,
    "1_middle_knob": 8,
    "1_lower_knob": 12,
    "1_fader": 16,
    "1_a_button": 36,
    "1_b_button": 37,
    "1_c_button": 38,
    "1_d_button": 39,
    "2_upper_knob": 5,
    "2_middle_knob": 9,
    "2_lower_knob": 13,
    "2_fader": 17,
    "2_e_button": 32,
    "2_f_button": 33,
    "2_g_button": 34,
    "2_h_button": 35,
    "3_fader": 18,
    "3_i_button": 28,
    "3_j_button": 29,
    "3_k_button": 30,
    "3_l_button": 31,
    "4_fader": 19,
    "4_m_button": 24,
    "4_n_button": 25,
    "4_o_button": 26,
    "4_p_button": 27,
    "1_lower_button": 40,
    "1_middle_button": 44,
    "1_upper_button": 48,
};

export type UIInterfaceDeviceName<
    N extends (typeof possibleButtonNumbers)[number] = (typeof possibleButtonNumbers)[number]
> = ButtonName<N>;

export const DEFAULT_XONE_UI_TO_CONTROLNAME_MAPPING: Record<UIInterfaceDeviceName, XONEK2_ControlNames> = {
    button_1_position: "" as any,
    button_2_position: "" as any,
    button_3_position: "" as any,
    button_4_position: "" as any,
    button_5_position: "" as any,
    button_6_position: "" as any,
    button_7_position: "" as any,
    button_8_position: "" as any,
    resetTimerButton: "" as any,
};

export type nanoKontrol2ControlNames = "something" | "else" | "not implemented yet";

export type nanoKontrol2_MIDIChannelTable = Record<number, nanoKontrol2ControlNames>;

export const nanoKontrol2_MIDI_CHANNEL_TABLE: nanoKontrol2_MIDIChannelTable = {
    1: "something",
    2: "else",
    3: "not implemented yet",
};

export type TouchOscBridgeControlNames =
    | "fader_1"
    | "fader_2"
    | "fader_3"
    | "fader_4"
    | "fader_5"
    | "page_1_toggle_1"
    | "page_1_toggle_2"
    | "page_1_toggle_3"
    | "page_1_toggle_4"
    | "page_1_toggle_5"
    | "page_1_toggle_6"
    | "page_1_toggle_7"
    | "page_1_toggle_8"
    | "touch_pad_1_1"
    | "touch_pad_1_2"
    | "touch_pad_1_3"
    | "touch_pad_1_4"
    | "touch_pad_2_1"
    | "touch_pad_2_2"
    | "touch_pad_2_3"
    | "touch_pad_2_4"
    | "touch_pad_3_1"
    | "touch_pad_3_2"
    | "touch_pad_3_3"
    | "touch_pad_3_4"
    | "touch_pad_4_1"
    | "touch_pad_4_2"
    | "touch_pad_4_3"
    | "touch_pad_4_4"
    | "top_fader";

export type TouchOscBridgeControlChannelTable = Record<number, TouchOscBridgeControlNames>;

// Simple touch osc layout channel table
export const touchOsc_MIDI_CHANNEL_TABLE: TouchOscBridgeControlChannelTable = {
    0: "fader_1",
    1: "fader_2",
    2: "fader_3",
    3: "fader_4",
    4: "fader_5",
    5: "top_fader",
    13: "page_1_toggle_1",
    6: "page_1_toggle_2",
    7: "page_1_toggle_3",
    8: "page_1_toggle_4",
    9: "page_1_toggle_5",
    10: "page_1_toggle_6",
    11: "page_1_toggle_7",
    12: "page_1_toggle_8",
    36: "touch_pad_1_1",
    37: "touch_pad_1_2",
    38: "touch_pad_1_3",
    39: "touch_pad_1_4",
    32: "touch_pad_2_1",
    33: "touch_pad_2_2",
    34: "touch_pad_2_3",
    35: "touch_pad_2_4",
    28: "touch_pad_3_1",
    29: "touch_pad_3_2",
    30: "touch_pad_3_3",
    31: "touch_pad_3_4",
    24: "touch_pad_4_1",
    25: "touch_pad_4_2",
    26: "touch_pad_4_3",
    27: "touch_pad_4_4",
};

export const DEFAULT_TOUCHOSC_CONTROLNAME_TO_CHANNEL_MAPPING: Record<TouchOscBridgeControlNames, number> = {
    fader_1: 0,
    fader_2: 1,
    fader_3: 2,
    fader_4: 3,
    fader_5: 4,
    top_fader: 5,
    page_1_toggle_1: 13,
    page_1_toggle_2: 6,
    page_1_toggle_3: 7,
    page_1_toggle_4: 8,
    page_1_toggle_5: 9,
    page_1_toggle_6: 10,
    page_1_toggle_7: 11,
    page_1_toggle_8: 12,
    touch_pad_1_1: 36,
    touch_pad_1_2: 37,
    touch_pad_1_3: 38,
    touch_pad_1_4: 39,
    touch_pad_2_1: 32,
    touch_pad_2_2: 33,
    touch_pad_2_3: 34,
    touch_pad_2_4: 35,
    touch_pad_3_1: 28,
    touch_pad_3_2: 29,
    touch_pad_3_3: 30,
    touch_pad_3_4: 31,
    touch_pad_4_1: 24,
    touch_pad_4_2: 25,
    touch_pad_4_3: 26,
    touch_pad_4_4: 27,
};

export const unsetPreference: { uiName: UIInterfaceDeviceName; channel: number } = {
    uiName: "" as any,
    channel: 9999,
};

export type KeyInputControlName = "j" | "Space" | "keyboard" | "_";

export const DEFAULT_XONE_MAPPING_PREFERENCE_TABLE: Record<
    XONEK2_ControlNames,
    { uiName: UIInterfaceDeviceName; channel: number }
> = {
    "1_encoder": unsetPreference,
    "2_encoder": unsetPreference,
    "1_a_button": unsetPreference,
    "1_b_button": unsetPreference,
    "1_c_button": unsetPreference,
    "1_d_button": unsetPreference,
    "1_fader": unsetPreference,
    "1_lower_button": unsetPreference,
    "1_lower_knob": unsetPreference,
    "1_middle_button": unsetPreference,
    "1_middle_knob": unsetPreference,
    "1_upper_button": unsetPreference,
    "1_upper_knob": unsetPreference,
    "2_fader": unsetPreference,
    "2_e_button": unsetPreference,
    "2_f_button": unsetPreference,
    "2_g_button": unsetPreference,
    "2_h_button": unsetPreference,
    "2_lower_knob": unsetPreference,
    "2_middle_knob": unsetPreference,
    "2_upper_knob": unsetPreference,
    "3_fader": unsetPreference,
    "3_i_button": unsetPreference,
    "3_j_button": unsetPreference,
    "3_k_button": unsetPreference,
    "3_l_button": unsetPreference,
    "4_fader": unsetPreference,
    "4_m_button": unsetPreference,
    "4_n_button": unsetPreference,
    "4_o_button": unsetPreference,
    "4_p_button": unsetPreference,
};

export const DEFAULT_TOUCHOSC_MAPPING_PREFERENCE_TABLE: Record<
    TouchOscBridgeControlNames,
    { uiName: GenericUIMIDIMappingName<MIDIInputName>; channel: number }
> = {
    fader_1: unsetPreference,
    fader_2: unsetPreference,
    fader_3: unsetPreference,
    fader_4: unsetPreference,
    fader_5: unsetPreference,
    top_fader: unsetPreference,
    page_1_toggle_1: unsetPreference,
    page_1_toggle_2: unsetPreference,
    page_1_toggle_3: unsetPreference,
    page_1_toggle_4: unsetPreference,
    page_1_toggle_5: unsetPreference,
    page_1_toggle_6: unsetPreference,
    page_1_toggle_7: unsetPreference,
    page_1_toggle_8: unsetPreference,
    touch_pad_1_1: unsetPreference,
    touch_pad_1_2: unsetPreference,
    touch_pad_1_3: unsetPreference,
    touch_pad_1_4: unsetPreference,
    touch_pad_2_1: unsetPreference,
    touch_pad_2_2: unsetPreference,
    touch_pad_2_3: unsetPreference,
    touch_pad_2_4: unsetPreference,
    touch_pad_3_1: unsetPreference,
    touch_pad_3_2: unsetPreference,
    touch_pad_3_3: unsetPreference,
    touch_pad_3_4: unsetPreference,
    touch_pad_4_1: unsetPreference,
    touch_pad_4_2: unsetPreference,
    touch_pad_4_3: unsetPreference,
    touch_pad_4_4: unsetPreference,
};

export const DEFAULT_TOUCHOSC_UI_TO_CONTROLNAME_MAPPING: Record<UIInterfaceDeviceName, TouchOscBridgeControlNames> = {
    button_1_position: "" as any,
    button_2_position: "" as any,
    button_3_position: "" as any,
    button_4_position: "" as any,
    button_5_position: "" as any,
    button_6_position: "" as any,
    button_7_position: "" as any,
    button_8_position: "" as any,
    resetTimerButton: "" as any,
};

export const DEFAULT_CALLBACK_TABLE: Record<UIInterfaceDeviceName, (...args: any[]) => void> = {
    button_1_position: (..._args: any[]) => void 0,
    button_2_position: (..._args: any[]) => void 0,
    button_3_position: (..._args: any[]) => void 0,
    button_4_position: (..._args: any[]) => void 0,
    button_5_position: (..._args: any[]) => void 0,
    button_6_position: (..._args: any[]) => void 0,
    button_7_position: (..._args: any[]) => void 0,
    button_8_position: (..._args: any[]) => void 0,
    resetTimerButton: (..._args: any[]) => void 0,
};

export const ULTRALITE_MK3_HYBRID_SYNC_PORT = {
    /** UNIMPLEMENTED */
};
export const ULTRALITE_MK3_HYBRID_MIDI_PORT = {
    /** UNIMPLEMENTED */
};

export type Nullable<T> = null | T;
export type ControllerName =
    | "Not Found"
    | "UltraLite mk3 Hybrid"
    | "XONE:K2 MIDI"
    | "nanoKontrol2"
    | "LKMK3 MIDI"
    | "UltraLite mk3 Hybrid MIDI Port"
    | "TouchOSC Bridge"
    | "UltraLite mk3 Hybrid Sync Port";

export type MIDIInputName = string & keyof ControllerLookup<ControllerName>;
export type ControllerLookup<Name extends ControllerName> = Record<
    Name,
    Name extends "XONE:K2 MIDI" //-------------------// if
        ? XONEK2_MIDIChannelTable //-----------------// then
        : Name extends "TouchOSC Bridge" //----------// else if
        ? TouchOscBridgeControlChannelTable //------// then
        : Name extends "nanoKontrol2" //-------------// else if
        ? nanoKontrol2_MIDIChannelTable //-----------// then
        : Name extends "LKMK3 MIDI" //----------------// else if
        ? LKMK3_MIDIChannelTable //-------------------// then
        : Nullable<Record<number, string>> //--------// else
>;

export type ChannelMappingPreference<N extends MIDIInputName> = N extends "XONE:K2 MIDI"
    ? typeof DEFAULT_XONE_CONTROLNAME_TO_CHANNEL_MAPPING
    : N extends "TouchOSC Bridge"
    ? typeof DEFAULT_TOUCHOSC_CONTROLNAME_TO_CHANNEL_MAPPING
    : Record<string, never>;

export type UIMappingPreference<N extends MIDIInputName> = N extends "XONE:K2 MIDI"
    ? typeof DEFAULT_XONE_UI_TO_CONTROLNAME_MAPPING
    : N extends "TouchOSC Bridge"
    ? typeof DEFAULT_TOUCHOSC_UI_TO_CONTROLNAME_MAPPING
    : Record<string, never>;

export type GenericControlName<Name extends MIDIInputName> = Name extends "XONE:K2 MIDI"
    ? XONEK2_ControlNames
    : Name extends "TouchOSC Bridge"
    ? TouchOscBridgeControlNames
    : Name extends "LKMK3"
    ? LKMK3_ControlNames
    : string; // unimplemented controller name

export type GenericUIMIDIMappingName<Name extends MIDIInputName> = Name extends "XONE:K2 MIDI"
    ? keyof Record<UIInterfaceDeviceName, XONEK2_ControlNames>
    : Name extends "TouchOSC Bridge"
    ? keyof Record<UIInterfaceDeviceName, TouchOscBridgeControlNames>
    : string; // unimplemented controller name

export const SUPPORTED_CONTROLLERS = {
    "Not Found": {} as any,
    "LKMK3 MIDI": LKMK3_MIDI_CHANNEL_TABLE,
    "XONE:K2 MIDI": XONEK2_MIDI_CHANNEL_TABLE,
    "UltraLite mk3 Hybrid": {} as any,
    nanoKontrol2: nanoKontrol2_MIDI_CHANNEL_TABLE,
    "UltraLite mk3 Hybrid Sync Port": ULTRALITE_MK3_HYBRID_SYNC_PORT,
    "UltraLite mk3 Hybrid MIDI Port": ULTRALITE_MK3_HYBRID_MIDI_PORT,
    "TouchOSC Bridge": touchOsc_MIDI_CHANNEL_TABLE,
} as const;

export const getControllerTableFromName = <N extends keyof typeof SUPPORTED_CONTROLLERS>(
    controllerName: N
): (typeof SUPPORTED_CONTROLLERS)[N] => {
    for (const [key, value] of Object.entries(SUPPORTED_CONTROLLERS)) {
        if (key === controllerName) {
            return value;
        }
    }
    return null;
};

export class MIDIController {
    public access = {} as MIDIAccessRecord;
    public inputs = [] as Array<MIDIInput>;
    public inputs_size = 0;
    public outputs_size = 0;
    public outputs = [] as Array<MIDIOutput>;
    public online = false;
    public recentlyUsed: MIDIInputName = "TouchOSC Bridge";
    public controllerPreference: IMIDIController["controllerPreference"] = {
        hasPreference: true,
        midiMappingPreference: {} as any,
    };

    public constructor(access: MIDIAccessRecord) {
        this.access = access;
        this.online = true;
        this.inputs_size = access!.inputs.size;
        this.outputs_size = access!.outputs.size;
        this.controllerPreference = {
            hasPreference: true,
            midiMappingPreference: new MIDIMappingPreference("TouchOSC Bridge"),
        };
        this._setInputs(access!.inputs);
        this._setOutputs(access!.outputs);
    }
    public static async requestMIDIAccess(): Promise<MIDIAccessRecord> {
        return window.navigator.requestMIDIAccess();
    }

    public setInputCbs(
        _onmidicb?: (event: MIDIMessageEvent) => unknown,
        _onstatechangecb?: (event: MIDIConnectionEvent) => unknown
    ): this {
        for (let j = 0; j < this.inputs!.length; j++) {
            this.inputs![j].onstatechange = _onstatechangecb;
            this.inputs![j].onmidimessage = _onmidicb;
        }
        return this;
    }

    private _setInputs(inputs: MIDIAccessRecord["inputs"]) {
        if (inputs.size > 0) {
            const MIDI_INPUT_LIST_SIZE = inputs.size;
            const entries = inputs.entries();

            for (let i = 0; i < MIDI_INPUT_LIST_SIZE; i++) {
                this.inputs!.push(entries.next().value[1]);
            }
        }
    }
    private _setOutputs(inputs: MIDIAccessRecord["outputs"]) {}
}
