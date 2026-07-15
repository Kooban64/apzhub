import type { ServiceRequestContext } from "../common/context";
import type { ListQuery } from "../common/list-query";
import type { SupportSearchResult } from "../domain";
import type { SupportSearchFilter, SupportSearchSortField } from "../queries";

/** Vendor-neutral Support search operations. */
export interface SupportSearchService {
  search(
    ctx: ServiceRequestContext,
    queryText: string,
    query?: ListQuery<SupportSearchFilter, SupportSearchSortField>,
  ): Promise<SupportSearchResult>;
}
