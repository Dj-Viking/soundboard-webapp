import { calcPositionFromRange } from "./utils.js";

abstract class MySVG {
    public readonly el: SVGElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    public handleShow(isUsing: boolean) {
        if (isUsing) {
            this.el.style.display = "block";
        } else {
            this.el.style.display = "none";
        }
    }
    // to be overriden
    public moveSvgFromMessage(_intensity: number): void {}
}

export class Fader extends MySVG {
    public constructor(
        private readonly gRect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect"),
        private readonly gRect2 = document.createElementNS("http://www.w3.org/2000/svg", "rect"),
        private readonly gRect3 = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    ) {
        super();
        // <svg width="28" height="106" viewBox="0 0 28 106" fill="none" xmlns="http://www.w3.org/2000/svg">
        this.el.setAttribute("width", "28");
        this.el.setAttribute("height", "106");
        this.el.setAttribute("viewBox", "0 0 28 106");
        this.el.setAttribute("fill", "none");
        this.el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        this.el.style.display = "none";

        //  <rect x="11.5" y="0.5" width="5" height="105" stroke="white"/>
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", "11.5");
        rect.setAttribute("y", "0.5");
        rect.setAttribute("width", "5");
        rect.setAttribute("height", "105");
        rect.setAttribute("stroke", "white");
        this.el.appendChild(rect);

        // defs
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        this.el.appendChild(defs);

        // defs > filter  <filter id="filter0_d_101_2" x="0" y="0" width="28" height="500" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        filter.setAttribute("id", "filter0_d_101_2");
        filter.setAttribute("x", "0");
        filter.setAttribute("y", "0");
        filter.setAttribute("width", "28");
        filter.setAttribute("height", "500");
        filter.setAttribute("filterUnits", "userSpaceOnUse");
        filter.setAttribute("color-interpolation-filters", "sRGB");
        defs.appendChild(filter);

        const feFlood = document.createElementNS("http://www.w3.org/2000/svg", "feFlood");
        feFlood.setAttribute("flood-opacity", "0");
        feFlood.setAttribute("result", "BackgroundImageFix");
        filter.appendChild(feFlood);

        const feColorMatrix1 = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
        feColorMatrix1.setAttribute("in", "SourceAlpha");
        feColorMatrix1.setAttribute("type", "matrix");
        feColorMatrix1.setAttribute("values", "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0");
        feColorMatrix1.setAttribute("result", "hardAlpha");
        filter.appendChild(feColorMatrix1);

        const feOffset = document.createElementNS("http://www.w3.org/2000/svg", "feOffset");
        feOffset.setAttribute("dy", "4");
        filter.appendChild(feOffset);

        const feGaussianBlur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
        feGaussianBlur.setAttribute("stdDeviation", "2");
        filter.appendChild(feGaussianBlur);

        const feColorMatrix2 = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
        feColorMatrix2.setAttribute("type", "matrix");
        feColorMatrix2.setAttribute("values", "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0");
        filter.appendChild(feColorMatrix2);

        const feBlend1 = document.createElementNS("http://www.w3.org/2000/svg", "feBlend");
        feBlend1.setAttribute("mode", "normal");
        feBlend1.setAttribute("in2", "BackgroundImageFix");
        feBlend1.setAttribute("result", "effect1_dropShadow_101_2");
        filter.appendChild(feBlend1);

        const feBlend2 = document.createElementNS("http://www.w3.org/2000/svg", "feBlend");
        feBlend2.setAttribute("mode", "normal");
        feBlend2.setAttribute("in", "SourceGraphic");
        feBlend2.setAttribute("in2", "effect1_dropShadow_101_2");
        feBlend2.setAttribute("result", "shape");
        filter.appendChild(feBlend2);

        // g both fader background and border and middle rect of fader
        // <g filter="url(#filter0_d_101_2)">
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("filter", "url(#filter0_d_101_2)");

        this.gRect1.setAttribute("x", "4");
        // Y will be modified by the midi controller  - initialize 0 for now i guess
        this.gRect1.setAttribute("y", "0");
        this.gRect1.setAttribute("width", "20");
        this.gRect1.setAttribute("height", "37");
        this.gRect1.setAttribute("rx", "5");
        this.gRect1.setAttribute("fill", "black");

        this.gRect2.setAttribute("x", "5");
        this.gRect2.setAttribute("y", "0");
        this.gRect2.setAttribute("width", "18");
        this.gRect2.setAttribute("height", "35");
        this.gRect2.setAttribute("rx", "4");
        this.gRect2.setAttribute("stroke", "white");
        this.gRect2.setAttribute("stroke-width", "2");

        this.gRect3.setAttribute("x", "6");
        this.gRect3.setAttribute("y", "0");
        this.gRect3.setAttribute("width", "16");
        this.gRect3.setAttribute("height", "2");
        this.gRect3.setAttribute("fill", "white");
        this.gRect3.setAttribute("transform", "translate(0, 16)");
        g.append(this.gRect1, this.gRect2, this.gRect3);

        this.el.appendChild(g);
    }

    public override moveSvgFromMessage(intensity: number): void {
        this.gRect1.setAttribute("y", `${calcPositionFromRange(intensity, 70, 1, 0, 127)}`);
        this.gRect2.setAttribute("y", `${calcPositionFromRange(intensity, 70, 1, 0, 127)}`);
        this.gRect3.setAttribute("y", `${calcPositionFromRange(intensity, 70, 1, 0, 127)}`);
    }
}
export class Knob extends MySVG {
    public constructor(public readonly el: SVGElement = document.createElementNS("http://www.w3.org/2000/svg", "svg")) {
        super();
        // <svg width="91" height="106" viewBox="0 0 91 136" fill="none" xmlns="http://www.w3.org/2000/svg">
        el.setAttribute("width", "91");
        el.setAttribute("height", "106");
        el.setAttribute("viewBox", "0 0 91 106");
        el.setAttribute("fill", "none");
        el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        el.style.display = "none";
    }
}
