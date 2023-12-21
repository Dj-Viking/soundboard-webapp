import { Styles } from "./styles.js";
class Main {
    public body: HTMLElement;
    public soundboardContainer: HTMLDivElement;
    constructor() {
        this.body = document.body;
        this.soundboardContainer = document.createElement("div");
        this.init();
    }

    public init(): void {
        document.head.appendChild(new Styles().tag);
    }

    public run(): void {
        console.log("hello world");
    }
}

new Main().run();
