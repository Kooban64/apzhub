import type { SearchProductId } from "@apzhub/search-contracts";

export type GlobalSearchResult = {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly productId: SearchProductId;
  readonly productLabel: string;
  readonly href: string;
  readonly score?: number;
};

export type GlobalSearchGroup = {
  readonly productId: SearchProductId;
  readonly productLabel: string;
  readonly results: readonly GlobalSearchResult[];
};

export type GlobalSearchResponse = {
  readonly query: string;
  readonly groups: readonly GlobalSearchGroup[];
  readonly total: number;
  readonly tookMs: number;
};

export type GlobalSearchProviderDescriptor = {
  readonly id: string;
  readonly product: SearchProductId;
  readonly label: string;
  readonly capabilities: {
    readonly supportsFilters: boolean;
    readonly supportsHighlighting: boolean;
    readonly supportsPreview: boolean;
  };
};

export type GlobalSearchProvider = GlobalSearchProviderDescriptor & {
  search(
    query: string,
    ctx: GlobalSearchProviderContext,
  ): Promise<readonly GlobalSearchResult[]>;
};

export type GlobalSearchProviderContext = {
  readonly userPermissions: ReadonlySet<string>;
  readonly executeProductSearch: (
    productId: SearchProductId,
    query: string,
  ) => Promise<readonly GlobalSearchHitCandidate[]>;
};

export type GlobalSearchHitCandidate = {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly productId: SearchProductId;
  readonly href: string;
  readonly score?: number;
  readonly requiredPermissions?: readonly string[];
};
