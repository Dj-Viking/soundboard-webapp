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
    public constructor(
        private readonly circle = document.createElementNS("http://www.w3.org/2000/svg", "circle"),
        private readonly rect1 = document.createElementNS("http://www.w3.org/2000/svg", "rect"),
        private readonly rect2 = document.createElementNS("http://www.w3.org/2000/svg", "rect"),
        private readonly rect3 = document.createElementNS("http://www.w3.org/2000/svg", "rect"),
        private readonly path1 = document.createElementNS("http://www.w3.org/2000/svg", "path"),
        private readonly path2 = document.createElementNS("http://www.w3.org/2000/svg", "path")
    ) {
        super();
        // <svg width="91" height="106" viewBox="0 0 91 136" fill="none" xmlns="http://www.w3.org/2000/svg">
        this.el.setAttribute("width", "91");
        this.el.setAttribute("height", "106");
        this.el.setAttribute("viewBox", "0 0 91 106");
        this.el.setAttribute("fill", "none");
        this.el.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        this.el.style.display = "none";

        this.circle.setAttribute("cx", "45.5");
        this.circle.setAttribute("cy", "61.5");
        this.circle.setAttribute("r", "32.5");
        this.circle.setAttribute("fill", "white");
        this.el.appendChild(circle);

        this.rect1.setAttribute("x", "45");
        this.rect1.setAttribute("y", "29");
        this.rect1.setAttribute("width", "4");
        this.rect1.setAttribute("height", "21");
        this.rect1.setAttribute("transform", `${this.translateKnobRect(0)}`);
        this.rect1.setAttribute("fill", `black`);
        this.el.appendChild(rect1);

        this.rect2.setAttribute("x", "44");
        this.rect2.setAttribute("width", "4");
        this.rect2.setAttribute("height", "16");
        this.rect2.setAttribute("fill", "white");
        this.el.appendChild(rect2);

        this.rect3.setAttribute("x", "3.75283");
        this.rect3.setAttribute("y", "108.214");
        this.rect3.setAttribute("width", "4");
        this.rect3.setAttribute("height", "16");
        this.rect3.setAttribute("transform", "rotate(-134.99 3.75283 108.214)");
        this.rect3.setAttribute("fill", "white");
        this.el.appendChild(this.rect3);

        this.path1.setAttribute(
            "d",
            "M90.5 62C90.5 87.6967 70.3377 108.5 45.5 108.5C20.6623 108.5 0.5 87.6967 0.5 62C0.5 36.3033 20.6623 15.5 45.5 15.5C70.3377 15.5 90.5 36.3033 90.5 62Z"
        );
        this.path1.setAttribute("stroke", "white");
        this.el.appendChild(this.path1);

        this.path2.setAttribute("d", "M72 95H23.5H17.5L3.5 110L16 135H74L86.5 111.5L81.5 105.5L72 95Z");
        this.path2.setAttribute("fill", "black");
        this.path2.setAttribute("stroke", "black");
        this.el.appendChild(this.path2);
    }

    private translateKnobRect(intensity: number): string {
        const rotationPercentage = calcPositionFromRange(intensity, 0, 100, 0, 127);

        const angle = calcPositionFromRange(rotationPercentage, -140, 137, 0, 100);

        const vec2 = { x: 45, y: 62 };

        return `rotate(${angle}, ${vec2.x}, ${vec2.y})`;
    }

    public override moveSvgFromMessage(intensity: number): void {
        this.rect1.setAttribute("transform", `${this.translateKnobRect(intensity)}`);
    }
}
