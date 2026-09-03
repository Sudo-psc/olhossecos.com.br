import type { DisplayMode } from "../types.ts";

export type PageChangeListener = (page: number) => void;

export interface PageTurnAdapter {
  mount(element: HTMLElement): void;
  goToPage(page: number): void;
  next(): void;
  previous(): void;
  setDisplayMode(mode: DisplayMode): void;
  getCurrentPage(): number;
  onPageChange(listener: PageChangeListener): () => void;
  destroy(): void;
  fitToAvailable?(pageWidth: number, pageHeight: number): void;
}
