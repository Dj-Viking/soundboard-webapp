import { Styles } from "./styles.js";
import { Button } from "./Button.js";
import { Storage } from "./Storage.js";
import {
    ControllerControlNamesLookup,
    MIDIController,
    MIDIInputName,
    MIDIMessageEvent,
    SUPPORTED_CONTROLLERS,
    UIInterfaceDeviceName,
    XONEK2_MIDI_CHANNEL_TABLE,
    getControllerTableFromName,
} from "./MIDIController.js";
import { MIDISelector } from "./MIDISelector.js";
import { MIDIDeviceDisplay } from "./MIDIDeviceDisplay.js";
import { CallbackMapping, MIDIMappingPreference } from "./MIDIMapping.js";
import { Fader, Knob } from "./Svgs.js";
// import { MIDIMappingIDB } from "./MIDIMappingIDB.js";
// import { ButtonIDB } from "./ButtonIDB.js";
import { IDB } from "./IDB.js";

export const idb = new IDB("soundboard", Storage.getIDBVersionFromLocalStorage() || 1);

export type KeyControl = Record<KeyboardKey, boolean>;
class Main {
    private keyControl: KeyControl = {
        m: false,
        M: false,
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
    private isMIDIEdit: boolean = false;
    private MidiMappingPreference: MIDIMappingPreference<MIDIInputName> = new MIDIMappingPreference("Not Found");

    public constructor(
        private readonly body: HTMLElement = document.body,
        private readonly fader = new Fader(),
        private readonly knob = new Knob(),
        private readonly midiSelector = new MIDISelector(),
        private readonly midiDeviceDisplay = new MIDIDeviceDisplay(),
        private readonly toggleMIDIEditModeButton: HTMLButtonElement = document.createElement("button"),
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
            this.midiDeviceDisplay.controlNameSpan.textContent = controlName;
            this.midiDeviceDisplay.intensitySpan.textContent = "Intensity: " + intensity.toString();
            // move displayed svg rects

            if (this.isListeningForMIDIMappingEdits) {
                this.MidiMappingPreference = new MIDIMappingPreference<typeof strippedName>(strippedName);
                // TODO: validate that the object store is already in IDB somehow
                // ALSO validate somehow how many keys there are and keep track of that so we don't keep incrementing the version
                // when we don't need to!!!!!!
                idb.addObjectStore(strippedName, Storage);

                // TODO: will have to handle not being able to store the functions in IDB because they are not cloneable

                this.midiController.allMIDIMappingPreferences[strippedName] = this.MidiMappingPreference;

                const cbmap = this.MidiMappingPreference.callbackMap;
                this.MidiMappingPreference.callbackMap = {} as any;
                idb.put(JSON.parse(JSON.stringify(this.MidiMappingPreference)), strippedName);
                this.MidiMappingPreference.callbackMap = cbmap;

                this.MidiMappingPreference.mapping[controlName] = {
                    channel,
                    uiName: this.mappingEditOptions.uiName,
                };

                console.log("midi mapping preference currently", this.MidiMappingPreference, "\n", this.midiController);
                this.isListeningForMIDIMappingEdits = false;
            }

            this.handleMIDIMessage(strippedName, e);
        };

        this.midiController.setInputCbs(midicb, () => {});
    };

    // TODO: this works - just need to store the mapping in storage somewhere
    private handleMIDIMessage(name: MIDIInputName, midiMessageEvent: MIDIMessageEvent) {
        this.invokeCallbackOrWarn(name, midiMessageEvent);
    }

    private warnCallbackIfError<P extends keyof CallbackMapping>(
        callback: CallbackMapping[P],
        mapping: MIDIMappingPreference<typeof name>["mapping"],
        channel: number,
        name: MIDIInputName
    ): boolean {
        if (typeof callback !== "function") {
            console.warn(
                "callback was not a function, cannot proceed to call the callback",
                "\ncallback was => ",
                callback,
                "\n mapping was => ",
                mapping,
                "\n control name was => ",
                getControllerTableFromName(name)[channel],
                "\n input name was => ",
                name
            );
            console.warn("did you assign a ui control to that midi control?");
            return false;
        }
        return true;
    }

