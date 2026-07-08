import type { ReactNode } from "react";

import { lawUxTokens } from "../tokens";
import { LawWorkspaceLayout } from "./workspace-layout";

export interface LawDetailPageLayoutProps {
  readonly header: ReactNode;
  readonly summaryCards?: ReactNode;
  readonly tabs?: ReactNode;
  readonly properties?: ReactNode;
  readonly timeline?: ReactNode;
  readonly documents?: ReactNode;
  readonly activity?: ReactNode;
  readonly contextPanel?: ReactNode;
}

/** Standard detail page layout with summary, tabs, and placeholders (LAW-001-02). */
export function LawDetailPageLayout({
  header,
  summaryCards,
  tabs,
  properties,
  timeline,
  documents,
  activity,
  contextPanel,
}: LawDetailPageLayoutProps) {
  return (
    <LawWorkspaceLayout header={header} contextPanel={contextPanel}>
      <div className={lawUxTokens.section} data-testid="law-detail-page-layout">
        {summaryCards ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summaryCards}
          </section>
        ) : null}
        {tabs}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
          <section className={lawUxTokens.section}>
            {properties ? (
              <section data-testid="law-detail-properties">{properties}</section>
            ) : null}
            {timeline ? (
              <section data-testid="law-detail-timeline">{timeline}</section>
            ) : null}
          </section>
          <aside className={lawUxTokens.section}>
            {documents ? (
              <section data-testid="law-detail-documents">{documents}</section>
            ) : null}
            {activity ? (
              <section data-testid="law-detail-activity">{activity}</section>
            ) : null}
          </aside>
        </div>
      </div>
    </LawWorkspaceLayout>
  );
}
