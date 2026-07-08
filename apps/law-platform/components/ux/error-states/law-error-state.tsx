import type { ReactNode } from "react";

import { Button } from "@apzhub/ui";

import { lawUxTokens } from "../tokens";

export interface LawErrorStateProps {
  readonly title?: string;
  readonly message: string;
  readonly onRetry?: () => void;
  readonly action?: ReactNode;
}

/** Reusable error presentation (LAW-001-02). */
export function LawErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  action,
}: LawErrorStateProps) {
  return (
    <div
      className={`${lawUxTokens.surface} border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/5 px-6 py-8`}
      data-testid="law-error-state"
      role="alert"
    >
      <div className={lawUxTokens.stackSm}>
        <h2 className={lawUxTokens.headingSection}>{title}</h2>
        <p className={lawUxTokens.subtitle}>{message}</p>
      </div>
      <div className={`${lawUxTokens.row} mt-4`}>
        {onRetry ? (
          <Button type="button" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
        {action}
      </div>
    </div>
  );
}
