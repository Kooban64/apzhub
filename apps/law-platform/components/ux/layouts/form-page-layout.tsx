import type { ReactNode } from "react";

import { Button } from "@apzhub/ui";

import { lawUxTokens } from "../tokens";
import { LawWorkspaceLayout } from "./workspace-layout";

export interface LawFormPageLayoutProps {
  readonly header: ReactNode;
  readonly sections: ReactNode;
  readonly validationSummary?: ReactNode;
  readonly onSave?: () => void;
  readonly onCancel?: () => void;
  readonly toolbar?: ReactNode;
}

/** Standard create/edit form layout — sections, validation, actions (LAW-001-02). */
export function LawFormPageLayout({
  header,
  sections,
  validationSummary,
  onSave,
  onCancel,
  toolbar,
}: LawFormPageLayoutProps) {
  const defaultToolbar = (
    <div className={lawUxTokens.row}>
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="button" onClick={onSave}>
        Save
      </Button>
    </div>
  );

  return (
    <LawWorkspaceLayout header={header} toolbar={toolbar ?? defaultToolbar}>
      <div className={lawUxTokens.section} data-testid="law-form-page-layout">
        {validationSummary ? (
          <section
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/30 px-4 py-3 text-sm text-[var(--color-muted-foreground)]"
            data-testid="law-form-validation-summary"
          >
            {validationSummary}
          </section>
        ) : null}
        <div className={lawUxTokens.section}>{sections}</div>
      </div>
    </LawWorkspaceLayout>
  );
}
