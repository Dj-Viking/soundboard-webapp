import { Storage } from "./Storage.js";
import { btnIDB } from "./ButtonIDB.js";
import { KeyControl } from "./index.js";
import { getRandomId } from "./utils.js";
export type ButtonProps = {
    id: string;
    color: string;
    file?: File | null;
};
export class Button {
    private readonly COLORS: string[] = ["red", "grey", "green", "blue"];
    public readonly el: HTMLButtonElement;
    public readonly btnAssignmentSpan: HTMLSpanElement = document.createElement("span");
    public readonly audioEl: HTMLAudioElement = document.createElement("audio");
    public readonly fileInputEl: HTMLInputElement = document.createElement("input");
    public readonly filenameSpan: HTMLSpanElement = document.createElement("span");
    public color: string = "";
    public hasAudioFile: boolean = false;
    public isPlaying: boolean = false;
    public file?: File | null = null;

    public constructor(props: Partial<ButtonProps>) {
        const { color, id, file } = props;

        this.file = file;

        this.filenameSpan.id = getRandomId();
        this.filenameSpan.style.color = "white";

        this.audioEl.id = getRandomId();

        this.fileInputEl.type = "file";
        this.fileInputEl.style.display = "none";
        this.fileInputEl.accept = ".mp3,.wav";
        this.fileInputEl.id = getRandomId() + "_file";

        // TODO: append tooltip to show name of the file on the button?
        this.fileInputEl.addEventListener("change", () => {
            if (this.fileInputEl.files?.length === 1) {
                const file = this.fileInputEl.files.item(0)!;
                const src = URL.createObjectURL(file);

                this.filenameSpan.textContent = file.name;
                this.el.style.width = "auto";
                this.el.prepend(this.filenameSpan);

                this.file = file;

                this.audioEl.src = src;
                this.hasAudioFile = true;
                this.props = {
                    ...this.props,
                    file,
                };

                btnIDB.update(this.props);

                Storage.updateButton(this);
            }
        });

        this.el = document.createElement("button");

        id ? (this.el.id = id) : (this.el.id = getRandomId());

        this.el.classList.add("soundboard-button");

        // pick random color if didn't decide on what i guess
        this.color = color || this.getRandomColor();

        this.el.style.backgroundColor = color || this.color;

        this.props = {
            color: this.color,
            id: id || getRandomId(),
            file: file,
        };

        this.el.append(this.audioEl, this.fileInputEl);
    }

    public clickInput = (keyCtrl: KeyControl) => {
        this.fileInputEl.click();
        keyCtrl.f = false;
    };

    public set props(obj: ButtonProps) {
        const { color, id, file } = obj;

        this.color = color;
        this.el.id = id;

        if (file) {
            this.filenameSpan.textContent = file.name;
            this.el.prepend(this.filenameSpan);
            this.el.style.width = "auto";
            this.file = file;
            this.hasAudioFile = true;
            this.audioEl.src = URL.createObjectURL(file);
        }
    }

    public get props(): ButtonProps {
        return {
            color: this.color,
            id: this.el.id,
            file: this.file,
        };
    }

    private getRandomColor(): string {
        return this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
    }
}
