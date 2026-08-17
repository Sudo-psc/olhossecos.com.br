import { SiteReaderAnalytics } from "./analytics/SiteReaderAnalytics.ts";
import { PageAudioController } from "./audio/PageAudioController.ts";
import type { PageTurnAdapter } from "./engines/PageTurnAdapter.ts";
import { SimplePageTurnAdapter } from "./engines/SimplePageTurnAdapter.ts";
import { validateIssueManifest } from "./manifest.ts";
import {
  calculateReadingProgress,
  getVisiblePageNumbers,
  normalizePageNumber,
} from "./navigation.ts";
import { PageRenderer } from "./page-renderer.ts";
import { ReaderUi, type PanelName } from "./reader-ui.ts";
import { searchIssue, validateSearchIndex } from "./search.ts";
import { captureTextSelection, type CapturedSelection } from "./selection.ts";
import { sanitizeStoredReaderData } from "./stored-data.ts";
import { IndexedDbReaderStorage } from "./storage/IndexedDbReaderStorage.ts";
import type { ReaderStorage } from "./storage/ReaderStorage.ts";
import { VolatileReaderStorage } from "./storage/VolatileReaderStorage.ts";
import type {
  Bookmark,
  DisplayMode,
  Highlight,
  HighlightColor,
  IssueManifest,
  ReaderNote,
  ReaderPreferences,
  ReadingProgress,
  SearchIndexEntry,
} from "./types.ts";
import { pageFromUrl, shareUrlForPage, urlForPage } from "./url-state.ts";

export async function initMagazineReader(root: HTMLElement): Promise<void> {
  if (root.dataset.readerInitialized === "true") return;
  root.dataset.readerInitialized = "true";
  const controller = new MagazineReaderController(root);
  await controller.start();
}

