import { Styles } from "./styles.js";
type ButtonProps = {
    src: string;
    id: string;
    color: string;
};
class Button {
    public el: HTMLButtonElement;
    public color: string = "";
    private readonly COLORS: string[] = ["red", "grey", "green", "blue", "white"];
    public audioEl: HTMLAudioElement;

    public constructor(props: Partial<ButtonProps>) {
        const { src, color, id } = props;
        this.audioEl = document.createElement("audio");
        src && (this.audioEl.src = src);

        this.el = document.createElement("button");
        id ? (this.el.id = id) : (this.el.id = (Math.random() * 10000).toString());

        this.el.classList.add("soundboard-button");

        // pick random color if didn't decide on what i guess
        this.color = color || this.getRandomColor();

        this.el.style.backgroundColor = color || this.color;
        this.props = {
            src: src || "",
            color: this.color,
            id: id || (Math.random() * 10000).toString(),
        };

        this.el.appendChild(this.audioEl);
    }

    private set props(obj: ButtonProps) {
        const { src, color, id } = obj;
        src && (this.audioEl.src = src);
        this.color = color;
        this.el.id = id;
    }

    public get props(): ButtonProps {
        return {
            src: this.audioEl.src,
            color: this.color,
            id: this.el.id,
        };
    }

    private getRandomColor(): string {
        return this.COLORS[Math.floor(Math.random() * this.COLORS.length)];
    }
}

type KeyControl = Record<KeyboardKey, boolean>;
class Main {
    public body: HTMLElement;
    public soundboardContainer: HTMLDivElement;
    public btnControlContainer: HTMLDivElement;
    public ctrlKeyMessageSpan: HTMLSpanElement;
    public addButtonEl: HTMLButtonElement;
    public header: HTMLHeadingElement;
    public keyControl: KeyControl = {
        Alt: false,
        Control: false,
        Shift: false,
    };

    public constructor() {
        this.body = document.body;
        this.header = document.createElement("h1");
        this.btnControlContainer = document.createElement("div");
        this.ctrlKeyMessageSpan = document.createElement("span");
        this.addButtonEl = document.createElement("button");
        this.soundboardContainer = document.createElement("div");
        this.init();
        this.soundboardSetup();
    }

    // reset keydown updates
    public handleKeyUp = () => {
        this.keyControl = {
            Alt: false,
            Control: false,
            Shift: false,
        };
        this.ctrlKeyMessageSpan.style.visibility = "hidden";
    };

    public handleKeyDown = (event: MyKeyboardEvent) => {
        switch (event.key) {
            case "Shift":
                {
                    this.keyControl = {
                        ...this.keyControl,
                        Shift: true,
                    };
                }
                break;
            case "Alt":
                {
                    this.keyControl = {
                        ...this.keyControl,
                        Alt: true,
                    };
                }
                break;
            case "Control":
                {
                    this.keyControl = {
                        ...this.keyControl,
                        Control: true,
                    };
                    this.ctrlKeyMessageSpan.style.visibility = "visible";
                }
                break;
            default:
                {
                    console.log("unhandled key", event.key);
                }
                break;
        }
        console.log(this.keyControl);
    };
    public init(): void {
        if (!localStorage.getItem("buttons")) {
            localStorage.setItem("buttons", JSON.stringify([]));
        }

        document.addEventListener("keydown", this.handleKeyDown as any);
        document.addEventListener("keyup", this.handleKeyUp);

        document.head.appendChild(new Styles().tag);

        this.header.innerText = "have fun with the soundboard!";
        this.header.style.color = "blue";

        this.body.appendChild(this.header);

        this.btnControlContainer.classList.add("btn-control-container");

        this.ctrlKeyMessageSpan.innerText = "Control is pressed! - click a button to delete it";
        this.ctrlKeyMessageSpan.style.color = "red";
        this.ctrlKeyMessageSpan.style.visibility = "hidden";

        this.btnControlContainer.append(this.addButtonEl, this.ctrlKeyMessageSpan);

        this.body.appendChild(this.btnControlContainer);
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

        btn.el.addEventListener("click", (_e) => {
            this.boardButtonClickHandler(this.keyControl, btn.el);
        });

        this.soundboardContainer.appendChild(btn.el);

        this.setStorageButtons(storageButtons);
    };

    private boardButtonClickHandler = (keyControl: KeyControl, btn: Button["el"]) => {
        switch (true) {
            case keyControl.Control:
                {
                    this.soundboardContainer.removeChild(document.getElementById(btn.id)!);
                }
                break;
            default:
                break;
        }
    };

    private soundboardSetup(): void {
        this.addButtonEl.classList.add("add-button");
        this.addButtonEl.innerText = "Add A New Button +";
        this.addButtonEl.addEventListener("click", this.addNewButtonToBoard);
        this.soundboardContainer.classList.add("soundboard-container");

        const strgeBtns = this.getStorageButtons();

        const btns = strgeBtns.map((props) => new Button(props));

        btns.forEach((btn) => {
            btn.el.addEventListener("click", (_e) => {
                this.boardButtonClickHandler(this.keyControl, btn.el);
            });
            this.soundboardContainer.appendChild(btn.el);
        });
    }

    public run(): void {
        console.log("hello world");
    }
}

new Main().run();
