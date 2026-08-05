"use client";

import { Button } from "@apzhub/ui";
import { useEffect, useState } from "react";

import {
  readCompactLists,
  readOnboardingDismissed,
  writeCompactLists,
  writeOnboardingDismissed,
} from "@/lib/documents/preferences";

import { DOCUMENTS_PRODUCT_NAME, PageShell } from "./documents-ui";

/**
 * APZ Documents product preferences only — never engine/adapter configuration.
 */
export function DocumentsSettingsView() {
  const [compactLists, setCompactLists] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCompactLists(readCompactLists());
    setOnboardingDismissed(readOnboardingDismissed());
  }, []);

  return (
    <PageShell
      title="Settings"
      description="Preferences for how APZ Documents appears in your workspace."
      breadcrumbs={[DOCUMENTS_PRODUCT_NAME, "Settings"]}
    >
      <form
        className="flex max-w-xl flex-col gap-4 rounded-lg border border-[var(--color-border)] p-4"
        data-testid="documents-settings"
        onSubmit={(event) => {
          event.preventDefault();
          writeCompactLists(compactLists);
          writeOnboardingDismissed(onboardingDismissed);
          setSaved(true);
        }}
      >
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={compactLists}
            onChange={(event) => {
              setCompactLists(event.target.checked);
              setSaved(false);
            }}
            data-testid="documents-settings-compact"
          />
          <span>
            <span className="font-medium text-[var(--color-foreground)]">
              Compact lists
            </span>
            <span className="mt-0.5 block text-[var(--color-muted-foreground)]">
              Prefer denser spacing in document tables when available.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={onboardingDismissed}
            onChange={(event) => {
              setOnboardingDismissed(event.target.checked);
              setSaved(false);
            }}
            data-testid="documents-settings-onboarding"
          />
          <span>
            <span className="font-medium text-[var(--color-foreground)]">
              Hide getting started tip
            </span>
            <span className="mt-0.5 block text-[var(--color-muted-foreground)]">
              Hide the work-companion tip on Overview.
            </span>
          </span>
        </label>

        <p className="text-xs text-[var(--color-muted-foreground)]">
          Engine and storage configuration is not managed here. Contact your APZHUB
          administrator for operational settings.
        </p>

        <div className="flex items-center gap-3">
          <Button type="submit" size="sm">
            Save preferences
          </Button>
          {saved ? (
            <span
              className="text-sm text-[var(--color-muted-foreground)]"
              role="status"
            >
              Saved
            </span>
          ) : null}
        </div>
      </form>
    </PageShell>
  );
}
