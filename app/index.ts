import { Styles } from "./styles.js";
import { Button } from "./Button.js";
import { btnIDB } from "./IDB.js";
import { Storage } from "./Storage.js";
export type KeyControl = Record<KeyboardKey, boolean>;
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

    private addNewButtonToBoard = (_event: MouseEvent) => {
        const storageButtons = Storage.getStorageButtons();
        const btn = new Button({});

        btnIDB.handleRequest("put", btn);

        storageButtons.push(btn.props);

        btn.el.addEventListener("click", (_e) => {
            this.boardButtonClickHandler(this.keyControl, btn);
        });

        this.soundboardContainer.appendChild(btn.el);

        Storage.setStorageButtons(storageButtons);
    };

    private boardButtonClickHandler = (keyControl: KeyControl, btn: Button) => {
        switch (true) {
            case keyControl.f:
                {
                    btn.fileInputEl.click();
                    this.keyControl = { ...this.keyControl, f: false };
                }
                break;
            case keyControl.Control:
                {
                    const filtered = Storage.getStorageButtons().filter(
                        (sb) => sb.id !== btn.el.id
                    );
                    Storage.setStorageButtons(filtered);

                    this.soundboardContainer.removeChild(document.getElementById(btn.el.id)!);
                }
                break;
            case btn.hasAudioFile &&
                Object.values(this.keyControl).every((pressedKey) => pressedKey === false):
                {
                    if (btn.hasAudioFile) {
                        (async () => {
                            if (!btn.isPlaying) {
                                btn.isPlaying = true;
                                await btn.audioEl.play();
                            } else {
                                btn.isPlaying = false;
                                btn.audioEl.pause();
                                // restart the track
                                btn.audioEl.currentTime = 0;
                            }
                        })();
                    }
                }
                break;
            default:
                {
                }
                break;
        }
    };

    private soundboardSetup(): void {
        this.addButtonEl.classList.add("add-button");
        this.addButtonEl.innerText = "Add A New Button +";
        this.addButtonEl.addEventListener("click", this.addNewButtonToBoard);
        this.soundboardContainer.classList.add("soundboard-container");

        const strgeBtns = Storage.getStorageButtons();

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
