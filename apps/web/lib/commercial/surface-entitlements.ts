/**
 * Map search / quick-action product ids → commercial ProductKey for entitlement gates.
 * Documents search surfaces Knowledge commercially in several registry entries.
 */

import type { ProductKey } from "@/lib/commercial/catalogue";

const SEARCH_TO_COMMERCIAL: Record<string, ProductKey | "platform"> = {
  projects: "projects",
  support: "support",
  time: "time",
  workflow: "workflow",
  documents: "documents",
  knowledge: "knowledge",
  analytics: "analytics",
  qep: "qep",
  pentest: "pentest",
  law: "law",
  monitoring: "monitoring",
};

/** Resolve commercial product for entitlement checks (platform = always keep). */
export function commercialProductKeyForSurface(
  surfaceProductId: string,
): ProductKey | "platform" {
  return SEARCH_TO_COMMERCIAL[surfaceProductId] ?? "platform";
}

export function isSurfaceEntitled(
  surfaceProductId: string,
  allowedProducts: ReadonlySet<string>,
): boolean {
  const key = commercialProductKeyForSurface(surfaceProductId);
  if (key === "platform") return true;
  if (allowedProducts.has(key)) return true;
  // Global Search registry maps the Knowledge provider to SearchProductId "documents".
  if (surfaceProductId === "documents" && allowedProducts.has("knowledge")) {
    return true;
  }
  return false;
}

export function filterByEntitledProducts<T extends { readonly productId: string }>(
  items: readonly T[],
  allowedProducts: ReadonlySet<string>,
): T[] {
  return items.filter((item) => isSurfaceEntitled(item.productId, allowedProducts));
}
