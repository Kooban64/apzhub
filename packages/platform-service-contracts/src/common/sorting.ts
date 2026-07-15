/** Sorting contracts for list operations. */

export type SortDirection = "asc" | "desc";

export interface SortField<TField extends string = string> {
  readonly field: TField;
  readonly direction: SortDirection;
}

export type SortSpec<TField extends string = string> = readonly SortField<TField>[];
