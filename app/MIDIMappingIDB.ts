import { IDBHelper, IIDBHelper } from "./IDB";
import { MIDIMappingPreference } from "./MIDIMapping.js";

export interface IMIDIMappingIDB<A extends MIDIMappingPreference> extends IIDBHelper<A> {
    put: (item: MIDIMappingPreference) => void;
}

export class MIDIMappingIDB
    extends IDBHelper<MIDIMappingPreference, MIDIMappingPreference>
    implements IMIDIMappingIDB<MIDIMappingPreference>
{
    public override update(_item: MIDIMappingPreference<any>): Promise<void> {
        return new Promise<void>((res) => {
            this.openConnection().then((req) => {
                req.onsuccess = () => {
                    this.openStore(req).then(([db, store, transaction]) => {
                        // TODO: implement updating mapping here!
                        // probablly just swap out the one that matches the id of the input mapping object
                        console.error("TODO: update midi mapping in IDB store");

                        transaction.oncomplete = () => {
                            db.close();
                        };
                        res();
                    });
                };
            });
        });
    }
}

const midiMappingIDB = new MIDIMappingIDB("soundboard_mapping", "mappings");
