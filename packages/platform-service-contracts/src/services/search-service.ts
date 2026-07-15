import type { ServiceRequestContext } from "../common/context";
import type { SearchResult, SearchSuggestion } from "../domain";
import type { SearchQueryInput, SearchSuggestInput } from "../inputs";

/** Vendor-neutral unified search operations (020). */
export interface SearchService {
  search(ctx: ServiceRequestContext, input: SearchQueryInput): Promise<SearchResult>;

  suggest(
    ctx: ServiceRequestContext,
    input: SearchSuggestInput,
  ): Promise<readonly SearchSuggestion[]>;
}
