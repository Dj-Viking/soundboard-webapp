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
    public fileInputEl: HTMLInputElement;
    public inputFiles: FileList = {} as any;

    public constructor(props: Partial<ButtonProps>) {
        const { src, color, id } = props;
        this.audioEl = document.createElement("audio");
        this.audioEl.id = this.getRandomId();

        this.fileInputEl = document.createElement("input");
        this.fileInputEl.type = "file";
        this.fileInputEl.style.display = "none";
        this.fileInputEl.accept = ".mp3,.wav";
        this.fileInputEl.id = this.getRandomId() + "_file";

        this.fileInputEl.addEventListener("change", (e) => {
            console.log("change event on the input!!", e);
        });

        src && (this.audioEl.src = src);

        this.el = document.createElement("button");
        id ? (this.el.id = id) : (this.el.id = this.getRandomId());

        this.el.classList.add("soundboard-button");

        // pick random color if didn't decide on what i guess
        this.color = color || this.getRandomColor();

        this.el.style.backgroundColor = color || this.color;
        this.props = {
            src: src || "",
            color: this.color,
            id: id || this.getRandomId(),
        };

        this.el.append(this.audioEl, this.fileInputEl);
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

    private getRandomId(): string {
        return (Math.random() * 10000).toString().replace(".", "_");
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
    public fKeyMessageSpan: HTMLSpanElement;
    public addButtonEl: HTMLButtonElement;
    public header: HTMLHeadingElement;
    public keyControl: KeyControl = {
        Alt: false,
        f: false,
        Control: false,
        Shift: false,
    };

    public constructor() {
        this.body = document.body;
        this.header = document.createElement("h1");
        this.btnControlContainer = document.createElement("div");
        this.ctrlKeyMessageSpan = document.createElement("span");
        this.fKeyMessageSpan = document.createElement("span");
        this.addButtonEl = document.createElement("button");
        this.soundboardContainer = document.createElement("div");
        this.init();
        this.soundboardSetup();
    }

    // reset keydown updates
    public handleKeyUp = () => {
        this.keyControl = {
            Alt: false,
            f: false,
            Control: false,
            Shift: false,
        };
        this.ctrlKeyMessageSpan.style.visibility = "hidden";
        this.fKeyMessageSpan.style.visibility = "hidden";
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
            case "f":
                {
                    this.keyControl = {
                        ...this.keyControl,
                        f: true,
                    };
                    this.fKeyMessageSpan.style.visibility = "visible";
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
    };
    public init(): void {
        if (!localStorage.getItem("buttons")) {
            localStorage.setItem("buttons", JSON.stringify([]));
        }
        document.addEventListener("drag", (e) => {
            console.log("drag event", e);
        });
        document.addEventListener("keydown", this.handleKeyDown as any);
        document.addEventListener("keyup", this.handleKeyUp);

        document.head.appendChild(new Styles().tag);

        this.header.innerText = "have fun with the soundboard!";
        this.header.classList.add("header");

        this.body.appendChild(this.header);

        this.btnControlContainer.classList.add("btn-control-container");

        this.ctrlKeyMessageSpan.innerText = "Control is pressed! - click a button to delete it";
        this.ctrlKeyMessageSpan.style.color = "red";
        this.ctrlKeyMessageSpan.style.visibility = "hidden";
        this.ctrlKeyMessageSpan.style.fontWeight = "bold";

        this.fKeyMessageSpan.innerText =
            "F is pressed! - click a button to upload an audio file onto it";
        this.fKeyMessageSpan.style.color = "blue";
        this.fKeyMessageSpan.style.visibility = "hidden";
        this.fKeyMessageSpan.style.fontWeight = "bold";

        this.btnControlContainer.append(
            this.addButtonEl,
            this.ctrlKeyMessageSpan,
            this.fKeyMessageSpan
        );

        this.body.append(this.btnControlContainer, this.soundboardContainer);
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
            this.boardButtonClickHandler(this.keyControl, btn);
        });

        this.soundboardContainer.appendChild(btn.el);

        this.setStorageButtons(storageButtons);
    };

    private boardButtonClickHandler = (keyControl: KeyControl, btn: Button) => {
        switch (true) {
            case keyControl.f:
                {
                    btn.fileInputEl.click();
                }
                break;
            case keyControl.Control:
                {
                    const filtered = this.getStorageButtons().filter((sb) => sb.id !== btn.el.id);
                    this.setStorageButtons(filtered);

                    this.soundboardContainer.removeChild(document.getElementById(btn.el.id)!);
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
                this.boardButtonClickHandler(this.keyControl, btn);
            });
            this.soundboardContainer.appendChild(btn.el);
        });
    }

    public run(): void {
        console.log("hello world");
    }
}

new Main().run();
