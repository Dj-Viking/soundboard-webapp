import { MIDIInputName, MIDIController, SUPPORTED_CONTROLLERS } from "./MIDIController.js";

export class MIDIDeviceDisplay {
    public readonly deviceNameSpan = document.createElement("span");
    public readonly channelSpan = document.createElement("span");
    public readonly controlNameSpan = document.createElement("span");
    public readonly faderUiControlAssignmentSpan = document.createElement("span");
    public readonly intensitySpan = document.createElement("span");
    public readonly intensityDiv = document.createElement("div");
    public readonly container = document.createElement("div");
    public readonly controlDisplayContainer = document.createElement("div");
    public constructor(inputName?: MIDIInputName) {
        this.container.classList.add("control-device-display-container");

        this.controlDisplayContainer.style.display = "block";

        this.channelSpan.style.color = "white";
        this.channelSpan.style.margin = "0 auto";
        this.channelSpan.textContent = "";

        // appended into svg container
        this.controlNameSpan.style.color = "white";
        this.controlNameSpan.textContent = "";

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

        // uinames to be appended to their respective ui
        // elements
        this.faderUiControlAssignmentSpan.textContent = "()";
        this.faderUiControlAssignmentSpan.style.visibility = "hidden";
        this.faderUiControlAssignmentSpan.style.color = "white";
    }

    public showAssignmentSpans(): void {
        this.faderUiControlAssignmentSpan.style.visibility = "visible";
    }

    public hideAssignmentSpans(): void {
        this.faderUiControlAssignmentSpan.style.visibility = "hidden";
    }

    public updateInput(inputName: MIDIInputName) {
        this.deviceNameSpan.textContent = MIDIController.stripNativeLabelFromMIDIInputName(inputName);
    }
}
