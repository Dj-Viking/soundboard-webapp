import { Styles } from "./styles.js";

class Button {
    public el: HTMLButtonElement;
    public color: string = "";
    private readonly COLORS: string[] = ["red", "grey", "green", "blue", "white"];
    public audioEl: HTMLAudioElement;

    public constructor(props: { src?: string; color?: string }) {
        const { src, color } = props;
        this.audioEl = document.createElement("audio");
        src && (this.audioEl.src = src);
        this.el = document.createElement("button");
        this.el.addEventListener("click", this.handleClick);
        this.el.classList.add("soundboard-button");
        // pick random color if didn't decide on what i guess
        this.color = color || this.getRandomColor();

        this.el.style.backgroundColor = color || this.color;
        this.props = {
            src: src || "",
            color: this.color,
        };

        this.el.appendChild(this.audioEl);
    }

    public set props(obj: { src: string; color: string }) {
        const { src, color } = obj;
        src && (this.audioEl.src = src);
        this.color = color;
    }

    public get props(): { src: string; color: string } {
        return {
            src: this.audioEl.src,
            color: this.color,
        };
    }

    private setAudioSrc() {}
    private handleClick = (event: MouseEvent) => {
        console.log("button clicked!", event);
    };
    private getRandomColor(): string {
        return this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
    }
}
class Main {
    public body: HTMLElement;
    public soundboardContainer: HTMLDivElement;
    public addButtonEl: HTMLButtonElement;
    public header: HTMLHeadingElement;

    public constructor() {
        this.body = document.body;
        this.header = document.createElement("h1");
        this.addButtonEl = document.createElement("button");
        this.soundboardContainer = document.createElement("div");
        this.init();
        this.soundboardSetup();
    }
    public init(): void {
        if (!localStorage.getItem("buttons")) {
            localStorage.setItem("buttons", JSON.stringify([]));
        }
        document.head.appendChild(new Styles().tag);
        this.header.innerText = "have fun with the soundboard!";
        this.header.style.color = "blue";
        this.body.appendChild(this.header);
        this.body.appendChild(this.addButtonEl);
        this.body.appendChild(this.soundboardContainer);
    }

    private getStorageButtons(): Array<Button["props"]> {
        return JSON.parse(localStorage.getItem("buttons") as string) as Array<Button["props"]>;
    }

    private setStorageButtons(btns: Array<Button["props"]>): void {
        localStorage.setItem("buttons", JSON.stringify(btns));
    }

    private addNewButtonToBoard = (_event: MouseEvent) => {
        const storageButtons = this.getStorageButtons();
        const btn = new Button({});

        storageButtons.push(btn.props);

        this.soundboardContainer.appendChild(btn.el);

        this.setStorageButtons(storageButtons);
    };

    private soundboardSetup(): void {
        this.addButtonEl.classList.add("add-button");
        this.addButtonEl.innerText = "Add A New Button +";
        this.addButtonEl.addEventListener("click", this.addNewButtonToBoard);
        this.soundboardContainer.classList.add("soundboard-container");

        const strgeBtns = this.getStorageButtons();

        const btns = strgeBtns.map((props) => new Button(props));
        btns.forEach((btn) => {
            this.soundboardContainer.appendChild(btn.el);
        });
    }

    public run(): void {
        console.log("hello world");
    }
}

new Main().run();
