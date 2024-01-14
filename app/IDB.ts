/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Button } from "./Button.js";
// make this the abstract class to make new idb helpers based on their type

export interface IIDBHelper<A = any> {
    put: (item: A) => void;
    update: (item: A) => void;
    delete: (item: A) => void;
    getAll: () => Promise<A[]>;
}
export abstract class IDBHelper<T, A> implements IIDBHelper<A> {
    protected storeName: string;
    protected dbName: string;
    private version = 1;

    public constructor(_dbName: string, _storeName: string) {
        this.dbName = _dbName;
        this.storeName = _storeName;
        this.initializeHelper();
    }

    protected initializeHelper(): void {
        // open a connection to the database `led-matrix` with
        // the version of 1
        this.openConnection().then((request) => {
            request.onupgradeneeded = (_event: IDBVersionChangeEvent) => {
                // console.info("on upgrade needed called with new version change", event);

                let tempDb = request!.result;

                tempDb.createObjectStore(this.storeName, { keyPath: "id" as keyof T as string });
            };
            request.onerror = (_event: Event) => {
                // console.error("an error occurred during the open request", event);
            };
        });
    }

    protected async openConnection(): Promise<IDBOpenDBRequest> {
        // console.info("opening connection for a transaction to idb");
        return new Promise((res) => {
            res(window.indexedDB.open(this.dbName, this.version));
        });
    }

    protected async openStore(reqResult: IDBRequest): Promise<[IDBDatabase, IDBObjectStore, IDBTransaction]> {
        // console.info("indexed db open request succeeded");
        return new Promise((res) => {
            // start saving references to the database to the `db` variable
            const tempDb = reqResult.result;

            // open a transaction to whatever we pass into `storeName`
            // must match one of the object store names in this promise
            const tempTransaction = tempDb.transaction(this.storeName, "readwrite");

            // save a reference to that object store that we passed as
            // the storename string
            const store = tempTransaction.objectStore(this.storeName);

            res([tempDb, store, tempTransaction]);
        });
    }

    // to be overridden
    public async update(_item: A): Promise<void> {
        return new Promise<void>((res) => {
            this.openConnection().then((req) => {
                req.onsuccess = () => {
                    this.openStore(req).then(([db, store, transaction]) => {
                        const _itemsReq: IDBRequest<Button["props"][]> = store.getAll();

                        console.error("override update handleRequest for each inherited new class");
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

    public async deleteAll(): Promise<void> {
        return new Promise<void>((res) => {
            this.openConnection().then((req) => {
                req.onsuccess = () => {
                    this.openStore(req).then(([db, store, transaction]) => {
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
    public async put(item: A): Promise<void> {
        return new Promise<void>((res) => {
            this.openConnection().then((req) => {
                req.onsuccess = () => {
                    this.openStore(req).then(([db, store, transaction]) => {
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

    public async getAll(): Promise<A[]> {
        return new Promise<A[]>((res) => {
            this.openConnection().then((req) => {
                req.onsuccess = () => {
                    this.openStore(req).then(([db, store, transaction]) => {
                        const itemsReq = store.getAll();

                        itemsReq.onsuccess = () => {
                            transaction.oncomplete = () => {
                                db.close();
                            };
                            res(itemsReq.result);
                        };
                    });
                };
            });
        });
    }

    public async delete(item: A): Promise<void> {
        return new Promise<void>((res) => {
            this.openConnection().then((req) => {
                req.onsuccess = () => {
                    this.openStore(req).then(([db, store, transaction]) => {
                        store.delete((item as A as any).id);
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
