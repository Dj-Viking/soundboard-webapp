/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Button } from "./Button.js";
import { Storage } from "./Storage.js";
// make this the abstract class to make new idb helpers based on their type

export interface IIDB<A = any> {
    put: (item: A, storeName: string) => void;
    update: (item: A, storeName: string) => void;
    delete: (item: A, storeName: string) => void;
    getAll: (storeName: string) => Promise<A[]>;
}
export class IDB<T = any> implements IIDB {
    protected dbName: string;
    protected version: number;

    public constructor(_dbName: string, version: number) {
        this.dbName = _dbName;
        this.version = version;
        this.initializeHelper();
    }

    public addObjectStore(newStoreName: string, storage: typeof Storage): void {
        this.version++;
        storage.setIDBVersionInLocalStorage(this.version);
        const openRequest = window.indexedDB.open(this.dbName, this.version);
        openRequest.onupgradeneeded = (_e: IDBVersionChangeEvent) => {
            const tempDb = openRequest.result;

            tempDb.createObjectStore(newStoreName, { keyPath: "id" });
        };

        openRequest.onerror = () => {
            console.error("ERROR during adding new object store open request");
        };
    }

    protected initializeHelper(): void {
        this.openConnection().then((request) => {
            request.onupgradeneeded = (_event: IDBVersionChangeEvent) => {
                // console.info("on upgrade needed called with new version change", event);

                let tempDb = request!.result;

                tempDb.createObjectStore("buttons", { keyPath: "id" as keyof T as string });
            };
            request.onerror = (_event: Event) => {
                console.error("an error occurred during the open request", event);
            };
        });
    }

    protected async openConnection(): Promise<IDBOpenDBRequest> {
        // console.info("opening connection for a transaction to idb");
        return new Promise((res) => {
            (async () => {
                res(window.indexedDB.open(this.dbName, this.version));
            })();
        });
    }

    protected async openStore(
        reqResult: IDBRequest,
        storeName: string
    ): Promise<[IDBDatabase, IDBObjectStore, IDBTransaction]> {
        // console.info("indexed db open request succeeded");
        return new Promise((res) => {
            // start saving references to the database to the `db` variable
            const tempDb = reqResult.result;

            // open a transaction to whatever we pass into `storeName`
            // must match one of the object store names in this promise
            const tempTransaction = tempDb.transaction(storeName, "readwrite");

            // save a reference to that object store that we passed as
            // the storename string
            const store = tempTransaction.objectStore(storeName);

            res([tempDb, store, tempTransaction]);
        });
    }

    // to be overridden
    public async update(item: any, storeName: string): Promise<void> {
        return new Promise<void>((res) => {
            this.openConnection().then((req) => {
                req.onsuccess = () => {
                    this.openStore(req, storeName).then(([db, store, transaction]) => {
                        const itemsReq: IDBRequest<Button["props"][]> = store.getAll();

                        itemsReq.onsuccess = () => {
                            // TODO: redo update and switch on the object store names because they are different object types
                            // console.error("TODO!!! idb update");
                            switch (storeName) {
                                case "buttons":
                                    {
                                        if (itemsReq.result.length > 0) {
                                            const filtered = itemsReq.result
                                                .filter((props) => props.id === item.id)
                                                .map((props) => new Button(props));

                                            const btnToUpdate = filtered.find((btn) => btn.el.id === item.id)!;

                                            btnToUpdate.props = { ...btnToUpdate.props, file: item.file };

                                            store.delete(item.id);
                                            store.put(btnToUpdate.props);
                                        }
                                    }
                                    break;

                                default:
                                    break;
                            }
                        };

                        transaction.oncomplete = () => {
                            // console.info("transaction complete closing connection");
                            db.close();
                            res();
                        };
                    });
                };
            });
        });
    }

    public async deleteAll(storeName: string): Promise<void> {
        return new Promise<void>((res) => {
            this.openConnection().then((req) => {
                req.onsuccess = () => {
                    this.openStore(req, storeName).then(([db, store, transaction]) => {
                        const itemsReq = store.getAll() as IDBRequest<Button["props"][]>;
                        itemsReq.onsuccess = () => {
                            if (itemsReq.result.length > 0) {
                                store.clear();
                            }
                            transaction.oncomplete = () => {
                                // console.info("transaction complete closing connection");
                                db.close();
                                res();
                            };
                        };
                    });
                };
            });
        });
    }
    public async put(item: any, storeName: string): Promise<void> {
        return new Promise<void>((res) => {
            this.openConnection().then((req) => {
                req.onsuccess = () => {
                    this.openStore(req, storeName).then(([db, store, transaction]) => {
                        store.put(item);
                        transaction.oncomplete = () => {
                            // console.info("transaction complete closing connection");
                            db.close();
                            res();
                        };
                    });
                };
            });
        });
    }

    public async getAll(storeName: string): Promise<any[]> {
        return new Promise<any[]>((res) => {
            this.openConnection().then((req) => {
                req.onsuccess = () => {
                    this.openStore(req, storeName).then(([db, store, transaction]) => {
                        const itemsReq = store.getAll();

                        itemsReq.onsuccess = () => {
                            transaction.oncomplete = () => {
                                db.close();
                            };
                            res(itemsReq.result);
                        };
                    });
                };
                req.onerror = (e: any) => {
                    console.error("WHAT THE FUCK ERROR", e);
                };
            });
        });
    }

    public async delete(item: any, storeName: string): Promise<void> {
        return new Promise<void>((res) => {
            this.openConnection().then((req) => {
                req.onsuccess = () => {
                    this.openStore(req, storeName).then(([db, store, transaction]) => {
                        store.delete((item as any).id);
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
