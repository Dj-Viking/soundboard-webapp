import { MIDIInputName, MIDIController } from "./MIDIController.js";

export class MIDIDeviceDisplay {
    public readonly deviceNameSpan = document.createElement("span");
    public readonly container = document.createElement("div");
    public constructor(inputName?: MIDIInputName) {
        this.container.style.display = "flex";
        this.container.style.flexDirection = "column";
        this.container.style.justifyContent = "center";
        this.container.style.height = "200px";
        this.container.style.width = "auto";
        this.container.style.borderRadius = "10px";
        this.container.style.marginBottom = "10px";
        this.container.style.border = "solid green 3px";
        this.deviceNameSpan.style.margin = "0 auto";
        this.deviceNameSpan.textContent =
            MIDIController.stripNativeLabelFromMIDIInputName(inputName as MIDIInputName) || null;
        this.container.append(this.deviceNameSpan);
    }

    public updateInput(inputName: MIDIInputName) {
        this.deviceNameSpan.textContent = MIDIController.stripNativeLabelFromMIDIInputName(inputName);
    }
}
