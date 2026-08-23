import DOMPurify from "dompurify";

const allowedTags = [
  "article",
  "section",
  "header",
  "footer",
  "aside",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "ul",
  "ol",
  "li",
  "blockquote",
  "figure",
  "figcaption",
  "img",
  "a",
  "strong",
  "em",
  "b",
  "i",
  "small",
  "abbr",
  "cite",
  "code",
  "pre",
  "table",
  "thead",
  "tbody",
  "tfoot",
  "tr",
  "th",
  "td",
  "caption",
  "dl",
  "dt",
  "dd",
  "hr",
  "br",
  "time",
  "sup",
  "sub",
];

const allowedAttributes = [
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "width",
  "height",
  "loading",
  "decoding",
  "title",
  "datetime",
  "scope",
  "colspan",
  "rowspan",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
  "id",
  "class",
  "lang",
];

export function sanitizeArticleHtml(html: string): DocumentFragment {
  const fragment = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    ALLOW_DATA_ATTR: false,
    FORBID_ATTR: ["style"],
    RETURN_DOM_FRAGMENT: true,
  });

  fragment.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    let url: URL;
    try {
      url = new URL(href, window.location.href);
    } catch {
      link.removeAttribute("href");
      return;
    }
    const sameOrigin = url.origin === window.location.origin;
    if (!sameOrigin && url.protocol !== "https:") {
      link.removeAttribute("href");
      link.removeAttribute("target");
      link.removeAttribute("rel");
      return;
    }
    if (!sameOrigin || link.target === "_blank") {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  });

  return fragment;
}
