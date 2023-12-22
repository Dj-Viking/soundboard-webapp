/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Button } from "./Button";
export type IDBRequestMethod = "put" | "getAll" | "delete" | "deleteAll" | "update";
export type RequestItemType<T> = T extends Button ? Button : any;
// make this the abstract class to make new idb helpers based on their type
class IDBHelper<T> {
    /**
     * inaccessible
     */
    #storeName: string;
    /**
     * inaccessible
     */
    #dbName: string;
    private version = 1;

    public constructor(_dbName: string, _storeName: string) {
        this.#dbName = _dbName;
        this.#storeName = _storeName;
        this.initializeHelper();
    }

    protected initializeHelper(): void {
        // open a connection to the database `led-matrix` with
        // the version of 1
        this.openConnection().then((request) => {
            request.onupgradeneeded = (_event: IDBVersionChangeEvent) => {
                // console.info("on upgrade needed called with new version change", event);

                let tempDb = request!.result;

                tempDb.createObjectStore(this.#storeName, { keyPath: "id" as keyof T as string });
            };
            request.onerror = (_event: Event) => {
                // console.error("an error occurred during the open request", event);
            };
        });
    }

    protected async openConnection(): Promise<IDBOpenDBRequest> {
        // console.info("opening connection for a transaction to idb");
        return new Promise((res) => {
            res(window.indexedDB.open(this.#dbName, this.version));
        });
    }

    protected async openStore(
        reqResult: IDBRequest
    ): Promise<[IDBDatabase, IDBObjectStore, IDBTransaction]> {
        // console.info("indexed db open request succeeded");
        return new Promise((res) => {
            // start saving references to the database to the `db` variable
            const tempDb = reqResult.result;

            // open a transaction to whatever we pass into `storeName`
            // must match one of the object store names in this promise
            const tempTransaction = tempDb.transaction(this.#storeName, "readwrite");

            // save a reference to that object store that we passed as
            // the storename string
            const store = tempTransaction.objectStore(this.#storeName);

            res([tempDb, store, tempTransaction]);
        });
    }

    private handleUpdate<I extends RequestItemType<T>>(req: IDBRequest<T[]>, item?: I) {
        if (!item || !item.el.id) {
            throw new Error("update requires the item to be passed to the request handler");
        }
        req.onsuccess = () => {
            if (req.result.length > 0) {
                const filtered = req.result.filter((item_) => (item_ as any).id === item.el.id);
            }
        };
    }

    public async handleRequest(
        method: IDBRequestMethod,
        item?: RequestItemType<T>
    ): Promise<void | T[]> {
        return new Promise<void | T[]>((resolve) => {
            this.openConnection().then((request) => {
                request.onsuccess = () => {
                    this.openStore(request).then(([db, store, transaction]) => {
                        let itemsReq: IDBRequest<T[]>;

                        switch (method) {
                            case "update":
                                {
                                    itemsReq = store.getAll();
                                    this.handleUpdate<RequestItemType<T>>(itemsReq, item);
                                    resolve();
                                }
                                break;
                            case "deleteAll":
                                {
                                    itemsReq = store.getAll() as IDBRequest<T[]>;
                                    itemsReq.onsuccess = () => {
                                        if (itemsReq.result.length > 0) {
                                            store.clear();
                                        }
                                        resolve();
                                    };
                                }
                                break;
                            case "put":
                                {
                                    store.put(item);
                                    resolve();
                                }
                                break;
                            case "getAll":
                                {
                                    itemsReq = store.getAll() as IDBRequest<T[]>;
                                    itemsReq.onsuccess = () => {
                                        const gifs = itemsReq.result as T[];
                                        resolve(gifs);
                                    };
                                }
                                break;
                            case "delete":
                                {
                                    if (!item) {
                                        throw new Error(
                                            "cannot delete a gif without passing a gif object to the class \n usage: class.handleRequest('delete', gif);"
                                        );
                                    }
                                    if (!(item as any).id) {
                                        throw new Error(
                                            "to use this class your items must have an id property"
                                        );
                                    }
                                    store.delete((item as T as any)!.id);
                                    resolve();
                                }
                                break;
                            default:
                                break;
                        }

                        transaction.oncomplete = () => {
                            // console.info("transaction complete closing connection");
                            db.close();
                            resolve();
                        };
                    });
                };
            });
        });
    }
}

const btnIDB = new IDBHelper<Button>("soundboard", "buttons");

export { btnIDB };
