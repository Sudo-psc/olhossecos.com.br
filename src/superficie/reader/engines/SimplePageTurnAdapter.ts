import type { DisplayMode } from "../types.ts";
import type { PageChangeListener, PageTurnAdapter } from "./PageTurnAdapter.ts";

export class SimplePageTurnAdapter implements PageTurnAdapter {
  private element: HTMLElement | null = null;
  private pages: HTMLElement[] = [];
  private currentPage: number;
  private displayMode: DisplayMode = "single";
  private listeners = new Set<PageChangeListener>();

  constructor(startPage = 1) {
    this.currentPage = startPage;
  }

  mount(element: HTMLElement): void {
    this.element = element;
    element.setAttribute("data-display-mode", this.displayMode);
    this.pages = Array.from(
      element.querySelectorAll<HTMLElement>("[data-reader-page]"),
    );
    this.render();
  }

  goToPage(page: number): void {
    const nextPage = Math.max(1, Math.min(this.pages.length, Math.round(page)));
    if (nextPage === this.currentPage) return;
    this.currentPage = nextPage;
    this.render();
    this.listeners.forEach((listener) => listener(this.currentPage));
  }

  next(): void {
    this.goToPage(
      this.currentPage +
        (this.displayMode === "double" && this.currentPage > 1 ? 2 : 1),
    );
  }

  previous(): void {
    this.goToPage(
      this.currentPage -
        (this.displayMode === "double" && this.currentPage > 2 ? 2 : 1),
    );
  }

  setDisplayMode(mode: DisplayMode): void {
    this.displayMode = mode;
    this.element?.setAttribute("data-display-mode", mode);
    this.render();
  }

  getCurrentPage(): number {
    return this.currentPage;
  }

  onPageChange(listener: PageChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  destroy(): void {
    this.pages.forEach((page) => page.removeAttribute("data-simple-visible"));
    this.pages = [];
    this.element = null;
  }

  private render(): void {
    const visible = this.visiblePages();
    this.pages.forEach((page, index) => {
      const isVisible = visible.includes(index + 1);
      page.toggleAttribute("data-simple-visible", isVisible);
      page.hidden = !isVisible;
    });
  }

  private visiblePages(): number[] {
    if (
      this.displayMode === "single" ||
      this.currentPage === 1 ||
      this.currentPage === this.pages.length
    ) {
      return [this.currentPage];
    }
    const leftPage =
      this.currentPage % 2 === 0 ? this.currentPage : this.currentPage - 1;
    return [leftPage, leftPage + 1].filter((page) => page <= this.pages.length);
  }
}
