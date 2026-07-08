import type { ReactNode } from "react";

import { lawUxTokens } from "../tokens";

export interface LawWorkspaceLayoutProps {
  readonly header?: ReactNode;
  readonly toolbar?: ReactNode;
  readonly children: ReactNode;
  readonly contextPanel?: ReactNode;
}

/**
 * Standard Law Platform module workspace layout (LAW-001-02).
 *
 * Header → Toolbar → Content → optional right Context Panel.
 */
export function LawWorkspaceLayout({
  header,
  toolbar,
  children,
  contextPanel,
}: LawWorkspaceLayoutProps) {
  return (
    <div className="flex min-h-full flex-col" data-testid="law-workspace-layout">
      {header ? (
        <div className="border-b border-[var(--color-border)] px-6 py-4">{header}</div>
      ) : null}
      {toolbar ? (
        <div className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/20 px-6 py-3">
          {toolbar}
        </div>
      ) : null}
      <div className="flex min-h-0 flex-1">
        <main className={`min-w-0 flex-1 ${lawUxTokens.page}`}>{children}</main>
        {contextPanel}
      </div>
    </div>
  );
}
