export const normalizeBasePath = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "/") return "";
  return `/${trimmed.replace(/^\/+|\/+$/gu, "")}`;
};

export const withBasePath = (value: string, basePath: string) => {
  if (!value || !basePath || !value.startsWith("/") || value.startsWith("//")) {
    return value;
  }

  const [pathname, suffix = ""] = value.split(/(?=[?#])/u);
  if (pathname === basePath || pathname.startsWith(`${basePath}/`)) {
    return value;
  }
  return `${basePath}${pathname}${suffix}`;
};
