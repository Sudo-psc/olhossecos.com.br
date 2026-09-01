import { resolveHighlightAnchor } from "./highlights.ts";
import type {
  Highlight,
  IssueManifest,
  MagazinePage,
  TextLayerBlock,
  TextLayerDocument,
} from "./types.ts";

const transparentPixel =
  "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";

export class PageRenderer {
  private readonly documentCache = new Map<number, TextLayerDocument>();
  private readonly pendingDocuments = new Map<
    number,
    Promise<TextLayerDocument>
  >();
  private readonly manifest: IssueManifest;
  private readonly viewport: HTMLElement;
  private highlights: Highlight[] = [];
  private hydrationGeneration = 0;

  constructor(viewport: HTMLElement, manifest: IssueManifest) {
    this.viewport = viewport;
    this.manifest = manifest;
  }

  createPageElements(currentPage = 1): HTMLElement[] {
    const ssrCover = this.viewport.querySelector<HTMLElement>(
      ":scope > [data-ssr-cover]",
    );
    const pages = this.manifest.pages.map((page) => {
      if (page.number === 1 && ssrCover)
        return this.adoptSsrCover(ssrCover, page);
      return this.createPageElement(
        page,
        page.number === currentPage || page.number === 1,
      );
    });

    if (ssrCover && pages[0] === ssrCover) {
      Array.from(this.viewport.children)
        .filter((child) => !pages.includes(child as HTMLElement))
        .forEach((child) => child.remove());
      ssrCover.after(...pages.slice(1));
      return pages;
    }

    this.viewport.replaceChildren(...pages);
    return pages;
  }

  setHighlights(highlights: Highlight[]): void {
    this.highlights = highlights;
  }

  hydrateImages(currentPage: number): void {
    const minimum = Math.max(1, currentPage - 2);
    const maximum = Math.min(this.manifest.pageCount, currentPage + 2);
    this.manifest.pages.forEach((page) => {
      const element = this.getPageElement(page.number);
      if (!element) return;
      if (page.number >= minimum && page.number <= maximum) {
        this.hydrateImage(element, page, page.number === currentPage);
      } else {
        this.dehydrateImage(element);
      }
    });
  }

  async hydrateWindow(currentPage: number): Promise<void> {
    const generation = ++this.hydrationGeneration;
    const minimum = Math.max(1, currentPage - 2);
    const maximum = Math.min(this.manifest.pageCount, currentPage + 2);
    const tasks: Promise<void>[] = [];

    this.manifest.pages.forEach((page) => {
      const element = this.getPageElement(page.number);
      if (!element) return;
      if (page.number >= minimum && page.number <= maximum) {
        this.hydrateImage(element, page, page.number === currentPage);
        tasks.push(this.hydrateText(element, page, false, generation));
      } else {
        this.dehydrateImage(element);
        element
          .querySelector<HTMLElement>("[data-text-layer]")
          ?.replaceChildren();
        this.documentCache.delete(page.number);
      }
    });

    await Promise.allSettled(tasks);
  }

  async refreshPage(pageNumber: number): Promise<void> {
    const page = this.manifest.pages[pageNumber - 1];
    const element = this.getPageElement(pageNumber);
    if (page && element) await this.hydrateText(element, page, true);
  }

  private createPageElement(
    page: MagazinePage,
    seedImage = false,
    seedSrc?: string,
  ): HTMLElement {
    const element = document.createElement("article");
    element.className = "magazine-page";
    element.dataset.readerPage = "";
    element.dataset.pageNumber = String(page.number);
    element.dataset.density =
      page.type === "cover" || page.type === "back-cover" ? "hard" : "soft";
    element.setAttribute(
      "aria-label",
      `Página ${page.number} de ${this.manifest.pageCount}`,
    );

    const picture = document.createElement("picture");
    const largeSource = document.createElement("source");
    largeSource.media = "(min-width: 1100px)";
    largeSource.dataset.srcset = page.image.large;
    const mediumSource = document.createElement("source");
    mediumSource.media = "(min-width: 600px)";
    mediumSource.dataset.srcset = page.image.medium;
    const image = document.createElement("img");
    image.dataset.src = page.image.small;
    image.alt = page.alt ?? `Página ${page.number}`;
    image.width = 700;
    image.height = 990;
    image.decoding = "async";
    image.draggable = false;
    if (seedImage) {
      const immediate = seedSrc ?? page.image.medium;
      largeSource.srcset = page.image.large;
      mediumSource.srcset = page.image.medium;
      image.src = immediate;
      image.srcset = `${page.image.small} 480w, ${page.image.medium} 900w, ${page.image.large} 1400w`;
      image.sizes = "(max-width: 760px) 94vw, (max-width: 1100px) 62vw, 43vw";
      image.loading = "eager";
      image.fetchPriority = "high";
      image.dataset.loaded = "true";
    } else {
      image.src = transparentPixel;
    }
    image.addEventListener(
      "error",
      () => this.showImageError(element, page.number),
      {
        once: true,
      },
    );
    picture.append(largeSource, mediumSource, image);

    const textLayer = document.createElement("div");
    textLayer.className = "text-layer";
    textLayer.dataset.textLayer = "";
    textLayer.setAttribute(
      "aria-label",
      `Texto selecionável da página ${page.number}`,
    );
    this.bindTextLayerGestures(textLayer);
    element.append(picture, textLayer);
    return element;
  }

