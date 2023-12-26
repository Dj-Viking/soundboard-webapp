import { Styles } from "./styles.js";
import { Button } from "./Button.js";
import { btnIDB } from "./IDB.js";
import { Storage } from "./Storage.js";
export type KeyControl = Record<KeyboardKey, boolean>;
class Main {
    private keyControl: KeyControl = {
        Alt: false,
        f: false,
        Control: false,
        Shift: false,
    };
    private isPlaying: boolean = false;
    private currentlyPlayingButton: Button | null = null;
    private allButtons: Record<Button["el"]["id"], Button> = {};
    private RAFId: number = 0;

    public constructor(
        private readonly body: HTMLElement = document.body,
        private readonly soundboardContainer: HTMLDivElement = document.createElement("div"),
        private readonly btnControlContainer: HTMLDivElement = document.createElement("div"),
        private readonly trackProgressBar: HTMLProgressElement = document.createElement("progress"),
        private readonly trackTimeTextSpan: HTMLSpanElement = document.createElement("span"),
        private readonly ctrlKeyMessageSpan: HTMLSpanElement = document.createElement("span"),
        private readonly volumeControlInput: HTMLInputElement = document.createElement("input"),
        private readonly volumeInputText: HTMLSpanElement = document.createElement("span"),
        private readonly fKeyMessageSpan: HTMLSpanElement = document.createElement("span"),
        private readonly addButtonEl: HTMLButtonElement = document.createElement("button"),
        private readonly stopButtonEl: HTMLButtonElement = document.createElement("button"),
        private readonly header: HTMLHeadingElement = document.createElement("h2")
    ) {
        this.init();
        this.soundboardSetup();
        this.RAFId = window.requestAnimationFrame(this.animate);
    }

    private animate = (_rafTimestamp?: number): void => {
        if (this.isPlaying) {
            //update transport while playing
            this.refreshTrackProgress(this.currentlyPlayingButton!.audioEl);
        }

        this.RAFId = window.requestAnimationFrame(this.animate);
    };

    /**
     * make this called on every frame
     */
    private refreshTrackProgress(audioEl: Button["audioEl"]): void {
        this.trackTimeTextSpan.textContent = `${this.convertTime(audioEl.currentTime)} -- ${this.convertTime(
            audioEl.duration
        )}`;

        this.trackProgressBar.max = audioEl.duration;
        this.trackProgressBar.value = audioEl.currentTime;
    }

    private convertTime(secs: number = 0): string {
        const date = new Date(0);
        date.setSeconds(secs);
        const timeString = date.toISOString().substring(11, 19);
        return timeString;
    }

    // reset keydown updates
    private handleKeyUp = () => {
        this.keyControl = {
            Alt: false,
            f: false,
            Control: false,
            Shift: false,
        };
        this.ctrlKeyMessageSpan.style.visibility = "hidden";
        this.fKeyMessageSpan.style.visibility = "hidden";
    };