    private invokeCallbackOrWarn = (name: MIDIInputName, midiMessageEvent: MIDIMessageEvent): void => {
        const channel = midiMessageEvent.data[1];
        const intensity = midiMessageEvent.data[2];

        switch (name) {
            case "XONE:K2 MIDI":
                {
                    const callbackMap = this.MidiMappingPreference.callbackMap;
                    const mapping = this.MidiMappingPreference.mapping;
                    const callback = callbackMap[mapping[XONEK2_MIDI_CHANNEL_TABLE[channel]].uiName];

                    if (this.warnCallbackIfError(callback, mapping, channel, name)) {
                        callback(intensity);
                    }
                }
                break;
            default: {
                console.warn("unhandled midi controller mapping", name);
            }
        }
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
            m: false,
            M: false,
            Alt: false,
            f: false,
            Control: false,
            Shift: false,
        };
        this.ctrlKeyMessageSpan.style.visibility = "hidden";
        this.fKeyMessageSpan.style.visibility = "hidden";
    };

    private handleKeyDown = (event: MyKeyboardEvent) => {
        this.keyControl = {
            ...this.keyControl,
            [event.key]: true,
        };
        switch (true) {
            case event.key === "m" || event.key === "M":
                {
                    this.handleMIDIEditModeButtonClick();
                }
                break;
            case event.key === "f":
                {
                    this.fKeyMessageSpan.style.visibility = "visible";
                }
                break;
            case event.key === "Control":
                {
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

    private handleMIDIEditModeButtonClick = (): void => {
        this.isMIDIEdit = !this.isMIDIEdit;
        if (this.isMIDIEdit) {
            this.midiDeviceDisplay.showAssignmentSpans();
            this.toggleMIDIEditModeButton.textContent = "MIDI Mapping Edit Mode ON";
            this.toggleMIDIEditModeButton.style.backgroundColor = "green";
        } else {
            this.midiDeviceDisplay.hideAssignmentSpans();
            this.toggleMIDIEditModeButton.textContent = "MIDI Mapping Edit Mode OFF";
            this.toggleMIDIEditModeButton.style.backgroundColor = "grey";
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
        this.volumeControlInput.onclick = () => {
            if (this.isMIDIEdit) {
                this.isListeningForMIDIMappingEdits = true;
                console.log("listening for edits on volume input");
                this.mappingEditOptions = {
                    uiName: "volume_fader",
                };
            }
        };

        this.volumeControlInput.style.width = "30%";
        this.volumeInputText.textContent = `${this.volumeControlInput.value}`;
        this.volumeInputText.style.fontSize = "20px";
        this.volumeInputText.style.color = "white";

        this.header.innerText = "have fun with the soundboard!";
        this.header.classList.add("header");

        this.toggleMIDIEditModeButton.textContent = "MIDI Mapping Edit Mode OFF";
        const toggleMIDIEditButtonContainer = document.createElement("div");
        toggleMIDIEditButtonContainer.style.display = "flex";
        toggleMIDIEditButtonContainer.style.justifyContent = "center";
        toggleMIDIEditButtonContainer.style.alignItems = "center";
        toggleMIDIEditButtonContainer.style.marginBottom = "10px";
        this.toggleMIDIEditModeButton.style.backgroundColor = "grey";
        this.toggleMIDIEditModeButton.style.color = "white";
        this.toggleMIDIEditModeButton.style.borderRadius = "5px";
        this.toggleMIDIEditModeButton.onclick = this.handleMIDIEditModeButtonClick;
        toggleMIDIEditButtonContainer.append(this.toggleMIDIEditModeButton);

        this.body.append(this.header, toggleMIDIEditButtonContainer);

        const volumeLabel = document.createElement("p");
        volumeLabel.textContent = "Volume";
        volumeLabel.style.color = "white";
        volumeLabel.style.marginTop = "5px";
        volumeLabel.style.marginBottom = "5px";

        const volumeContainer = document.createElement("div");
        volumeContainer.classList.add("volume-container");
        volumeContainer.append(
            volumeLabel,
            this.midiDeviceDisplay.faderUiControlAssignmentSpan,
            this.volumeControlInput,
            this.volumeInputText
        );

        const midiSelectorContainer = document.createElement("div");
        midiSelectorContainer.classList.add("midi-selector-container");
        midiSelectorContainer.style.visibility = "visible";

        this.midiSelector.selectEl.classList.add("midi-selector");
        this.midiSelector.selectEl.onchange = (e: Event) => {
            this.midiDeviceDisplay.updateInput(e.target!.value);
        };

        const controlSVGContainer = document.createElement("div");
        controlSVGContainer.classList.add("control-svg-container");

        controlSVGContainer.append(this.fader.el, this.knob.el, this.midiDeviceDisplay.controlNameSpan);

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
            idb.put(btn.props, "buttons");
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
                        const toDelete = btns.find((sb) => sb.id === btn.el.id);
                        idb.delete(toDelete, "buttons");
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
