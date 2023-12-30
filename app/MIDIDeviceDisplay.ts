import { MIDIInputName, MIDIController, SUPPORTED_CONTROLLERS } from "./MIDIController.js";

export class MIDIDeviceDisplay {
    public readonly deviceNameSpan = document.createElement("span");
    public readonly channelSpan = document.createElement("span");
    public readonly uiNameSpan = document.createElement("span");
    public readonly intensitySpan = document.createElement("span");
    public readonly intensityDiv = document.createElement("div");
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

        this.controlDisplayContainer.style.display = "block";

        this.channelSpan.style.color = "white";
        this.channelSpan.style.margin = "0 auto";
        this.channelSpan.textContent = "";

        // appended into svg container
        this.uiNameSpan.style.color = "white";
        this.uiNameSpan.textContent = "";

        // appended to svg container
        this.intensitySpan.style.color = "white";
        this.intensitySpan.textContent = "";
        this.intensityDiv.style.display = "flex";
        this.intensityDiv.style.justifyContent = "center";
        this.intensityDiv.appendChild(this.intensitySpan);

        this.deviceNameSpan.style.margin = "0 auto";
        this.deviceNameSpan.style.color = "white";
        this.deviceNameSpan.textContent =
            MIDIController.stripNativeLabelFromMIDIInputName(inputName as MIDIInputName) || null;

        this.container.append(this.deviceNameSpan, this.channelSpan, this.controlDisplayContainer);
    }

    public updateInput(inputName: MIDIInputName) {
        this.deviceNameSpan.textContent = MIDIController.stripNativeLabelFromMIDIInputName(inputName);
    }
}
