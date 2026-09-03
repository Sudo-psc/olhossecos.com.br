import type { DisplayMode } from "./types.ts";

export const A4_PAGE_WIDTH = 700;
export const A4_PAGE_HEIGHT = 990;
export const A4_PAGE_RATIO = A4_PAGE_HEIGHT / A4_PAGE_WIDTH;

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
): FittedPageSize {
  const widthBudget = Math.max(1, availableWidth);
  const heightBudget = Math.max(1, availableHeight);
  const singleWidthBudget = widthBudget / pagesInView;
  const heightFromWidth = singleWidthBudget * A4_PAGE_RATIO;
  if (heightFromWidth <= heightBudget) {
    return {
      width: singleWidthBudget,
      height: heightFromWidth,
      pagesInView,
    };
  }
  return {
    width: heightBudget / A4_PAGE_RATIO,
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
