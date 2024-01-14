/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
    DEFAULT_TOUCHOSC_MAPPING_PREFERENCE_TABLE,
    MIDIInputName,
    GenericControlName,
    DEFAULT_CALLBACK_TABLE,
    UIInterfaceDeviceName,
    DEFAULT_XONE_MAPPING_PREFERENCE_TABLE,
} from "./MIDIController.js";

export type MIDIMapping<N extends MIDIInputName> = Record<
    GenericControlName<N>,
    {
        uiName: UIInterfaceDeviceName;
        channel: number;
    }
>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CallbackMapping = typeof DEFAULT_CALLBACK_TABLE;

/**
 * this example shows the collection of preferences that would be stored
 * in some storage place eventually
 * @example
 * const preference = {
 *     [this.name]: {
 *         mapping: {
 *             [controlName]: {
 *                 uiName: "circleWidth"
 *                 channel: 4
 *             },
 *             // other control names
 *             ["fader_1"]: {
 *                 uiName: "animDuration"
 *                 channel: 0
 *             }
 *         },
 *         callbackMap: {
 *             ["uiName"]: (...args: any[]) => void // (calls dispatch with supplied arguments)
 *         }
 *     },
 * }
 * // look up which callback based on the UI name derived from the midi input's own control name
 *
 * const callbackMap = {
 *     ["circleWidth"]: dispatch(someSlice.someAction(value))
 * };
 *
 * //call the callback like this
 * const uiName = preference[midiname][controlName];
 * callbackMap[uiName]()
 */
export class MIDIMappingPreference<N extends MIDIInputName = any> {
    public name: N;
    public mapping: MIDIMapping<N> = {} as any;
    public callbackMap: CallbackMapping = {} as any;

    public constructor(name: N) {
        this.name = name;

        this.#setMIDIMappingBasedOnInputName(name);
        // TODO: since functions can't be serialized into JSON for local storage
        // will have to regenerate the callbacks based on which controlName object is mapped to a particular UI interface names
        MIDIMappingPreference.setMIDICallbackMapBasedOnControllerName(this);
    }

    public static listeningForEditsHandler(): void {
        console.log("listening for edits");
        console.error("TODO");
    }

    public static getControlNameFromControllerInUseUIMapping(
        mappingInUse: MIDIMapping<MIDIInputName>,
        uiName: UIInterfaceDeviceName
    ): string {
        let ret = "";

        for (const controlName of Object.keys(mappingInUse)) {
            if (uiName === mappingInUse[controlName].uiName) {
                ret = controlName;
                break;
            } else {
                ret = "unknown control name mapping";
            }
        }

        return ret;
    }

    private static createButtonCallback(btnId: string): void {
        console.error("TODO", "btn id CALLBACK MAPPING", btnId);
    }

    public static generateCallbackBasedOnUIName<P extends keyof CallbackMapping>(
        uiName: UIInterfaceDeviceName
    ): CallbackMapping[P] {
        switch (uiName) {
            case "volume_fader": {
                return () => {
                    console.error("todo VOLUME FADER MAPPING");
                };
            }
            case "button_1_position": {
                this.createButtonCallback("ksdfkjd");
                return () => {};
            }
            default:
                return (_midiIntensity: number) => void 0;
        }
    }

    public static updatePreferenceMapping(
        _this: MIDIMappingPreference<typeof name>,
        name: MIDIInputName,
        controlName: GenericControlName<typeof name>,
        channel: number,
        uiName: UIInterfaceDeviceName
    ): MIDIMappingPreference<typeof name> {
        // update this.mapping and this.callbackmap
        let ret: typeof _this = {} as any;
        Object.assign(ret, _this);
        ret.mapping[controlName].channel = channel;
        ret.mapping[controlName].uiName = uiName;

        MIDIMappingPreference.setMIDICallbackMapBasedOnControllerName(ret);

        return ret;
    }

    public static setMIDICallbackMapBasedOnControllerName(_this: MIDIMappingPreference<MIDIInputName>): void {
        Object.keys(DEFAULT_CALLBACK_TABLE).forEach((uiName) => {
            _this.callbackMap = {
                ..._this.callbackMap,
                [uiName]: MIDIMappingPreference.generateCallbackBasedOnUIName(uiName),
            };
        });
    }

    #setMIDIMappingBasedOnInputName(name: N): void {
        switch (name) {
            case "TouchOSC Bridge":
                Object.keys(DEFAULT_TOUCHOSC_MAPPING_PREFERENCE_TABLE).forEach((key) => {
                    this.mapping = {
                        ...this.mapping,
                        [key]: DEFAULT_TOUCHOSC_MAPPING_PREFERENCE_TABLE[key],
                    };
                });
                break;
            case "XONE:K2 MIDI":
                Object.keys(DEFAULT_XONE_MAPPING_PREFERENCE_TABLE).forEach((key) => {
                    this.mapping = {
                        ...this.mapping,
                        [key]: DEFAULT_XONE_MAPPING_PREFERENCE_TABLE[key],
                    };
                });
                break;
            default:
                break;
        }
    }
}