class MagazineReaderController {
  private readonly root: HTMLElement;
  private readonly ui: ReaderUi;
  private readonly analytics = new SiteReaderAnalytics();
  private audio = new PageAudioController([]);
  private readonly systemReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  private storage: ReaderStorage;
  private manifest: IssueManifest | null = null;
  private renderer: PageRenderer | null = null;
  private adapter: PageTurnAdapter | null = null;
  private displayMode: DisplayMode = "single";
  private currentPage = 1;
  private preferences: ReaderPreferences | null = null;
  private bookmarks: Bookmark[] = [];
  private highlights: Highlight[] = [];
  private notes: ReaderNote[] = [];
  private searchIndex: SearchIndexEntry[] | null = null;
  private pendingSelection: CapturedSelection | null = null;
  private suppressAudioOnce = false;
  private loadedArticlePath: string | null = null;
  private articleLoadGeneration = 0;
  private resizeObserver: ResizeObserver | null = null;
  private pointerStart: { x: number; y: number; id: number } | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
    this.ui = new ReaderUi(root);
    try {
      this.storage = new IndexedDbReaderStorage();
    } catch {
      this.storage = new VolatileReaderStorage();
    }
  }

  async start(): Promise<void> {
    this.bindEvents();
    try {
      const manifest = await this.loadManifest();
      this.manifest = manifest;
      this.audio = new PageAudioController(manifest.audioSources);
      this.ui.prepareManifest(manifest);
      const hasDeepLink = new URL(window.location.href).searchParams.has(
        "page",
      );
      this.currentPage = pageFromUrl(window.location.href, manifest.pageCount);
      this.preferences = defaultPreferences(manifest.id);
      this.renderer = new PageRenderer(this.ui.canvas, manifest);
      this.updateDisplayMode();
      await this.rebuildAdapter();
      this.updatePageUi();
      this.ui.ready();

      const [progress, preferences, bookmarks, highlights, notes] =
        await Promise.all([
          this.safeStorage(() => this.storage.getProgress(manifest.id), null),
          this.safeStorage(
            () => this.storage.getPreferences(manifest.id),
            null,
          ),
          this.safeStorage(() => this.storage.listBookmarks(manifest.id), []),
          this.safeStorage(() => this.storage.listHighlights(manifest.id), []),
          this.safeStorage(() => this.storage.listNotes(manifest.id), []),
        ]);
      const stored = sanitizeStoredReaderData(manifest.id, manifest.pageCount, {
        progress,
        preferences,
        bookmarks,
        highlights,
        notes,
      });
      this.preferences = stored.preferences ?? defaultPreferences(manifest.id);
      this.bookmarks = stored.bookmarks;
      this.highlights = stored.highlights;
      this.notes = stored.notes;
      this.renderer.setHighlights(this.highlights);
      this.applyPreferences();
      await this.renderer.hydrateWindow(this.currentPage);
      this.renderSavedData();
      this.updatePageUi();

      if (hasDeepLink || !stored.progress) await this.saveProgress();

      if (!hasDeepLink && stored.progress && stored.progress.page > 1)
        this.ui.showResume(stored.progress.page);
      this.analytics.track("reader_open", { issue_id: manifest.id });
      this.trackPageView();
      this.watchAvailableSpace();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Falha inesperada ao preparar a edição.";
      this.ui.showFallback(message);
    }
  }

  private async loadManifest(): Promise<IssueManifest> {
    const manifestUrl = this.root.dataset.manifestUrl;
    if (!manifestUrl) throw new Error("URL do manifest ausente.");
    const response = await fetch(manifestUrl);
    if (!response.ok)
      throw new Error(`Manifest indisponível (${response.status}).`);
    const validation = validateIssueManifest(await response.json());
    if (!validation.success) throw new Error(validation.errors.join(" "));
    return validation.data;
  }

  private async rebuildAdapter(): Promise<void> {
    if (!this.manifest || !this.renderer) return;
    this.adapter?.destroy();
    this.renderer.createPageElements();
    this.renderer.setHighlights(this.highlights);
    this.renderer.hydrateImages(this.currentPage);

    const shouldReduce = this.isMotionReduced();
    this.root.dataset.reducedMotion = String(shouldReduce);
    this.mountSimpleAdapter();
    this.ui.ready();

    if (shouldReduce) return;

    try {
      const { StPageFlipAdapter } =
        await import("./engines/StPageFlipAdapter.ts");
      this.adapter?.destroy();
      this.adapter = new StPageFlipAdapter(this.currentPage);
      this.adapter.onPageChange((page) => void this.handlePageChange(page));
      this.adapter.mount(this.ui.canvas);
      this.adapter.setDisplayMode(this.displayMode);
      this.applyZoom();
    } catch {
      this.mountSimpleAdapter();
      this.ui.announce("Animação 3D indisponível; usando transição simples.");
    }
  }

  private mountSimpleAdapter(): void {
    this.adapter = new SimplePageTurnAdapter(this.currentPage);
    this.adapter.onPageChange((page) => void this.handlePageChange(page));
    this.adapter.mount(this.ui.canvas);
    this.adapter.setDisplayMode(this.displayMode);
    this.applyZoom();
  }

  private bindEvents(): void {
    this.root.addEventListener(
      "click",
      (event) => void this.handleClick(event),
    );
    this.root.addEventListener(
      "submit",
      (event) => void this.handleSubmit(event),
    );
    this.root.addEventListener(
      "change",
      (event) => void this.handleChange(event),
    );
    this.root.addEventListener("mouseup", () =>
      window.setTimeout(() => this.captureSelection(), 0),
    );
    this.root.addEventListener("touchend", () =>
      window.setTimeout(() => this.captureSelection(), 0),
    );
    this.ui.viewport.addEventListener("pointerdown", (event) =>
      this.pointerDown(event),
    );
    this.ui.viewport.addEventListener("pointerup", (event) =>
      this.pointerUp(event),
    );
    window.addEventListener(
      "keydown",
      (event) => void this.handleKeyboard(event),
    );
    this.systemReducedMotion.addEventListener("change", () => {
      void this.handleSystemMotionChange();
    });
    window.addEventListener("popstate", () => {
      if (!this.manifest) return;
      this.goToPage(
        pageFromUrl(window.location.href, this.manifest.pageCount),
        true,
      );
    });
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement)
        this.root.removeAttribute("data-simulated-fullscreen");
    });
  }

  private async handleClick(event: MouseEvent): Promise<void> {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("[data-close-panel]")) {
      this.ui.closePanels();
      return;
    }
    const navigation = target.closest<HTMLElement>("[data-navigate-page]");
    if (navigation) {
      this.goToPage(Number(navigation.dataset.navigatePage), true);
      this.ui.closePanels();
      return;
    }
    const highlightButton = target.closest<HTMLButtonElement>(
      "[data-highlight-color]",
    );
    if (highlightButton) {
      await this.createHighlight(
        highlightButton.dataset.highlightColor as HighlightColor,
      );
      return;
    }
    const zoomButton = target.closest<HTMLButtonElement>("[data-zoom]");
    if (zoomButton) {
      await this.setZoom(zoomButton.dataset.zoom ?? "fit-page");
      return;
    }
    const action = target.closest<HTMLElement>("[data-action]")?.dataset.action;
    if (!action) return;
    await this.handleAction(action);
  }

  private async handleAction(action: string): Promise<void> {
    if (
      [
        "toc",
        "thumbnails",
        "search",
        "highlights",
        "notes",
        "bookmarks",
      ].includes(action)
    ) {
      this.ui.openPanel(action as PanelName);
      if (action === "search") void this.loadSearchIndex();
      return;
    }
    if (action === "zoom") return this.ui.openPanel("settings");
    if (action === "text-mode") return void this.openTextMode();
    if (action === "previous") return this.adapter?.previous();
    if (action === "next") return this.adapter?.next();
    if (action === "bookmark") return void this.toggleBookmark();
    if (action === "sound") return void this.toggleSound();
    if (action === "fullscreen") return void this.toggleFullscreen();
    if (action === "share") return void this.sharePage();
    if (action === "resume") {
      this.goToPage(this.ui.resumePage(), true);
      return this.ui.hideResume();
    }
    if (action === "dismiss-resume") return this.ui.hideResume();
    if (action === "minimize") return void this.toggleToolbar();
    if (action === "simple-reader") return void this.enableSimpleReader();
    if (action === "close") {
      if (window.history.length > 1) window.history.back();
      else window.location.assign("/superficie");
    }
  }

  private async handleSubmit(event: SubmitEvent): Promise<void> {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    event.preventDefault();
    if (form.matches("[data-page-form]")) {
      this.goToPage(
        Number(this.ui.find<HTMLInputElement>("[data-page-input]").value),
        true,
      );
      return;
    }
    if (form.matches("[data-search-form]")) {
      const query = new FormData(form).get("query")?.toString() ?? "";
      await this.runSearch(query);
      return;
    }
    if (form.matches("[data-note-form]")) await this.saveNote();
  }

  private async handleChange(event: Event): Promise<void> {
    const target = event.target;
    if (
      !(target instanceof HTMLInputElement) ||
      !target.matches("[data-reduced-motion]")
    )
      return;
    if (!this.preferences) return;
    this.preferences.reducedMotion = target.checked;
    await this.savePreferences();
    await this.rebuildAdapter();
    this.updateDisplayMode();
  }

  private async handleKeyboard(event: KeyboardEvent): Promise<void> {
    const target = event.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement
    )
      return;
    if (event.key === "Escape") {
      if (this.ui.hasOpenPanel()) this.ui.closePanels();
      else if (document.fullscreenElement) await document.exitFullscreen();
      return;
    }
    if (event.key === "ArrowLeft") this.adapter?.previous();
    else if (event.key === "ArrowRight") this.adapter?.next();
    else if (event.key === "Home") this.goToPage(1, true);
    else if (event.key === "End" && this.manifest)
      this.goToPage(this.manifest.pageCount, true);
    else if (event.key === "+" || event.key === "=") await this.stepZoom(1);
    else if (event.key === "-") await this.stepZoom(-1);
    else return;
    event.preventDefault();
  }

  private async handlePageChange(page: number): Promise<void> {
    if (!this.manifest || page === this.currentPage) return;
    const previousPage = this.currentPage;
    this.currentPage = normalizePageNumber(page, this.manifest.pageCount);
    const suppressAudio = this.suppressAudioOnce;
    this.suppressAudioOnce = false;
    if (!suppressAudio) this.audio.playTurn();
    this.analytics.track("page_turn", {
      issue_id: this.manifest.id,
      page_number: this.currentPage,
      label: `${previousPage}-${this.currentPage}`,
    });
    window.history.replaceState(
      {},
      "",
      urlForPage(window.location.href, this.currentPage),
    );
    await this.renderer?.hydrateWindow(this.currentPage);
    this.updatePageUi();
    await this.saveProgress();
    this.trackPageView();
  }

  private goToPage(page: number, suppressSound: boolean): void {
    if (!this.manifest || !this.adapter) return;
    const target = normalizePageNumber(page, this.manifest.pageCount);
    if (target === this.currentPage) return;
    this.suppressAudioOnce = suppressSound;
    this.adapter.goToPage(target);
  }

  private updatePageUi(): void {
    if (!this.manifest) return;
    const progress = calculateReadingProgress(
      this.currentPage,
      this.manifest.pageCount,
    );
    this.ui.updatePage(this.currentPage, this.manifest.pageCount, progress);
    this.ui.updateBookmarkButton(
      this.bookmarks.some((bookmark) => bookmark.page === this.currentPage),
    );
  }

  private watchAvailableSpace(): void {
    this.resizeObserver = new ResizeObserver(() => this.updateDisplayMode());
    this.resizeObserver.observe(this.ui.find<HTMLElement>(".reader-stage"));
  }

  private updateDisplayMode(): void {
    const bounds = this.ui
      .find<HTMLElement>(".reader-stage")
      .getBoundingClientRect();
    const nextMode: DisplayMode =
      bounds.width >= 900 && bounds.width > bounds.height * 1.08
        ? "double"
        : "single";
    this.displayMode = nextMode;
    this.ui.viewport.dataset.displayMode = nextMode;
    this.adapter?.setDisplayMode(nextMode);
    this.applyZoom();
  }

  private captureSelection(): void {
    this.pendingSelection = captureTextSelection(this.ui.viewport);
    this.ui.find<HTMLElement>("[data-selection-menu]").hidden =
      !this.pendingSelection;
  }

  private async createHighlight(color: HighlightColor): Promise<void> {
    if (!this.pendingSelection || !this.manifest || !this.renderer) return;
    const selection = this.pendingSelection;
    const highlight: Highlight = {
      id: crypto.randomUUID(),
      issueId: this.manifest.id,
      page: selection.page,
      blockId: selection.blockId,
      anchor: selection.anchor,
      color,
      createdAt: new Date().toISOString(),
    };
    await this.safeStorage(
      () => this.storage.saveHighlight(highlight),
      undefined,
    );
    this.highlights.push(highlight);
    this.renderer.setHighlights(this.highlights);
    await this.renderer.refreshPage(selection.page);
    this.ui.renderHighlights(this.highlights);
    this.ui.find<HTMLElement>("[data-selection-menu]").hidden = true;
    window.getSelection()?.removeAllRanges();
    this.pendingSelection = null;
    this.analytics.track("highlight_create", {
      issue_id: this.manifest.id,
      page_number: highlight.page,
      color,
    });
    this.ui.announce("Destaque salvo.");
  }

  private async toggleBookmark(): Promise<void> {
    if (!this.manifest) return;
    const existing = this.bookmarks.find(
      (bookmark) => bookmark.page === this.currentPage,
    );
    if (existing) {
      await this.safeStorage(
        () => this.storage.deleteBookmark(existing.id),
        undefined,
      );
      this.bookmarks = this.bookmarks.filter(
        (bookmark) => bookmark.id !== existing.id,
      );
    } else {
      const bookmark: Bookmark = {
        id: `${this.manifest.id}:${this.currentPage}`,
        issueId: this.manifest.id,
        page: this.currentPage,
        createdAt: new Date().toISOString(),
      };
      await this.safeStorage(
        () => this.storage.saveBookmark(bookmark),
        undefined,
      );
      this.bookmarks.push(bookmark);
      this.analytics.track("bookmark_add", {
        issue_id: this.manifest.id,
        page_number: this.currentPage,
      });
    }
    this.renderSavedData();
    this.updatePageUi();
  }

  private async saveNote(): Promise<void> {
    if (!this.manifest) return;
    const textarea = this.ui.find<HTMLTextAreaElement>(
      "[data-note-form] textarea",
    );
    const text = textarea.value.trim();
    if (!text) return;
    const timestamp = new Date().toISOString();
    const note: ReaderNote = {
      id: crypto.randomUUID(),
      issueId: this.manifest.id,
      page: this.currentPage,
      text,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await this.safeStorage(() => this.storage.saveNote(note), undefined);
    this.notes.push(note);
    textarea.value = "";
    this.ui.renderNotes(this.notes);
    this.analytics.track("note_create", {
      issue_id: this.manifest.id,
      page_number: this.currentPage,
    });
    this.ui.announce("Nota salva localmente.");
  }

  private async toggleSound(): Promise<void> {
    if (!this.preferences) return;
    this.preferences.soundEnabled = !this.preferences.soundEnabled;
    if (this.preferences.soundEnabled) this.audio.enable();
    else this.audio.disable();
    this.ui.updateSoundButton(this.preferences.soundEnabled);
    await this.savePreferences();
  }

  private async toggleToolbar(): Promise<void> {
    if (!this.preferences) return;
    const minimizing = !this.preferences.toolbarMinimized;
    if (minimizing && this.ui.hasOpenPanel()) this.ui.closePanels();
    this.preferences.toolbarMinimized = minimizing;
    this.applyToolbarState();
    if (minimizing) {
      this.ui.find<HTMLButtonElement>("[data-action='minimize']").focus();
    }
    await this.savePreferences();
  }

  private async loadSearchIndex(): Promise<void> {
    if (!this.manifest || this.searchIndex) return;
    this.ui.searchStatus("Carregando índice…");
    try {
      const response = await fetch(this.manifest.searchIndex);
      if (!response.ok) throw new Error();
      const index = validateSearchIndex(
        await response.json(),
        this.manifest.pageCount,
      );
      if (!index) throw new Error("Índice inválido.");
      this.searchIndex = index;
      this.ui.searchStatus("Digite ao menos dois caracteres.");
    } catch {
      this.ui.searchStatus(
        "A busca está temporariamente indisponível. As outras ferramentas continuam funcionando.",
      );
    }
  }

  private async runSearch(query: string): Promise<void> {
    try {
      await this.loadSearchIndex();
      if (!this.searchIndex) return;
      const results = searchIssue(this.searchIndex, query);
      this.ui.renderSearch(results, query.trim());
      this.analytics.track("search", {
        issue_id: this.manifest?.id,
        query_length: query.trim().length,
        label: String(results.length),
      });
    } catch {
      this.searchIndex = null;
      this.ui.searchStatus(
        "A busca está temporariamente indisponível. As outras ferramentas continuam funcionando.",
      );
    }
  }

  private async openTextMode(): Promise<void> {
    this.ui.openPanel("text");
    if (!this.manifest) return;
    const page = this.manifest.pages[this.currentPage - 1];
    const article = page?.articleId
      ? this.manifest.articles.find((entry) => entry.id === page.articleId)
      : this.manifest.articles.find((entry) =>
          entry.pages.includes(this.currentPage),
        );
    if (!article?.htmlPath) {
      this.articleLoadGeneration += 1;
      this.loadedArticlePath = null;
      this.ui.setTextModeMessage("Artigo HTML indisponível.");
      return;
    }
    if (this.loadedArticlePath === article.htmlPath) return;
    const loadGeneration = ++this.articleLoadGeneration;
    try {
      const response = await fetch(article.htmlPath);
      if (!response.ok) throw new Error();
      const { sanitizeArticleHtml } = await import("./article-content.ts");
      const content = sanitizeArticleHtml(await response.text());
      if (loadGeneration !== this.articleLoadGeneration) return;
      this.ui.setTextModeContent(content);
      this.loadedArticlePath = article.htmlPath;
    } catch {
      if (loadGeneration !== this.articleLoadGeneration) return;
      this.loadedArticlePath = null;
      this.ui.setTextModeMessage(
        "O artigo HTML não carregou. Use o PDF de teste como último fallback.",
      );
    }
  }

  private async toggleFullscreen(): Promise<void> {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (this.root.requestFullscreen) {
        await this.root.requestFullscreen();
        this.analytics.track("fullscreen_enter", {
          issue_id: this.manifest?.id,
        });
      } else {
        this.root.dataset.simulatedFullscreen = "true";
        this.ui.announce(
          "Este navegador não oferece a API de tela cheia; o leitor já ocupa a janela disponível.",
        );
      }
    } catch {
      this.root.dataset.simulatedFullscreen = "true";
      this.ui.announce("A tela cheia não pôde ser ativada neste navegador.");
    }
  }

  private async sharePage(): Promise<void> {
    if (!this.manifest) return;
    const url = shareUrlForPage(window.location.href, this.currentPage);
    try {
      if (navigator.share) {
        await navigator.share({ title: this.manifest.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        this.ui.announce("Link desta página copiado.");
      }
      this.analytics.track("share", {
        issue_id: this.manifest.id,
        page_number: this.currentPage,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      this.ui.announce(
        "Não foi possível compartilhar. Copie o endereço do navegador.",
      );
    }
  }

  private async enableSimpleReader(): Promise<void> {
    if (!this.preferences) return;
    this.preferences.reducedMotion = true;
    await this.savePreferences();
    this.ui.find<HTMLElement>("[data-reader-fallback]").hidden = true;
    this.ui.viewport.hidden = false;
    await this.rebuildAdapter();
    this.ui.ready();
  }

  private async setZoom(value: string): Promise<void> {
    if (!this.preferences) return;
    if (value === "fit-page" || value === "fit-width") {
      this.preferences.zoomMode = value;
      this.preferences.zoomPercent = 100;
    } else {
      const percentage = [100, 125, 150, 200].includes(Number(value))
        ? (Number(value) as ReaderPreferences["zoomPercent"])
        : 100;
      this.preferences.zoomMode = "custom";
      this.preferences.zoomPercent = percentage;
    }
    this.applyZoom();
    await this.savePreferences();
  }

  private async stepZoom(direction: -1 | 1): Promise<void> {
    if (!this.preferences) return;
    const levels: ReaderPreferences["zoomPercent"][] = [100, 125, 150, 200];
    const currentIndex = levels.indexOf(this.preferences.zoomPercent);
    const nextIndex = Math.max(
      0,
      Math.min(levels.length - 1, currentIndex + direction),
    );
    await this.setZoom(String(levels[nextIndex]));
  }

  private applyPreferences(): void {
    if (!this.preferences) return;
    if (this.preferences.soundEnabled) this.audio.enable();
    this.applyToolbarState();
    this.ui.updateSoundButton(this.preferences.soundEnabled);
    this.ui.find<HTMLInputElement>("[data-reduced-motion]").checked =
      this.isMotionReduced();
    this.applyZoom();
  }

  private applyZoom(): void {
    if (!this.preferences) return;
    const zoomTargets = this.zoomTargets();
    zoomTargets.forEach((target) => {
      target.style.setProperty("transform", "scale(1)");
      target.style.setProperty("transform-origin", "top center");
    });
    const contentBounds = this.measureVisibleContent();
    const stage = this.ui.find<HTMLElement>(".reader-stage");
    const stageStyle = window.getComputedStyle(stage);
    const availableWidth =
      stage.clientWidth -
      Number.parseFloat(stageStyle.paddingLeft) -
      Number.parseFloat(stageStyle.paddingRight);
    const availableHeight =
      stage.clientHeight -
      Number.parseFloat(stageStyle.paddingTop) -
      Number.parseFloat(stageStyle.paddingBottom);
    let scale = this.preferences.zoomPercent / 100;
    if (contentBounds && this.preferences.zoomMode === "fit-page") {
      scale = Math.min(
        availableWidth / contentBounds.width,
        availableHeight / contentBounds.height,
      );
    } else if (contentBounds && this.preferences.zoomMode === "fit-width") {
      scale = availableWidth / contentBounds.width;
    }
    scale = Math.max(0.85, Math.min(2, scale));
    this.root.style.setProperty("--reader-scale", String(scale));
    zoomTargets.forEach((target) =>
      target.style.setProperty("transform", `scale(${scale})`),
    );
    this.root.dataset.zoomMode = this.preferences.zoomMode;
    this.root
      .querySelectorAll<HTMLButtonElement>("[data-zoom]")
      .forEach((button) => {
        const selected =
          button.dataset.zoom === this.preferences?.zoomMode ||
          (this.preferences?.zoomMode === "custom" &&
            button.dataset.zoom === String(this.preferences.zoomPercent));
        button.setAttribute("aria-pressed", String(selected));
      });
  }

  private applyToolbarState(): void {
    if (!this.preferences) return;
    const minimized = this.preferences.toolbarMinimized;
    this.root.dataset.toolbarMinimized = String(minimized);
    this.root
      .querySelectorAll<HTMLButtonElement>(".reader-toolbar .toolbar-item")
      .forEach((button) => {
        button.disabled = minimized;
        if (minimized) button.setAttribute("aria-hidden", "true");
        else button.removeAttribute("aria-hidden");
      });
    const toggle = this.ui.find<HTMLButtonElement>("[data-action='minimize']");
    toggle.setAttribute("aria-pressed", String(minimized));
    toggle.setAttribute(
      "aria-label",
      minimized ? "Expandir ferramentas" : "Minimizar ferramentas",
    );
  }

  private zoomTargets(): HTMLElement[] {
    const engine = this.ui.canvas.querySelector<HTMLElement>(
      ".reader-page-engine",
    );
    if (engine) return [engine];
    return Array.from(
      this.ui.canvas.querySelectorAll<HTMLElement>(
        "[data-page-number]:not([hidden])",
      ),
    );
  }

  private measureVisibleContent(): { width: number; height: number } | null {
    const engine = this.ui.canvas.querySelector<HTMLElement>(
      ".reader-page-engine .stf__parent",
    );
    if (engine) {
      const bounds = engine.getBoundingClientRect();
      return bounds.width > 0 && bounds.height > 0
        ? { width: bounds.width, height: bounds.height }
        : null;
    }
    const pages = Array.from(
      this.ui.canvas.querySelectorAll<HTMLElement>(
        "[data-page-number]:not([hidden])",
      ),
    ).filter((page) => page.getBoundingClientRect().width > 0);
    if (pages.length === 0) return null;
    const bounds = pages.map((page) => page.getBoundingClientRect());
    const left = Math.min(...bounds.map((rect) => rect.left));
    const right = Math.max(...bounds.map((rect) => rect.right));
    const top = Math.min(...bounds.map((rect) => rect.top));
    const bottom = Math.max(...bounds.map((rect) => rect.bottom));
    return { width: right - left, height: bottom - top };
  }

  private isMotionReduced(): boolean {
    return (
      this.systemReducedMotion.matches ||
      Boolean(this.preferences?.reducedMotion)
    );
  }

  private async handleSystemMotionChange(): Promise<void> {
    if (!this.preferences) return;
    const reduced = this.isMotionReduced();
    if (this.root.dataset.reducedMotion === String(reduced)) return;
    this.ui.find<HTMLInputElement>("[data-reduced-motion]").checked = reduced;
    await this.rebuildAdapter();
    this.updatePageUi();
  }

  private async savePreferences(): Promise<void> {
    if (!this.preferences) return;
    await this.safeStorage(
      () => this.storage.savePreferences(this.preferences!),
      undefined,
    );
  }

  private async saveProgress(): Promise<void> {
    if (!this.manifest) return;
    const progress: ReadingProgress = {
      issueId: this.manifest.id,
      page: this.currentPage,
      percent: calculateReadingProgress(
        this.currentPage,
        this.manifest.pageCount,
      ),
      updatedAt: new Date().toISOString(),
    };
    await this.safeStorage(
      () => this.storage.saveProgress(progress),
      undefined,
    );
  }

  private renderSavedData(): void {
    this.ui.renderBookmarks(this.bookmarks);
    this.ui.renderHighlights(this.highlights);
    this.ui.renderNotes(this.notes);
  }

  private trackPageView(): void {
    if (!this.manifest) return;
    getVisiblePageNumbers(
      this.currentPage,
      this.manifest.pageCount,
      this.displayMode,
    ).forEach((page) => {
      this.analytics.track("page_view", {
        issue_id: this.manifest!.id,
        page_number: page,
        progress_percent: calculateReadingProgress(
          page,
          this.manifest!.pageCount,
        ),
      });
    });
  }

  private pointerDown(event: PointerEvent): void {
    if (!(this.adapter instanceof SimplePageTurnAdapter) || !event.isPrimary)
      return;
    this.pointerStart = {
      x: event.clientX,
      y: event.clientY,
      id: event.pointerId,
    };
  }

  private pointerUp(event: PointerEvent): void {
    if (!this.pointerStart || this.pointerStart.id !== event.pointerId) return;
    const horizontal = event.clientX - this.pointerStart.x;
    const vertical = Math.abs(event.clientY - this.pointerStart.y);
    this.pointerStart = null;
    if (Math.abs(horizontal) < 48 || vertical > Math.abs(horizontal) * 0.7)
      return;
    if (window.getSelection()?.toString()) return;
    if (horizontal < 0) this.adapter?.next();
    else this.adapter?.previous();
  }

  private async safeStorage<T>(
    operation: () => Promise<T>,
    fallback: T,
  ): Promise<T> {
    try {
      return await operation();
    } catch {
      if (!(this.storage instanceof VolatileReaderStorage)) {
        this.storage = new VolatileReaderStorage();
        this.ui.announce(
          "Persistência local indisponível; os dados desta sessão não serão mantidos.",
        );
      }
      return fallback;
    }
  }
}

function defaultPreferences(issueId: string): ReaderPreferences {
  return {
    issueId,
    soundEnabled: false,
    reducedMotion: false,
    toolbarMinimized: false,
    zoomMode: "fit-width",
    zoomPercent: 100,
  };
}
