import { MIDIInputName, MIDIController } from "./MIDIController.js";

export class MIDIDeviceDisplay {
    public readonly deviceNameSpan = document.createElement("span");
    public readonly container = document.createElement("div");
    public readonly controlDisplayContainer = document.createElement("div");
    public constructor(inputName?: MIDIInputName) {
        this.container.style.display = "flex";
        this.container.style.flexDirection = "column";
        this.container.style.justifyContent = "center";
        this.container.style.height = "auto";
        this.container.style.width = "auto";
        this.container.style.borderRadius = "10px";
        this.container.style.marginBottom = "10px";
        this.container.style.border = "solid green 3px";

        this.controlDisplayContainer.style.display = "flex";

        this.deviceNameSpan.style.margin = "0 auto";
        this.deviceNameSpan.style.color = "white";
        this.deviceNameSpan.textContent =
            MIDIController.stripNativeLabelFromMIDIInputName(inputName as MIDIInputName) || null;

        this.container.append(this.deviceNameSpan, this.controlDisplayContainer);
    }

    public updateInput(inputName: MIDIInputName) {
        this.deviceNameSpan.textContent = MIDIController.stripNativeLabelFromMIDIInputName(inputName);
    }
}
