import { Button } from "./Button.js";
import { IDBHelper, IIDBHelper } from "./IDB.js";

interface IButtonIDB<A extends Button["props"]> extends IIDBHelper<A> {
    put: (item: Button["props"]) => void;
}

export class ButtonIDB extends IDBHelper<Button, Button["props"]> implements IButtonIDB<Button["props"]> {
    public override async update(item: Button["props"]): Promise<void> {
        return new Promise<void>((res) => {
            this.openConnection().then((req) => {
                req.onsuccess = () => {
                    this.openStore(req).then(([db, store, transaction]) => {
                        if (!item || !item.id) {
                            throw new Error("update requires the item to be passed to the request handler");
                        }
                        const itemsReq: IDBRequest<Button["props"][]> = store.getAll();
                        itemsReq.onsuccess = () => {
                            if (itemsReq.result.length > 0) {
                                const filtered = itemsReq.result
                                    .filter((props) => props.id === item.id)
                                    .map((props) => new Button(props));

                                const btnToUpdate = filtered.find((btn) => btn.el.id === item.id)!;

                                btnToUpdate.props = { ...btnToUpdate.props, file: item.file };

                                store.delete(item.id);
                                store.put(btnToUpdate.props);
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
}

const btnIDB = new ButtonIDB("soundboard", "buttons");

export { btnIDB };
