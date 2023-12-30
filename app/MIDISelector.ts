import { MIDIController, MIDIInputName } from "./MIDIController.js";
import { getRandomId } from "./utils.js";

export class MIDISelector {
    public constructor(public readonly selectEl: HTMLSelectElement = document.createElement("select")) {
        this.init();
    }

    private init() {
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select a MIDI Device";
        defaultOption.selected = true;
        defaultOption.disabled = true;
        defaultOption.style.margin = "0 auto";
        this.selectEl.append(defaultOption);
    }

    public appendMIDIDeviceNames(inputs: MIDIController["inputs"]) {
        for (const input of inputs) {
            const option = document.createElement("option");
            option.textContent = MIDIController.stripNativeLabelFromMIDIInputName(input.name);
            option.value = input.name;
            option.id = getRandomId();
            this.selectEl.appendChild(option);
        }
    }

    public selectDevice(inputName: MIDIInputName): void {
        this.selectEl.value = inputName;
    }
}
