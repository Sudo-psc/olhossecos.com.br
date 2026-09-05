import type { DisplayMode, PageSize } from "./types.ts";

export const A4_PAGE_WIDTH = 700;
export const A4_PAGE_HEIGHT = 990;
export const A4_PAGE_RATIO = A4_PAGE_HEIGHT / A4_PAGE_WIDTH;

/**
 * Altura ÷ largura das placas da edição. As da Edição 00 são 1400 × 1867
 * (4:3), não A4: assumir A4 deixa faixas vazias em cima e embaixo.
 */
export function pageRatioFromSize(size: PageSize | null | undefined): number {
  if (
    !size ||
    !Number.isFinite(size.width) ||
    !Number.isFinite(size.height) ||
    size.width <= 0 ||
    size.height <= 0
  ) {
    return A4_PAGE_RATIO;
  }
  return size.height / size.width;
}

export interface FittedPageSize {
  width: number;
  height: number;
  pagesInView: 1 | 2;
}

export function pagesInViewForMode(mode: DisplayMode): 1 | 2 {
  return mode === "double" ? 2 : 1;
}

export function fitA4Page(
  availableWidth: number,
  availableHeight: number,
  pagesInView: 1 | 2 = 1,
  ratio: number = A4_PAGE_RATIO,
): FittedPageSize {
  const pageRatio = Number.isFinite(ratio) && ratio > 0 ? ratio : A4_PAGE_RATIO;
  const widthBudget = Math.max(1, availableWidth);
  const heightBudget = Math.max(1, availableHeight);
  const singleWidthBudget = widthBudget / pagesInView;
  const heightFromWidth = singleWidthBudget * pageRatio;
  if (heightFromWidth <= heightBudget) {
    return {
      width: singleWidthBudget,
      height: heightFromWidth,
      pagesInView,
    };
  }
  return {
    width: heightBudget / pageRatio,
    height: heightBudget,
    pagesInView,
  };
}

export function availableStageSize(stage: HTMLElement): {
  width: number;
  height: number;
} {
  const style = window.getComputedStyle(stage);
  return {
    width:
      stage.clientWidth -
      Number.parseFloat(style.paddingLeft) -
      Number.parseFloat(style.paddingRight),
    height:
      stage.clientHeight -
      Number.parseFloat(style.paddingTop) -
      Number.parseFloat(style.paddingBottom),
  };
}
