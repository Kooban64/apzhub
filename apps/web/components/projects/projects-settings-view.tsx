"use client";

import { Button } from "@apzhub/ui";
import { useEffect, useState } from "react";

import {
  readCompactLists,
  readOnboardingDismissed,
  writeCompactLists,
  writeOnboardingDismissed,
} from "@/lib/projects/preferences";

import { PageShell } from "./projects-ui";

/**
 * APZ Projects product preferences only — never engine/adapter configuration.
 */
export function ProjectsSettingsView() {
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
      description="Preferences for how APZ Projects appears in your workspace."
      breadcrumbs={["APZ Projects", "Settings"]}
    >
      <form
        className="flex max-w-xl flex-col gap-4 rounded-lg border border-[var(--color-border)] p-4"
        data-testid="projects-settings"
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
            data-testid="projects-settings-compact"
          />
          <span>
            <span className="font-medium text-[var(--color-foreground)]">
              Compact lists
            </span>
            <span className="mt-0.5 block text-[var(--color-muted-foreground)]">
              Prefer denser spacing in project tables when available.
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
            data-testid="projects-settings-onboarding"
          />
          <span>
            <span className="font-medium text-[var(--color-foreground)]">
              Hide getting started tip
            </span>
            <span className="mt-0.5 block text-[var(--color-muted-foreground)]">
              Dismiss the Dashboard getting-started guidance for this browser.
            </span>
          </span>
        </label>

        <p className="text-xs text-[var(--color-muted-foreground)]">
          Engine and integration configuration is not available here. APZHUB
          administrators manage platform connectivity separately.
        </p>

        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" data-testid="projects-settings-save">
            Save preferences
          </Button>
          {saved ? (
            <span className="text-xs text-[var(--color-muted-foreground)]">Saved</span>
          ) : null}
        </div>
      </form>
    </PageShell>
  );
}
