import { DefaultDeserializer } from "v8";
import { Button } from "./Button.js";
import { GenericControlName, MIDIInputName, UIInterfaceDeviceName } from "./MIDIController.js";
import { MIDIMapping, MIDIMappingPreference } from "./MIDIMapping.js";
import { idb } from "./index.js";
import { getAllJSDocTagsOfKind } from "../node_modules/typescript/lib/typescript.js";
// TODO: don't use IDB for storing the fucking midi mappings...  it takes too fucking long to add another object store because of the onupgradeneeded shit
// use local storage instead
export class Storage {
    public static getMIDIMappingFromStorage(name: MIDIInputName): MIDIMappingPreference<typeof name> | null {
        if (localStorage.getItem(name)) {
            const ret = new MIDIMappingPreference<typeof name>(JSON.parse(localStorage.getItem(name)!));
            MIDIMappingPreference.setMIDICallbackMapBasedOnControllerName(ret);
            return ret;
        } else {
            return null;
        }
    }
    public static updateMIDIMappingInStorage<T extends MIDIInputName>(
        pref: MIDIMappingPreference<T>,
        controlName: GenericControlName<T>,
        channel: number,
        uiName: UIInterfaceDeviceName
    ) {
        const storageMapping = new MIDIMappingPreference(
            (JSON.parse(localStorage.getItem(pref.name)!) as MIDIMappingPreference<T>).name
        );

        // overwrite new mapping with the inputs to this function
        // somehow check which controls are mapped already and if they already have
        // a channel assigned to them which is the same as the one we're trying to assign
        // then unset it to the default un-set values
        if (
            storageMapping.mapping[controlName].channel === channel &&
            storageMapping.mapping[controlName].uiName === uiName
        ) {
            storageMapping.mapping[controlName].channel = 9999;
            storageMapping.mapping[controlName].uiName = "" as any;
            window.localStorage.setItem(pref.name, JSON.stringify(storageMapping));
        }

        // TODO-NOTE:
        // right now multiple channels could be mapped to the same ui control interface
        storageMapping.mapping = {
            ...storageMapping.mapping,
            [controlName]: {
                channel,
                uiName,
            },
        };

        localStorage.setItem(pref.name, JSON.stringify(storageMapping));
        return storageMapping;
    }

    public static async getStorageButtons(): Promise<Array<Button["props"]>> {
        return new Promise<Array<Button["props"]>>((res) => {
            (async () => {
                const result = await idb.idbContainsStoreName("buttons");
                if (result) {
                    const buttons = await idb.getAll("buttons");
                    res(buttons as Button["props"][]);
                } else {
                    res([]);
                }
            })();
        });
    }
}
