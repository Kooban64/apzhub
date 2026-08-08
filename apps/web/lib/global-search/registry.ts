import type { SearchProductId } from "@apzhub/search-contracts";

import type {
  GlobalSearchProvider,
  GlobalSearchProviderContext,
  GlobalSearchProviderDescriptor,
  GlobalSearchResult,
} from "./types";
import { filterByPermissions } from "./permissions";
import { toProductDeepLink } from "./deep-links";

/** Frozen Global Search v1 product surface (Owner inventory). */
export const GLOBAL_SEARCH_PRODUCTS: readonly GlobalSearchProviderDescriptor[] = [
  {
    id: "gs-projects",
    product: "projects",
    label: "Projects",
    capabilities: {
      supportsFilters: true,
      supportsHighlighting: true,
      supportsPreview: false,
    },
  },
  {
    id: "gs-support",
    product: "support",
    label: "Support",
    capabilities: {
      supportsFilters: true,
      supportsHighlighting: true,
      supportsPreview: false,
    },
  },
  {
    id: "gs-workflow",
    product: "workflow",
    label: "Workflow",
    capabilities: {
      supportsFilters: true,
      supportsHighlighting: true,
      supportsPreview: false,
    },
  },
  {
    id: "gs-knowledge",
    product: "documents",
    label: "Knowledge",
    capabilities: {
      supportsFilters: true,
      supportsHighlighting: true,
      supportsPreview: false,
    },
  },
  {
    id: "gs-time",
    product: "time",
    label: "Time",
    capabilities: {
      supportsFilters: true,
      supportsHighlighting: true,
      supportsPreview: false,
    },
  },
  {
    id: "gs-analytics",
    product: "analytics",
    label: "Analytics",
    capabilities: {
      supportsFilters: true,
      supportsHighlighting: true,
      supportsPreview: false,
    },
  },
  {
    id: "gs-qep",
    product: "qep",
    label: "QEP",
    capabilities: {
      supportsFilters: true,
      supportsHighlighting: true,
      supportsPreview: false,
    },
  },
] as const;

function createProvider(
  descriptor: GlobalSearchProviderDescriptor,
): GlobalSearchProvider {
  return {
    ...descriptor,
    async search(
      query: string,
      ctx: GlobalSearchProviderContext,
    ): Promise<readonly GlobalSearchResult[]> {
      const candidates = await ctx.executeProductSearch(descriptor.product, query);
      return filterByPermissions(candidates, ctx.userPermissions).map((hit) => ({
        id: hit.id,
        title: hit.title,
        description: hit.description,
        productId: descriptor.product,
        productLabel: descriptor.label,
        href: toProductDeepLink(hit.href, descriptor.product),
        score: hit.score,
      }));
    },
  };
}

export function listGlobalSearchProviders(): readonly GlobalSearchProvider[] {
  return GLOBAL_SEARCH_PRODUCTS.map(createProvider);
}

export function listGlobalSearchDescriptors(): readonly GlobalSearchProviderDescriptor[] {
  return GLOBAL_SEARCH_PRODUCTS;
}

export function labelForProduct(productId: SearchProductId): string {
  return (
    GLOBAL_SEARCH_PRODUCTS.find((p) => p.product === productId)?.label ?? productId
  );
}
