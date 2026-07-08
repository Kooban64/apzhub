import type { ReactNode } from "react";

import { Button } from "@apzhub/ui";

import {
  LAW_EMPTY_STATE_COPY,
  type LawEmptyStateVariant,
  lawUxTokens,
} from "../tokens";

export interface LawEmptyStateProps {
  readonly variant: LawEmptyStateVariant;
  readonly title?: string;
  readonly description?: string;
  readonly action?: ReactNode;
}

/** Reusable empty state presentation (LAW-001-02). */
export function LawEmptyState({
  variant,
  title,
  description,
  action,
}: LawEmptyStateProps) {
  const copy = LAW_EMPTY_STATE_COPY[variant];

  return (
    <div
      className={`${lawUxTokens.surface} ${lawUxTokens.accentBorder} flex flex-col items-center gap-3 border-dashed px-6 py-12 text-center`}
      data-testid={`law-empty-state-${variant}`}
    >
      <p className="text-lg font-medium text-[var(--color-foreground)]">
        {title ?? copy.title}
      </p>
      <p className="max-w-md text-sm text-[var(--color-muted-foreground)]">
        {description ?? copy.description}
      </p>
      {action}
    </div>
  );
}

export function LawEmptyStateAction(props: React.ComponentProps<typeof Button>) {
  return <Button variant="outline" {...props} />;
}
