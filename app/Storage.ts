import { Button } from "./Button.js";
import { idb } from "./index.js";
// TODO: don't use IDB for storing the fucking midi mappings...  it takes too fucking long to add another object store because of the onupgradeneeded shit
// use local storage instead
export class Storage {
    // btnIDB: ButtonIDB;
    public constructor() {
        if (!window.localStorage.getItem("idb_version")) {
            window.localStorage.setItem("idb_version", (1).toString());
        }
    }
    public static setIDBVersionInLocalStorage(version: number): void {
        window.localStorage.setItem("idb_version", version.toString());
    }
    public static getIDBVersionFromLocalStorage(): number {
        return JSON.parse(window.localStorage.getItem("idb_version") as string);
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
