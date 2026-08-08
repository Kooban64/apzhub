import type { SearchProductId } from "@apzhub/search-contracts";

const PRODUCT_HOME: Record<string, string> = {
  projects: "/workspace/projects",
  support: "/workspace/support",
  workflow: "/workspace/workflows",
  documents: "/workspace/knowledge",
  time: "/workspace/time",
  analytics: "/workspace/analytics",
  qep: "/workspace/qep",
};

/** Always APZHUB product paths — never provider origins. */
export function toProductDeepLink(
  href: string | undefined,
  productId: SearchProductId,
): string {
  const fallback = PRODUCT_HOME[productId] ?? "/workspace/home";
  if (!href || href.trim() === "") {
    return fallback;
  }
  const trimmed = href.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return fallback;
  }
  if (trimmed.startsWith("/workspace/")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return `/workspace${trimmed}`;
  }
  return fallback;
}
