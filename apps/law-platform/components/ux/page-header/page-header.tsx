import type { ReactNode } from "react";

import { Button } from "@apzhub/ui";

import { lawUxTokens } from "../tokens";

export interface LawPageHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly eyebrow?: string;
  readonly primaryAction?: ReactNode;
  readonly secondaryActions?: ReactNode;
}

/** Reusable page header — title, subtitle, and action slots (LAW-001-02). */
export function LawPageHeader({
  title,
  subtitle,
  eyebrow,
  primaryAction,
  secondaryActions,
}: LawPageHeaderProps) {
  return (
    <header className={lawUxTokens.rowBetween} data-testid="law-page-header">
      <div className={lawUxTokens.stackSm}>
        {eyebrow ? <p className={lawUxTokens.label}>{eyebrow}</p> : null}
        <h1 className={lawUxTokens.headingDisplay}>{title}</h1>
        {subtitle ? <p className={lawUxTokens.subtitle}>{subtitle}</p> : null}
      </div>
      {(primaryAction || secondaryActions) && (
        <div className={lawUxTokens.row} data-testid="law-page-header-actions">
          {secondaryActions}
          {primaryAction}
        </div>
      )}
    </header>
  );
}

export function LawPageHeaderButton(props: React.ComponentProps<typeof Button>) {
  return <Button {...props} />;
}
