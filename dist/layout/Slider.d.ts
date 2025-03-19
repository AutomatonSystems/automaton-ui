type ElementCallback = (element: HTMLElement) => void;
type SliderOptions = {
    minElementWidth: number;
    elementMargin: number;
    visibleElementCallback: ElementCallback;
};
export declare class Slider extends HTMLElement {
    #private;
    sliderContainer: HTMLElement;
    backButton: HTMLElement;
    forwardButton: HTMLElement;
    itemsPerPage: number;
    itemWidth: number;
    constructor();
    slideForward(): void;
    slideBack(): void;
    get index(): number;
    set index(i: number);
    get options(): SliderOptions;
    set options(options: SliderOptions);
    redraw(): void;
    get length(): number;
    scrollToIndex(smooth: boolean): void;
}
export {};
