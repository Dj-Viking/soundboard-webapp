export class Styles {
    public tag: HTMLStyleElement;
    public readonly SOUNDBOARD_DIM = 500;
    public readonly BUTTON_DIM = 50;
    public readonly ADD_BUTTON_DIM = 30;

    public constructor() {
        this.tag = document.createElement("style");
        this.tag.innerHTML = `
            html {
                background-color: grey;
            }

            .soundboard-container {
                display: flex;
                flex-wrap: wrap;
                height: ${this.SOUNDBOARD_DIM}px;
                width: ${this.SOUNDBOARD_DIM}px;
                background-color: white;
                border-radius: 10px;
            }

            .add-button {
                color: white;
                height: ${this.ADD_BUTTON_DIM}px;
                width: auto;
                background-color: blue;
                margin-bottom: 20px;
                border-radius: 10px;
            }

            .soundboard-button {
                height: ${this.BUTTON_DIM}px;
                width: ${this.BUTTON_DIM}px;
            }
        `;
    }
}
