import { Button } from "./Button.js";
import { btnIDB } from "./IDB.js";
export class Storage {
    public static getStorageButtons(): Array<Button["props"]> {
        return JSON.parse(localStorage.getItem("buttons") as string) as Array<Button["props"]>;
    }
    public static updateButton(btn_: Button): void {
        const btns = Storage.getStorageButtons().map((props) => new Button(props));
        const btnsWithoutBtnToUpdate = btns.filter((btn) => btn.el.id !== btn_.el.id);
        const btnToUpdate = btns.find((btn) => btn.el.id === btn_.el.id)!;

        btnToUpdate.props = btn_.props;

        Storage.setStorageButtons([
            btnToUpdate.props,
            ...btnsWithoutBtnToUpdate.map((btn) => btn.props),
        ]);
    }
    public static setStorageButtons(btns: Array<Button["props"]>): void {
        localStorage.setItem("buttons", JSON.stringify(btns));
    }
}
