import { PageFlip } from "page-flip";
import { A4_PAGE_HEIGHT, A4_PAGE_WIDTH, fitA4Page } from "../fit-page.ts";
import type { DisplayMode } from "../types.ts";
import type { PageChangeListener, PageTurnAdapter } from "./PageTurnAdapter.ts";

export class StPageFlipAdapter implements PageTurnAdapter {
  private engine: PageFlip | null = null;
  private element: HTMLElement | null = null;
  private listeners = new Set<PageChangeListener>();
  private currentPage = 1;
  private startPage: number;
  private mounted = false;
  private requestedPage: number | null = null;
  private acceptEngineEvents = false;
  private requestedPageTimer: number | null = null;
  private displayMode: DisplayMode = "single";
  private fittedWidth = A4_PAGE_WIDTH;
  private fittedHeight = A4_PAGE_HEIGHT;

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

    const fitted = this.measureFit(element);
    this.fittedWidth = fitted.width;
    this.fittedHeight = fitted.height;
    engineHost.style.width =
      this.displayMode === "double"
        ? `${fitted.width * 2}px`
        : `${fitted.width}px`;
    engineHost.style.height = `${fitted.height}px`;

    this.currentPage = this.startPage;
    this.engine = new PageFlip(engineHost, {
      width: fitted.width,
      height: fitted.height,
      size: "fixed",
      minWidth: fitted.width,
      maxWidth: fitted.width,
      minHeight: fitted.height,
      maxHeight: fitted.height,
      autoSize: false,
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
    this.displayMode = mode;
    this.element?.setAttribute("data-display-mode", mode);
  }

  fitToAvailable(pageWidth: number, pageHeight: number): void {
    const width = Math.max(1, Math.round(pageWidth));
    const height = Math.max(1, Math.round(pageHeight));
    if (
      this.fittedWidth === width &&
      this.fittedHeight === height &&
      this.mounted
    ) {
      this.engine?.update();
      return;
    }
    if (!this.element) {
      this.fittedWidth = width;
      this.fittedHeight = height;
      return;
    }
    const currentPage = this.getCurrentPage();
    const host = this.element;
    this.startPage = currentPage;
    this.fittedWidth = width;
    this.fittedHeight = height;
    this.mount(host);
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
    if (this.element) {
      const pages = Array.from(
        this.element.querySelectorAll<HTMLElement>("[data-reader-page]"),
      );
      pages.forEach((page) => this.element?.append(page));
    }
    this.engine?.destroy();
    this.element?.querySelector(".reader-page-engine")?.remove();
    this.engine = null;
    this.mounted = false;
    this.requestedPage = null;
    this.acceptEngineEvents = false;
    this.requestedPageTimer = null;
    this.element = null;
  }

  private measureFit(element: HTMLElement): { width: number; height: number } {
    const stage =
      element.closest<HTMLElement>(".reader-stage") ?? element.parentElement;
    const bounds = stage?.getBoundingClientRect();
    const availableWidth = Math.max(1, bounds?.width ?? A4_PAGE_WIDTH);
    const availableHeight = Math.max(1, bounds?.height ?? A4_PAGE_HEIGHT);
    const pagesInView = this.displayMode === "double" ? 2 : 1;
    const fitted = fitA4Page(availableWidth, availableHeight, pagesInView);
    return {
      width: Math.max(1, Math.round(fitted.width)),
      height: Math.max(1, Math.round(fitted.height)),
    };
  }

  private clearRequestedPage(): void {
    if (this.requestedPageTimer !== null)
      window.clearTimeout(this.requestedPageTimer);
    this.requestedPage = null;
    this.requestedPageTimer = null;
  }
}
