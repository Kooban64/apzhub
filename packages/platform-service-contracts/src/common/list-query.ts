import type { PageRequest } from "./paging";
import type { SortSpec } from "./sorting";

/** Combines paging, sorting, and domain filter for list operations. */
export interface ListQuery<TFilter = undefined, TSortField extends string = string> {
  readonly page?: PageRequest;
  readonly sort?: SortSpec<TSortField>;
  readonly filter?: TFilter;
}
