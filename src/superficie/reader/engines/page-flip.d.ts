declare module "page-flip" {
  interface PageFlipEvent<T> {
    data: T;
  }

  interface PageFlipSettings {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    swipeDistance?: number;
    clickEventForward?: boolean;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
    startPage?: number;
  }

  export class PageFlip {
    constructor(element: HTMLElement, settings: PageFlipSettings);
    loadFromHTML(elements: HTMLElement[]): void;
    on(event: "flip", listener: (event: PageFlipEvent<number>) => void): void;
    on(
      event: "changeState",
      listener: (event: PageFlipEvent<string>) => void,
    ): void;
    turnToPage(page: number): void;
    flipNext(): void;
    flipPrev(): void;
    getCurrentPageIndex(): number;
    update(): void;
    destroy(): void;
  }
}
