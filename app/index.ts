import { Styles } from "./styles.js";
import { Button } from "./Button.js";
import { btnIDB } from "./IDB.js";
import { Storage } from "./Storage.js";
import {
    ControllerControlNamesLookup,
    MIDIController,
    MIDIInputName,
    MIDIMessageEvent,
    SUPPORTED_CONTROLLERS,
    UIInterfaceDeviceName,
} from "./MIDIController.js";
import { MIDISelector } from "./MIDISelector.js";
import { MIDIDeviceDisplay } from "./MIDIDeviceDisplay.js";
import { CallbackMapping, MIDIMapping, MIDIMappingPreference } from "./MIDIMapping.js";
import { Fader, Knob } from "./Svgs.js";

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
    private midiController: MIDIController = {} as any;
    private isListeningForMIDIMappingEdits: boolean = false;
    private mappingEditOptions = {
        uiName: "" as any as UIInterfaceDeviceName,
    };
    private usingFader: boolean = false;
    private usingKnob: boolean = false;
    private midiMappingInUse: {
        callbackMap: CallbackMapping;
        recentlyUsed: MIDIInputName;
        hasPreference: boolean;
        midiMappingPreference: Record<MIDIInputName, MIDIMapping<MIDIInputName>>;
    } = {} as any;

    public constructor(
        private readonly body: HTMLElement = document.body,
        private readonly fader = new Fader(),
        private readonly knob = new Knob(),
        private readonly midiSelector = new MIDISelector(),
        private readonly midiDeviceDisplay = new MIDIDeviceDisplay(),
        private readonly toggleUsingMIDIButton: HTMLButtonElement = document.createElement("button"),
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
        window.requestAnimationFrame(this.animate);
        this.initMIDI();
    }

    private initMIDI() {
        (async () => {
            const midiAccess = await MIDIController.requestMIDIAccess();
            console.log("got midi", midiAccess);
            if (midiAccess) {
                this.midiController = new MIDIController(midiAccess);
                console.log("got midi", this.midiController);

                if (this.midiController.inputs?.length) {
                    this.midiSelector.appendMIDIDeviceNames(this.midiController.inputs);
                    // define the callbacks for the inputs here
                    this.setupMIDIMessageCallback();
                }
            }
        })();
    }

    private handleSvgMovement(
        name: MIDIInputName,
        intensity: number,
        controlName: ControllerControlNamesLookup<typeof name>
    ): void {
        this.usingFader = /fader/g.test(controlName);
        this.usingKnob = /knob/g.test(controlName);

        this.fader.handleShow(this.usingFader);
        if (this.usingFader) {
            this.fader.moveSvgFromMessage(intensity);
        }
        this.knob.handleShow(this.usingKnob);
        if (this.usingKnob) {
            this.knob.moveSvgFromMessage(intensity);
        }
        this.midiController.recentlyUsed = name;
        this.midiSelector.selectDevice(name);
        this.midiDeviceDisplay.updateInput(name);
    }

    private setupMIDIMessageCallback = () => {
        const midicb = (e: MIDIMessageEvent) => {
            const channel = e.data[1];
            const intensity = e.data[2];
            const name = e.currentTarget.name;
            const strippedName = MIDIController.stripNativeLabelFromMIDIInputName(e.currentTarget.name);

            const controlName: ControllerControlNamesLookup<typeof strippedName> =
                SUPPORTED_CONTROLLERS[strippedName][channel];

            this.handleSvgMovement(name, intensity, controlName);
            this.midiDeviceDisplay.channelSpan.textContent = "Channel: " + channel.toString();
            this.midiDeviceDisplay.uiNameSpan.textContent = controlName;
            this.midiDeviceDisplay.intensitySpan.textContent = "Intensity: " + intensity.toString();
            // move displayed svg rects

            let midiMappingPreference: MIDIMappingPreference<typeof strippedName> = null as any;

            if (this.isListeningForMIDIMappingEdits) {
                console.error("listening for edits", "TODO");
                console.log("listening for mapping edits");
            }
        };

        this.midiController.setInputCbs(midicb, () => {});
    };

    private animate = (_rafTimestamp?: number): void => {
        if (this.isPlaying) {
            //update transport while playing
            this.refreshTrackProgress(this.currentlyPlayingButton!.audioEl);
        }

        window.requestAnimationFrame(this.animate);
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
        this.volumeInputText.style.color = "white";

        this.header.innerText = "have fun with the soundboard!";
        this.header.classList.add("header");

        this.body.appendChild(this.header);

        const volumeLabel = document.createElement("p");
        volumeLabel.textContent = "Volume";
        volumeLabel.style.color = "white";

        const volumeContainer = document.createElement("div");
        volumeContainer.classList.add("volume-container");
        volumeContainer.append(volumeLabel, this.volumeControlInput, this.volumeInputText);

        const midiSelectorContainer = document.createElement("div");
        midiSelectorContainer.classList.add("midi-selector-container");
        midiSelectorContainer.style.visibility = "visible";

        this.midiSelector.selectEl.classList.add("midi-selector");
        this.midiSelector.selectEl.onchange = (e: Event) => {
            this.midiDeviceDisplay.updateInput(e.target!.value);
        };

        const controlSVGContainer = document.createElement("div");
        controlSVGContainer.classList.add("control-svg-container");

        controlSVGContainer.append(this.fader.el, this.knob.el, this.midiDeviceDisplay.uiNameSpan);

        this.midiDeviceDisplay.controlDisplayContainer.append(controlSVGContainer, this.midiDeviceDisplay.intensityDiv);

        const toggleUsingMIDIButtonContainer = document.createElement("div");
        toggleUsingMIDIButtonContainer.style.width = "100%";

        //temp
        toggleUsingMIDIButtonContainer.style.display = "none";

        this.toggleUsingMIDIButton.textContent = "TURN ON MIDI";
        this.toggleUsingMIDIButton.style.backgroundColor = "green";
        this.toggleUsingMIDIButton.style.margin = "0 auto";

        toggleUsingMIDIButtonContainer.append(this.toggleUsingMIDIButton);

        midiSelectorContainer.append(this.midiSelector.selectEl);

        this.body.append(
            toggleUsingMIDIButtonContainer,
            this.midiDeviceDisplay.container,
            midiSelectorContainer,
            volumeContainer
        );

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
        this.trackTimeTextSpan.style.color = "white";

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
        console.log("hello woasdfasdfaspodifija;sldkfja;lsdkfj;lasdkjsrld");
    }
}

new Main().run();
