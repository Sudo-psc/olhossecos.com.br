import type { TextQuoteAnchor } from "./types.ts";

export interface CapturedSelection {
  page: number;
  blockId: string;
  anchor: TextQuoteAnchor;
}

export function captureTextSelection(
  root: HTMLElement,
): CapturedSelection | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
    return null;
  const range = selection.getRangeAt(0);
  const startElement = parentElement(range.startContainer);
  const endElement = parentElement(range.endContainer);
  const startBlock = startElement?.closest<HTMLElement>("[data-text-block]");
  const endBlock = endElement?.closest<HTMLElement>("[data-text-block]");
  if (!startBlock || startBlock !== endBlock || !root.contains(startBlock))
    return null;
  const pageElement = startBlock.closest<HTMLElement>("[data-page-number]");
  const page = Number(pageElement?.dataset.pageNumber);
  const blockId = startBlock.dataset.textBlock;
  if (!Number.isInteger(page) || !blockId) return null;

  const selectedText = range.toString().trim();
  if (selectedText.length < 2 || selectedText.length > 800) return null;
  const fullText = startBlock.textContent ?? "";
  const prefixRange = document.createRange();
  prefixRange.selectNodeContents(startBlock);
  prefixRange.setEnd(range.startContainer, range.startOffset);
  let start = prefixRange.toString().length;
  const leadingWhitespace =
    range.toString().length - range.toString().trimStart().length;
  start += leadingWhitespace;
  const end = start + selectedText.length;

  return {
    page,
    blockId,
    anchor: {
      exact: selectedText,
      prefix: fullText.slice(Math.max(0, start - 32), start),
      suffix: fullText.slice(end, end + 32),
      start,
      end,
    },
  };
}

function parentElement(node: Node): Element | null {
  return node.nodeType === Node.ELEMENT_NODE
    ? (node as Element)
    : node.parentElement;
}