    private handleKeyDown = (event: MyKeyboardEvent) => {
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

    private handleVolumeChange = (e: Event, audioEl?: HTMLAudioElement): void => {
        this.volumeInputText.textContent = `${e.target!.value}`;
        if (audioEl) {
            audioEl.volume = e.target!.value;
        }
    };

    private init(): void {
        document.head.appendChild(new Styles().tag);

        if (!localStorage.getItem("buttons")) {
            localStorage.setItem("buttons", JSON.stringify([]));
        }

        document.addEventListener("drag", (e) => {
            console.log("drag event", e);
        });
        document.addEventListener("keydown", this.handleKeyDown as any);
        document.addEventListener("keyup", this.handleKeyUp);

        this.volumeControlInput.oninput = (e) => this.handleVolumeChange(e);

        this.volumeControlInput.type = "range";
        this.volumeControlInput.min = "0";
        this.volumeControlInput.max = ".5";
        this.volumeControlInput.step = ".001";
        this.volumeControlInput.value = ".5";

        this.volumeControlInput.style.width = "30%";
        this.volumeInputText.textContent = `${this.volumeControlInput.value}`;
        this.volumeInputText.style.fontSize = "20px";
        this.volumeInputText.style.paddingLeft = "20px";

        this.header.innerText = "have fun with the soundboard!";
        this.header.classList.add("header");

        this.body.appendChild(this.header);
        const volumeLabel = document.createElement("p");
        volumeLabel.textContent = "Volume";
        this.body.append(volumeLabel, this.volumeControlInput, this.volumeInputText);

        this.btnControlContainer.classList.add("btn-control-container");

        this.ctrlKeyMessageSpan.innerText = "Control is pressed! - click a button to delete it";
        this.ctrlKeyMessageSpan.style.color = "red";
        this.ctrlKeyMessageSpan.style.visibility = "hidden";
        this.ctrlKeyMessageSpan.style.fontWeight = "bold";

        this.fKeyMessageSpan.innerText = "F is pressed! - click a button to upload an audio file onto it";
        this.fKeyMessageSpan.style.color = "blue";
        this.fKeyMessageSpan.style.visibility = "hidden";
        this.fKeyMessageSpan.style.fontWeight = "bold";

        this.trackProgressBar.classList.add("track-progress");

        this.trackTimeTextSpan.textContent = "00:00:00 -- 00:00:00";

        this.btnControlContainer.append(
            this.addButtonEl,
            this.stopButtonEl,
            this.trackProgressBar,
            this.trackTimeTextSpan,
            this.ctrlKeyMessageSpan,
            this.fKeyMessageSpan
        );

        this.body.append(this.btnControlContainer, this.soundboardContainer);
    }

    private addNewButtonToBoard = (_event: MouseEvent) => {
        Storage.getStorageButtons().then((storageButtons): void => {
            const btn = new Button({});

            btnIDB.handleRequest("put", btn.props);

            storageButtons.push(btn.props);

            btn.el.onclick = () => {
                this.boardButtonClickHandler(this.keyControl, btn);
            };
            this.allButtons[btn.el.id] = btn;

            this.stopButtonEl.onclick = () => {
                Object.values(this.allButtons).forEach((b) => {
                    b.audioEl.currentTime = 0;
                    b.audioEl.pause();
                    b.isPlaying = false;
                    this.isPlaying = false;
                    this.currentlyPlayingButton = null;
                });
            };

            this.soundboardContainer.appendChild(btn.el);

            Storage.setStorageButtons(storageButtons);
        });
    };

    private boardButtonClickHandler = (keyControl: KeyControl, btn: Button) => {
        switch (true) {
            case keyControl.f:
                {
                    (async () => {
                        if (!btn.hasAudioFile) {
                            btn.clickInput(keyControl);
                        } else {
                            await btn.audioEl.play();
                        }
                    })();
                }
                break;
            case keyControl.Control:
                {
                    Storage.getStorageButtons().then((btns) => {
                        const filtered = btns.filter((sb) => sb.id !== btn.el.id);
                        const toDelete = btns.find((sb) => sb.id === btn.el.id);
                        Storage.setStorageButtons(filtered);
                        btnIDB.handleRequest("delete", toDelete);
                        this.soundboardContainer.removeChild(document.getElementById(btn.el.id)!);
                    });
                }
                break;
            case Object.values(this.keyControl).every((pressedKey) => pressedKey === false):
                {
                    if (btn.hasAudioFile) {
                        (async () => {
                            if (this.isPlaying) {
                                Object.values(this.allButtons).forEach((_btn) => {
                                    if (_btn.audioEl.id !== btn.audioEl.id) {
                                        _btn.audioEl.pause();
                                        _btn.isPlaying = false;
                                        _btn.audioEl.currentTime = 0;
                                    }
                                });
                            }
                            if (!btn.isPlaying) {
                                btn.isPlaying = true;
                                this.isPlaying = true;
                                this.currentlyPlayingButton = btn;
                                btn.audioEl.volume = Number(this.volumeControlInput.value);
                                setTimeout(async () => {
                                    this.volumeControlInput.oninput = (e) => {
                                        this.handleVolumeChange(e, btn.audioEl);
                                    };
                                }, 1);
                                await btn.audioEl.play();
                            } else {
                                btn.audioEl.pause();
                                // restart the track to the beginning
                                btn.audioEl.currentTime = 0;
                                setTimeout(async () => {
                                    await btn.audioEl.play();
                                }, 1);
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
        this.stopButtonEl.classList.add("board-button");
        this.stopButtonEl.innerText = "Stop All Sound 🛑";

        this.addButtonEl.classList.add("board-button");
        this.addButtonEl.innerText = "Add A New Button +";
        this.addButtonEl.addEventListener("click", this.addNewButtonToBoard);
        this.soundboardContainer.classList.add("soundboard-container");

        Storage.getStorageButtons().then((strgeBtns) => {
            const btns = strgeBtns.map((props) => new Button(props));

            btns.forEach((btn) => {
                btn.el.addEventListener("click", (_e) => {
                    this.boardButtonClickHandler(this.keyControl, btn);
                });
                this.allButtons[btn.el.id] = btn;
                this.soundboardContainer.appendChild(btn.el);
            });

            this.stopButtonEl.onclick = () => {
                btns.forEach((b) => {
                    b.audioEl.currentTime = 0;
                    b.audioEl.pause();
                    b.isPlaying = false;
                    this.isPlaying = false;
                    this.currentlyPlayingButton = null;
                });
            };
        });
    }

    public run(): void {
        console.log("hello world");
    }
}

new Main().run();