  private adoptSsrCover(element: HTMLElement, page: MagazinePage): HTMLElement {
    element.dataset.readerPage = "";
    element.dataset.pageNumber = "1";
    element.dataset.density =
      page.type === "cover" || page.type === "back-cover" ? "hard" : "soft";
    element.setAttribute(
      "aria-label",
      `Página 1 de ${this.manifest.pageCount}`,
    );
    const image = element.querySelector<HTMLImageElement>("img");
    if (image) {
      image.dataset.src = page.image.small;
      image.dataset.loaded = "true";
      image.draggable = false;
      if (!image.getAttribute("src")) image.src = page.image.medium;
    }
    if (!element.querySelector("[data-text-layer]")) {
      const textLayer = document.createElement("div");
      textLayer.className = "text-layer";
      textLayer.dataset.textLayer = "";
      textLayer.setAttribute(
        "aria-label",
        `Texto selecionável da página ${page.number}`,
      );
      this.bindTextLayerGestures(textLayer);
      element.append(textLayer);
    }
    return element;
  }

  private bindTextLayerGestures(textLayer: HTMLElement): void {
    textLayer.addEventListener("mousedown", (event) => {
      event.stopPropagation();
    });
    textLayer.addEventListener("touchstart", (event) => {
      event.stopPropagation();
    });
  }

  private hydrateImage(
    element: HTMLElement,
    page: MagazinePage,
    current = false,
  ): void {
    const image = element.querySelector<HTMLImageElement>("img[data-src]");
    if (!image || image.dataset.loaded === "true") return;
    element
      .querySelectorAll<HTMLSourceElement>("source[data-srcset]")
      .forEach((source) => {
        source.srcset = source.dataset.srcset ?? "";
      });
    image.src = image.dataset.src ?? page.image.small;
    image.srcset = `${page.image.small} 480w, ${page.image.medium} 900w, ${page.image.large} 1400w`;
    image.sizes = "(max-width: 760px) 94vw, (max-width: 1100px) 62vw, 43vw";
    image.loading = current ? "eager" : "lazy";
    image.fetchPriority = current ? "high" : "auto";
    image.dataset.loaded = "true";
  }

  private dehydrateImage(element: HTMLElement): void {
    const image = element.querySelector<HTMLImageElement>("img[data-src]");
    if (!image || image.dataset.loaded !== "true") return;
    element
      .querySelectorAll<HTMLSourceElement>("source[data-srcset]")
      .forEach((source) => source.removeAttribute("srcset"));
    image.removeAttribute("srcset");
    image.removeAttribute("sizes");
    image.src = transparentPixel;
    delete image.dataset.loaded;
    element.querySelector(".page-image-error")?.remove();
  }

  private async hydrateText(
    element: HTMLElement,
    page: MagazinePage,
    force = false,
    generation = this.hydrationGeneration,
  ): Promise<void> {
    const layer = element.querySelector<HTMLElement>("[data-text-layer]");
    if (!layer || (layer.childElementCount > 0 && !force)) return;
    try {
      const textDocument = await this.loadTextDocument(page);
      if (generation !== this.hydrationGeneration || !element.isConnected)
        return;
      this.documentCache.set(page.number, textDocument);
      const pageHighlights = this.highlights.filter(
        (highlight) => highlight.page === page.number,
      );
      layer.replaceChildren(
        ...textDocument.blocks.map((block) =>
          this.createTextBlock(block, pageHighlights),
        ),
      );
      layer.setAttribute(
        "aria-label",
        `Texto selecionável da página ${page.number}`,
      );
    } catch {
      layer.replaceChildren();
      layer.setAttribute(
        "aria-label",
        `Camada textual indisponível na página ${page.number}`,
      );
    }
  }

