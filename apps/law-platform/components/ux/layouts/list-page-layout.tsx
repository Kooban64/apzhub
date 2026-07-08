import type { ReactNode } from "react";

import { LawFilterBar } from "../filter-bar/law-filter-bar";
import { LawPagination } from "../pagination/law-pagination";
import { LawSearchBar } from "../search-bar/law-search-bar";
import { lawUxTokens } from "../tokens";
import { LawWorkspaceLayout } from "./workspace-layout";

export interface LawListPageLayoutProps {
  readonly header: ReactNode;
  readonly toolbar?: ReactNode;
  readonly searchArea?: ReactNode;
  readonly filtersArea?: ReactNode;
  readonly table: ReactNode;
  readonly pagination?: ReactNode;
  readonly state?: ReactNode;
  readonly contextPanel?: ReactNode;
}

/** Standard list page layout — search, filters, table, pagination (LAW-001-02). */
export function LawListPageLayout({
  header,
  toolbar,
  searchArea,
  filtersArea,
  table,
  pagination,
  state,
  contextPanel,
}: LawListPageLayoutProps) {
  return (
    <LawWorkspaceLayout header={header} toolbar={toolbar} contextPanel={contextPanel}>
      <div className={lawUxTokens.section} data-testid="law-list-page-layout">
        {searchArea ?? <LawSearchBar />}
        {filtersArea ?? <LawFilterBar />}
        {state}
        {table}
        {pagination ?? <LawPagination />}
      </div>
    </LawWorkspaceLayout>
  );
}
