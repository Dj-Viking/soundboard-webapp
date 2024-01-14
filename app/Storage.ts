import { Button } from "./Button.js";
import { btnIDB } from "./ButtonIDB.js";
export class Storage {
    public static async getStorageButtons(): Promise<Array<Button["props"]>> {
        return new Promise<Array<Button["props"]>>((res) => {
            (async () => {
                res((await btnIDB.getAll()) as Button["props"][]);
            })();
        });
    }
    public static async updateButton(btn_: Button): Promise<void> {
        const btns = (await Storage.getStorageButtons()).map((props) => new Button(props));
        const btnsWithoutBtnToUpdate = btns.filter((btn) => btn.el.id !== btn_.el.id);
        const btnToUpdate = btns.find((btn) => btn.el.id === btn_.el.id)!;

        btnToUpdate.props = btn_.props;

        Storage.setStorageButtons([btnToUpdate.props, ...btnsWithoutBtnToUpdate.map((btn) => btn.props)]);
    }
    public static setStorageButtons(btns: Array<Button["props"]>): void {
        localStorage.setItem("buttons", JSON.stringify(btns));
    }
}
