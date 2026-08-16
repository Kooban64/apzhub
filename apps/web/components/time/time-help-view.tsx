"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import {
  timeDashboardPath,
  timeSettingsPath,
  timesheetCreatePath,
  timesheetsPath,
} from "@/lib/time/routes";

import { PageShell } from "./time-ui";

/**
 * Native APZHUB help for APZ Time — no engine documentation links.
 */
export function TimeHelpView() {
  const router = useRouter();

  return (
    <PageShell
      title="Help"
      description="Getting started with APZ Time inside APZHUB."
      breadcrumbs={["APZ Time", "Help"]}
    >
      <div className="grid gap-4 lg:grid-cols-2" data-testid="time-help">
        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Getting started</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--color-muted-foreground)]">
            <li>Open Timesheets from the APZ Time sidebar.</li>
            <li>Create a timesheet to track work you are doing now.</li>
            <li>Attach an activity, customer, and tags when relevant.</li>
            <li>Stop or archive timesheets when the work is complete.</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => router.push(timesheetCreatePath())}
              data-testid="time-help-create"
            >
              New timesheet
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(timesheetsPath())}
            >
              View timesheets
            </Button>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Where things live</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted-foreground)]">
            <li>
              <strong className="text-[var(--color-foreground)]">Recording</strong> —
              start/stop timer bar, week grid, and recent entries.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">Timesheets</strong> —
              your tracked time entries.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">
                Activities / Customers / Tags
              </strong>{" "}
              — classify work for timesheet context (not a reporting product).
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">Search</strong> — find
              timesheets and related records inside APZ Time (foundation search; not
              semantic AI search).
            </li>
          </ul>
        </section>

        <section
          className="rounded-lg border border-[var(--color-border)] p-4 text-sm text-[var(--color-muted-foreground)] lg:col-span-2"
          data-testid="time-help-limitations"
        >
          <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
            Current limitations
          </h2>
          <p className="mt-2">
            APZ Time v1.0 is honest about what is not complete. These are product limits
            — not temporary glitches.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-[var(--color-foreground)]">
                Approvals, reporting UI, analytics, dashboards, leave, scheduling, and
                AI
              </strong>{" "}
              are out of product identity for v1.0.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">Tags search</strong>{" "}
              may be partial depending on the durable time store.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">Production</strong>{" "}
              requires a durable time adapter — in-memory mode is forbidden in
              production and unavailable storage fails closed.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">
                Health and diagnostics
              </strong>{" "}
              are operator surfaces — not the default timesheet path.
            </li>
          </ul>
        </section>

        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Documentation</h2>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            APZ Time is an APZHUB product. Product behaviour and permissions are owned
            by APZHUB — not by any underlying engine. Ask your APZHUB administrator for
            organisation-specific guidance.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => router.push(timeDashboardPath())}
          >
            Back to Recording
          </Button>
        </section>

        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Support</h2>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            If something looks wrong, contact your APZHUB administrator. Prefer
            describing the APZ Time screen and action — never an engine or adapter name.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => router.push(timeSettingsPath())}
            data-testid="time-help-settings"
          >
            Open settings
          </Button>
        </section>
      </div>
    </PageShell>
  );
}
