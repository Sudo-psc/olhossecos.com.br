import type {
  Bookmark,
  Highlight,
  IssueManifest,
  ReaderNote,
  SearchResult,
} from "./types.ts";

export type PanelName =
  | "toc"
  | "thumbnails"
  | "search"
  | "highlights"
  | "notes"
  | "settings"
  | "bookmarks"
  | "text";

export class ReaderUi {
  readonly viewport: HTMLElement;
  readonly canvas: HTMLElement;
  private readonly root: HTMLElement;
  private activePanelTrigger: HTMLElement | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.viewport = requiredElement(root, "[data-reader-viewport]");
    this.canvas = requiredElement(root, "[data-reader-canvas]");
  }

  prepareManifest(manifest: IssueManifest): void {
    this.find("[data-page-count]").textContent = String(manifest.pageCount);
    const input = this.find<HTMLInputElement>("[data-page-input]");
    input.max = String(manifest.pageCount);
    this.find<HTMLAnchorElement>("[data-pdf-fallback]").href =
      manifest.pdfFallback;
    const brandLine = this.root.querySelector("[data-reader-brand-line]");
    if (brandLine) {
      brandLine.textContent = `${manifest.number} · ${manifest.title}`;
    }
    this.renderToc(manifest);
    this.renderThumbnails(manifest);
  }

  ready(): void {
    this.find("[data-reader-loading]").hidden = true;
    this.viewport.setAttribute("aria-busy", "false");
  }

  updatePage(page: number, pageCount: number, progress: number): void {
    this.find<HTMLInputElement>("[data-page-input]").value = String(page);
    this.find<HTMLElement>("[data-progress-bar]").style.width = `${progress}%`;
    this.find<HTMLElement>("[data-progress]").setAttribute(
      "aria-valuenow",
      String(Math.round(progress)),
    );
    this.root
      .querySelectorAll<HTMLButtonElement>("[data-thumbnail-page]")
      .forEach((button) => {
        if (Number(button.dataset.thumbnailPage) === page)
          button.setAttribute("aria-current", "page");
        else button.removeAttribute("aria-current");
      });
    this.announce(`Página ${page} de ${pageCount}.`);
  }

  updateBookmarkButton(isBookmarked: boolean): void {
    const button = this.find<HTMLButtonElement>("[data-action='bookmark']");
    button.setAttribute("aria-pressed", String(isBookmarked));
    const label = button.querySelector<HTMLElement>(".toolbar-label");
    if (label) label.textContent = isBookmarked ? "Marcada" : "Marcar";
  }

  updateSoundButton(enabled: boolean): void {
    const button = this.find<HTMLButtonElement>("[data-action='sound']");
    button.setAttribute("aria-pressed", String(enabled));
    const label = button.querySelector<HTMLElement>(".toolbar-label");
    if (label) label.textContent = enabled ? "Som on" : "Som off";
  }

  openPanel(name: PanelName): void {
    this.closePanels(false);
    const panel = this.root.querySelector<HTMLElement>(
      `[data-panel="${name}"]`,
    );
    if (!panel) return;
    panel.hidden = false;
    const trigger = this.root.querySelector<HTMLButtonElement>(
      `[data-action="${panelAction(name)}"]`,
    );
    this.activePanelTrigger = trigger;
    trigger?.setAttribute("aria-expanded", "true");
    panel
      .querySelector<HTMLElement>("button, input, textarea, [tabindex]")
      ?.focus();
  }

  closePanels(restoreFocus = true): void {
    this.root.querySelectorAll<HTMLElement>("[data-panel]").forEach((panel) => {
      panel.hidden = true;
    });
    this.root
      .querySelectorAll<HTMLButtonElement>("[aria-expanded='true']")
      .forEach((button) => {
        button.setAttribute("aria-expanded", "false");
      });
    if (restoreFocus && this.activePanelTrigger?.isConnected) {
      this.activePanelTrigger.focus();
    }
    if (restoreFocus) this.activePanelTrigger = null;
  }

  hasOpenPanel(): boolean {
    return Array.from(
      this.root.querySelectorAll<HTMLElement>("[data-panel]"),
    ).some((panel) => !panel.hidden);
  }

  showResume(page: number): void {
    const banner = this.find<HTMLElement>("[data-resume-banner]");
    this.find("[data-resume-copy]").textContent =
      `Continuar da página ${page}?`;
    banner.dataset.resumePage = String(page);
    banner.hidden = false;
  }

  hideResume(): void {
    this.find<HTMLElement>("[data-resume-banner]").hidden = true;
  }

  resumePage(): number {
    return Number(
      this.find<HTMLElement>("[data-resume-banner]").dataset.resumePage ?? 1,
    );
  }

  showFallback(detail: string): void {
    this.find("[data-reader-loading]").hidden = true;
    this.viewport.hidden = true;
    this.find("[data-fallback-detail]").textContent = detail;
    this.find<HTMLElement>("[data-reader-fallback]").hidden = false;
  }

  renderSearch(results: SearchResult[], term: string): void {
    const list = this.find<HTMLOListElement>("[data-search-results]");
    list.replaceChildren(
      ...results.map((result) => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.navigatePage = String(result.page);
        const title = document.createElement("strong");
        title.textContent = `“${term}” · página ${result.page}`;
        const snippet = document.createElement("span");
        snippet.textContent = result.snippet;
        button.append(title, snippet);
        item.append(button);
        return item;
      }),
    );
    this.find("[data-search-status]").textContent =
      results.length === 0
        ? "Nenhum resultado encontrado."
        : `${results.length} ${results.length === 1 ? "resultado" : "resultados"}.`;
  }

  renderBookmarks(bookmarks: Bookmark[]): void {
    this.renderSavedList(
      "[data-bookmark-list]",
      bookmarks,
      (bookmark) => `Página ${bookmark.page}`,
      (bookmark) => `Marcada em ${formatDate(bookmark.createdAt)}`,
      (bookmark) => bookmark.page,
      "Nenhum marcador salvo.",
    );
  }

  renderHighlights(highlights: Highlight[]): void {
    this.renderSavedList(
      "[data-highlight-list]",
      highlights,
      (highlight) => `Página ${highlight.page} · ${colorName(highlight.color)}`,
      (highlight) => `“${highlight.anchor.exact}”`,
      (highlight) => highlight.page,
      "Nenhum destaque salvo.",
    );
  }

  renderNotes(notes: ReaderNote[]): void {
    this.renderSavedList(
      "[data-note-list]",
      notes,
      (note) => `Página ${note.page}`,
      (note) => note.text,
      (note) => note.page,
      "Nenhuma nota salva.",
    );
  }

  setTextModeContent(content: DocumentFragment): void {
    this.find("[data-text-mode-content]").replaceChildren(content);
  }

  setTextModeMessage(message: string): void {
    const paragraph = document.createElement("p");
    paragraph.textContent = message;
    this.find("[data-text-mode-content]").replaceChildren(paragraph);
  }

  searchStatus(message: string): void {
    this.find("[data-search-status]").textContent = message;
  }

  announce(message: string): void {
    this.find("[data-reader-live]").textContent = message;
  }

  find<T extends HTMLElement = HTMLElement>(selector: string): T {
    return requiredElement<T>(this.root, selector);
  }

  private renderToc(manifest: IssueManifest): void {
    const list = this.find<HTMLOListElement>("[data-toc-list]");
    list.replaceChildren(
      ...manifest.toc.map((entry) => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.navigatePage = String(entry.page);
        const title = document.createElement("span");
        title.textContent = entry.title;
        const page = document.createElement("span");
        page.textContent = `p. ${entry.page}`;
        button.append(title, page);
        item.append(button);
        return item;
      }),
    );
  }

  private renderThumbnails(manifest: IssueManifest): void {
    const list = this.find<HTMLOListElement>("[data-thumbnail-list]");
    list.replaceChildren(
      ...manifest.pages.map((page) => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.navigatePage = String(page.number);
        button.dataset.thumbnailPage = String(page.number);
        const image = document.createElement("img");
        image.src = page.thumbnail;
        image.alt = "";
        image.loading = "lazy";
        image.addEventListener("error", () => image.remove(), { once: true });
        const label = document.createElement("span");
        label.textContent = `Página ${page.number}`;
        button.append(image, label);
        item.append(button);
        return item;
      }),
    );
  }

  private renderSavedList<T>(
    selector: string,
    entries: T[],
    titleFor: (entry: T) => string,
    detailFor: (entry: T) => string,
    pageFor: (entry: T) => number,
    emptyMessage: string,
  ): void {
    const list = this.find<HTMLOListElement>(selector);
    if (entries.length === 0) {
      const item = document.createElement("li");
      const detail = document.createElement("span");
      detail.textContent = emptyMessage;
      item.append(detail);
      list.replaceChildren(item);
      return;
    }
    list.replaceChildren(
      ...entries.map((entry) => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.dataset.navigatePage = String(pageFor(entry));
        const title = document.createElement("strong");
        title.textContent = titleFor(entry);
        const detail = document.createElement("span");
        detail.textContent = detailFor(entry);
        button.append(title, detail);
        item.append(button);
        return item;
      }),
    );
  }
}

function requiredElement<T extends HTMLElement = HTMLElement>(
  root: ParentNode,
  selector: string,
): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Elemento obrigatório ausente: ${selector}`);
  return element;
}

function panelAction(name: PanelName): string {
  if (name === "settings") return "zoom";
  if (name === "text") return "text-mode";
  return name;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function colorName(color: Highlight["color"]): string {
  return { yellow: "amarelo", green: "verde", blue: "azul", pink: "rosa" }[
    color
  ];
}
