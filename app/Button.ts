import { Storage } from "./Storage.js";
import { btnIDB } from "./IDB.js";
export type ButtonProps = {
    id: string;
    color: string;
    file?: File | null;
};
export class Button {
    public el: HTMLButtonElement;
    public color: string = "";
    private readonly COLORS: string[] = ["red", "grey", "green", "blue", "white"];
    public audioEl: HTMLAudioElement;
    public fileInputEl: HTMLInputElement;
    public filenameSpan: HTMLSpanElement;
    public hasAudioFile: boolean = false;
    public isPlaying: boolean = false;
    public file?: File | null = null;

    public constructor(props: Partial<ButtonProps>) {
        const { color, id, file } = props;

        this.file = file;

        this.filenameSpan = document.createElement("span");
        this.filenameSpan.id = this.getRandomId();

        this.audioEl = document.createElement("audio");
        this.audioEl.id = this.getRandomId();

        this.fileInputEl = document.createElement("input");
        this.fileInputEl.type = "file";
        this.fileInputEl.style.display = "none";
        this.fileInputEl.accept = ".mp3,.wav";
        this.fileInputEl.id = this.getRandomId() + "_file";

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

                btnIDB.handleRequest("update", this.props);

                Storage.updateButton(this);
            }
        });

        this.el = document.createElement("button");

        id ? (this.el.id = id) : (this.el.id = this.getRandomId());

        this.el.classList.add("soundboard-button");

        // pick random color if didn't decide on what i guess
        this.color = color || this.getRandomColor();

        this.el.style.backgroundColor = color || this.color;

        this.props = {
            color: this.color,
            id: id || this.getRandomId(),
            file: file,
        };

        this.el.append(this.audioEl, this.fileInputEl);
    }

    public set props(obj: ButtonProps) {
        const { color, id, file } = obj;

        this.color = color;
        this.el.id = id;

        if (file) {
            this.filenameSpan.textContent = file.name;
            this.file = file;
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

    private getRandomId(): string {
        return (Math.random() * 10000).toString().replace(".", "_");
    }

    private getRandomColor(): string {
        return this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
    }
}
