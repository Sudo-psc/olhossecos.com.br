export type DisplayMode = "single" | "double";
export type MagazinePageType =
  | "cover"
  | "editorial"
  | "contents"
  | "article"
  | "infographic"
  | "closing"
  | "ad"
  | "back-cover";

export interface MagazinePage {
  number: number;
  image: {
    small: string;
    medium: string;
    large: string;
  };
  thumbnail: string;
  textLayer: string;
  type?: MagazinePageType;
  articleId?: string;
  alt?: string;
}

export interface IssueTocEntry {
  title: string;
  page: number;
}

export interface IssueArticle {
  id: string;
  title: string;
  pages: number[];
  htmlPath?: string;
}

export interface IssueManifest {
  id: string;
  number: string;
  title: string;
  pageCount: number;
  pages: MagazinePage[];
  toc: IssueTocEntry[];
  articles: IssueArticle[];
  audioSources: string[];
  searchIndex: string;
  pdfFallback: string;
}

export interface SearchIndexEntry {
  page: number;
  text: string;
}

export interface TextLayerBlock {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  role?: "heading" | "paragraph" | "label" | "page-number";
}

export interface TextLayerDocument {
  page: number;
  blocks: TextLayerBlock[];
}

export interface SearchResult {
  page: number;
  term: string;
  snippet: string;
}

export interface TextQuoteAnchor {
  exact: string;
  prefix: string;
  suffix: string;
  start: number;
  end: number;
}

export type HighlightColor = "yellow" | "green" | "blue" | "pink";
export type ZoomMode = "fit-page" | "fit-width" | "custom";

export interface ReadingProgress {
  issueId: string;
  page: number;
  percent: number;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  issueId: string;
  page: number;
  createdAt: string;
}

export interface Highlight {
  id: string;
  issueId: string;
  page: number;
  blockId: string;
  anchor: TextQuoteAnchor;
  color: HighlightColor;
  createdAt: string;
}

export interface ReaderNote {
  id: string;
  issueId: string;
  page: number;
  highlightId?: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReaderPreferences {
  issueId: string;
  soundEnabled: boolean;
  reducedMotion: boolean;
  toolbarMinimized: boolean;
  zoomMode: ZoomMode;
  zoomPercent: 100 | 125 | 150 | 200;
  resumeDismissedPage?: number;
}
