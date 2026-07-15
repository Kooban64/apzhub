import type { ListQuery } from "@apzhub/platform-service-contracts";
import type { PageRequest } from "@apzhub/platform-service-contracts";
import type { SortSpec } from "@apzhub/platform-service-contracts";

/** Normalises optional list query parameters for provider delegation. */
export function unwrapListQuery<TFilter, TSortField extends string = string>(
  query?: ListQuery<TFilter, TSortField>,
): {
  readonly page: PageRequest;
  readonly sort: SortSpec<TSortField>;
  readonly filter: TFilter;
} {
  return {
    page: query?.page ?? {},
    sort: query?.sort ?? [],
    filter: (query?.filter ?? {}) as TFilter,
  };
}
