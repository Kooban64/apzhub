import type { SearchProductId } from "@apzhub/search-contracts";
import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import { getPlatformServiceGateway } from "@/lib/api/v1/gateway/bootstrap";

import { listGlobalSearchProviders } from "./registry";
import type {
  GlobalSearchGroup,
  GlobalSearchHitCandidate,
  GlobalSearchResponse,
} from "./types";

const PAGE_SIZE = 8;

async function executeProductSearch(
  serviceContext: ServiceRequestContext,
  productId: SearchProductId,
  query: string,
): Promise<readonly GlobalSearchHitCandidate[]> {
  try {
    const gateway = await getPlatformServiceGateway();
    const result = await gateway.searchExecution.execute(serviceContext, {
      query: {
        keywords: query,
        products: [productId],
        page: 1,
        pageSize: PAGE_SIZE,
        includeHighlights: true,
      },
      correlationId: serviceContext.correlationId,
    });
    return result.page.hits.map((hit) => ({
      id: hit.id,
      title: hit.metadata.title,
      description: hit.metadata.description,
      productId: hit.metadata.productId,
      href: hit.metadata.navigationTarget ?? "",
      score: hit.score,
      requiredPermissions: hit.metadata.permissions,
    }));
  } catch {
    // Fail closed per product — aggregator still returns other groups.
    return [];
  }
}

export async function runGlobalSearch(input: {
  readonly query: string;
  readonly serviceContext: ServiceRequestContext;
  readonly userPermissions: readonly string[];
}): Promise<GlobalSearchResponse> {
  const started = Date.now();
  const query = input.query.trim();
  if (query.length === 0) {
    return { query, groups: [], total: 0, tookMs: 0 };
  }

  const permissionSet = new Set(input.userPermissions);
  const providers = listGlobalSearchProviders();
  const ctx = {
    userPermissions: permissionSet,
    executeProductSearch: (productId: SearchProductId, q: string) =>
      executeProductSearch(input.serviceContext, productId, q),
  };

  const settled = await Promise.all(
    providers.map(async (provider) => {
      const results = await provider.search(query, ctx);
      return {
        productId: provider.product,
        productLabel: provider.label,
        results,
      } satisfies GlobalSearchGroup;
    }),
  );

  const groups = settled.filter((group) => group.results.length > 0);
  const total = groups.reduce((sum, group) => sum + group.results.length, 0);

  return {
    query,
    groups,
    total,
    tookMs: Date.now() - started,
  };
}
