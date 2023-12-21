export class Styles {
    public tag: HTMLStyleElement;

    constructor() {
        this.tag = document.createElement("style");
        this.tag.innerHTML = `
            html {
                background-color: grey;
            }
        `;
    }
}