  private loadTextDocument(page: MagazinePage): Promise<TextLayerDocument> {
    const cached = this.documentCache.get(page.number);
    if (cached) return Promise.resolve(cached);
    const pending = this.pendingDocuments.get(page.number);
    if (pending) return pending;

    const request = fetch(page.textLayer)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Text layer ${response.status}`);
        const value = (await response.json()) as TextLayerDocument;
        if (!isValidTextLayer(value, page.number)) {
          throw new Error("Text layer inválida.");
        }
        return value;
      })
      .finally(() => this.pendingDocuments.delete(page.number));
    this.pendingDocuments.set(page.number, request);
    return request;
  }

  private createTextBlock(
    block: TextLayerBlock,
    highlights: Highlight[],
  ): HTMLElement {
    const element = document.createElement(
      block.role === "heading" ? "h2" : "p",
    );
    element.dataset.textBlock = block.id;
    element.dataset.role = block.role ?? "paragraph";
    element.style.left = `${block.x * 100}%`;
    element.style.top = `${block.y * 100}%`;
    element.style.width = `${block.width * 100}%`;
    element.style.height = `${block.height * 100}%`;
    if (isInternalLabStamp(block.text)) {
      element.className = "lab-stamp-mask";
      element.setAttribute("aria-hidden", "true");
      return element;
    }
    element.append(
      ...highlightedTextNodes(
        block.text,
        highlights.filter((item) => item.blockId === block.id),
      ),
    );
    return element;
  }

  private showImageError(pageElement: HTMLElement, pageNumber: number): void {
    if (pageElement.querySelector(".page-image-error")) return;
    const message = document.createElement("p");
    message.className = "page-image-error";
    message.textContent = `A imagem da página ${pageNumber} não carregou. O texto e a navegação continuam disponíveis.`;
    pageElement.append(message);
  }

  private getPageElement(pageNumber: number): HTMLElement | null {
    return this.viewport.querySelector<HTMLElement>(
      `[data-page-number="${pageNumber}"]`,
    );
  }
}

function isInternalLabStamp(text: string): boolean {
  return /não indexar/iu.test(text);
}

function isValidTextLayer(
  value: unknown,
  expectedPage: number,
): value is TextLayerDocument {
  if (
    typeof value !== "object" ||
    value === null ||
    Reflect.get(value, "page") !== expectedPage
  ) {
    return false;
  }
  const blocks = Reflect.get(value, "blocks");
  if (!Array.isArray(blocks) || blocks.length > 500) return false;
  const ids = new Set<string>();
  const validRoles = new Set([
    undefined,
    "heading",
    "paragraph",
    "label",
    "page-number",
  ]);
  return blocks.every((block) => {
    if (typeof block !== "object" || block === null) return false;
    const id = Reflect.get(block, "id");
    const text = Reflect.get(block, "text");
    const role = Reflect.get(block, "role");
    const x = Reflect.get(block, "x");
    const y = Reflect.get(block, "y");
    const width = Reflect.get(block, "width");
    const height = Reflect.get(block, "height");
    if (
      typeof id !== "string" ||
      id.length === 0 ||
      id.length > 200 ||
      ids.has(id) ||
      typeof text !== "string" ||
      text.length > 20_000 ||
      !validRoles.has(role) ||
      ![x, y, width, height].every(
        (coordinate) =>
          typeof coordinate === "number" && Number.isFinite(coordinate),
      )
    ) {
      return false;
    }
    ids.add(id);
    return (
      x >= 0 &&
      y >= 0 &&
      width > 0 &&
      height > 0 &&
      x <= 1 &&
      y <= 1 &&
      x + width <= 1.001 &&
      y + height <= 1.001
    );
  });
}

function highlightedTextNodes(text: string, highlights: Highlight[]): Node[] {
  const ranges = highlights
    .map((highlight) => ({
      highlight,
      range: resolveHighlightAnchor(text, highlight.anchor),
    }))
    .filter(
      (
        entry,
      ): entry is {
        highlight: Highlight;
        range: { start: number; end: number };
      } => Boolean(entry.range),
    )
    .sort((left, right) => left.range.start - right.range.start)
    .filter(
      (entry, index, entries) =>
        index === 0 || entry.range.start >= entries[index - 1]!.range.end,
    );

  if (ranges.length === 0) return [document.createTextNode(text)];
  const nodes: Node[] = [];
  let cursor = 0;
  ranges.forEach(({ highlight, range }) => {
    if (range.start > cursor)
      nodes.push(document.createTextNode(text.slice(cursor, range.start)));
    const mark = document.createElement("mark");
    mark.dataset.highlightId = highlight.id;
    mark.dataset.color = highlight.color;
    mark.textContent = text.slice(range.start, range.end);
    nodes.push(mark);
    cursor = range.end;
  });
  if (cursor < text.length)
    nodes.push(document.createTextNode(text.slice(cursor)));
  return nodes;
}
