import { PageFlip } from "page-flip";
import type { DisplayMode } from "../types.ts";
import type { PageChangeListener, PageTurnAdapter } from "./PageTurnAdapter.ts";

export class StPageFlipAdapter implements PageTurnAdapter {
  private engine: PageFlip | null = null;
  private element: HTMLElement | null = null;
  private listeners = new Set<PageChangeListener>();
  private currentPage = 1;
  private readonly startPage: number;
  private mounted = false;
  private requestedPage: number | null = null;
  private acceptEngineEvents = false;
  private requestedPageTimer: number | null = null;

  constructor(startPage = 1) {
    this.startPage = startPage;
  }

  mount(element: HTMLElement): void {
    this.destroy();
    this.element = element;
    const pageElements = Array.from(
      element.querySelectorAll<HTMLElement>("[data-reader-page]"),
    );
    if (pageElements.length === 0)
      throw new Error("Nenhuma página disponível para o flipbook.");

    const engineHost = document.createElement("div");
    engineHost.className = "reader-page-engine";
    element.append(engineHost);

    this.currentPage = this.startPage;
    this.engine = new PageFlip(engineHost, {
      width: 700,
      height: 990,
      size: "stretch",
      minWidth: 260,
      maxWidth: 700,
      minHeight: 368,
      maxHeight: 990,
      autoSize: true,
      drawShadow: true,
      maxShadowOpacity: 0.34,
      flippingTime: 720,
      usePortrait: true,
      showCover: true,
      mobileScrollSupport: true,
      swipeDistance: 38,
      clickEventForward: true,
      showPageCorners: true,
      disableFlipByClick: false,
      startPage: this.startPage - 1,
    });
    this.engine.on("flip", (event) => {
      if (
        !this.mounted ||
        (!this.acceptEngineEvents && this.requestedPage === null)
      )
        return;
      this.currentPage = this.requestedPage ?? event.data + 1;
      this.listeners.forEach((listener) => listener(this.currentPage));
    });
    this.engine.on("changeState", (event) => {
      if (event.data === "user_fold" || event.data === "flipping") {
        this.acceptEngineEvents = true;
      }
    });
    this.engine.loadFromHTML(pageElements);
    this.mounted = true;
  }

  goToPage(page: number): void {
    this.acceptEngineEvents = true;
    this.requestedPage = page;
    if (this.requestedPageTimer !== null)
      window.clearTimeout(this.requestedPageTimer);
    this.requestedPageTimer = window.setTimeout(() => {
      this.requestedPage = null;
      this.requestedPageTimer = null;
    }, 180);
    this.engine?.turnToPage(page - 1);
  }

  next(): void {
    this.acceptEngineEvents = true;
    this.clearRequestedPage();
    this.engine?.flipNext();
  }

  previous(): void {
    this.acceptEngineEvents = true;
    this.clearRequestedPage();
    this.engine?.flipPrev();
  }

  setDisplayMode(mode: DisplayMode): void {
    this.element?.setAttribute("data-display-mode", mode);
    this.engine?.update();
  }

  getCurrentPage(): number {
    return this.engine
      ? this.engine.getCurrentPageIndex() + 1
      : this.currentPage;
  }

  onPageChange(listener: PageChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  destroy(): void {
    if (this.requestedPageTimer !== null)
      window.clearTimeout(this.requestedPageTimer);
    this.engine?.destroy();
    this.engine = null;
    this.mounted = false;
    this.requestedPage = null;
    this.acceptEngineEvents = false;
    this.requestedPageTimer = null;
    this.element = null;
  }

  private clearRequestedPage(): void {
    if (this.requestedPageTimer !== null)
      window.clearTimeout(this.requestedPageTimer);
    this.requestedPage = null;
    this.requestedPageTimer = null;
  }
}
