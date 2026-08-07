"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import {
  workflowApprovalsPath,
  workflowHomePath,
  workflowJourneysPath,
  workflowSettingsPath,
} from "@/lib/workflow/routes";

import { PageShell, WORKFLOW_PRODUCT_NAME } from "./workflow-ui";

/**
 * Native APZHUB help for APZ Workflow — business process framing; no engine docs.
 */
export function WorkflowHelpView() {
  const router = useRouter();

  return (
    <PageShell
      title="Help"
      description="How APZ Workflow models business processes inside APZHUB."
      breadcrumbs={[WORKFLOW_PRODUCT_NAME, "Help"]}
    >
      <div className="grid gap-4 lg:grid-cols-2" data-testid="workflow-help">
        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Getting started</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--color-muted-foreground)]">
            <li>
              Open Business journeys and choose a process the organisation recognises.
            </li>
            <li>
              Review outcomes, participants, and decisions — not execution mechanics.
            </li>
            <li>Use Approvals and Participants for work that needs your attention.</li>
            <li>Leave operational tools to authorised operators.</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => router.push(workflowJourneysPath())}
            >
              Business journeys
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(workflowHomePath())}
            >
              Workflow home
            </Button>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">What APZ Workflow is</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted-foreground)]">
            <li>The place to model, govern, and visualise business processes.</li>
            <li>Business intent — not an automation engine.</li>
            <li>Glue across Projects, Support, Time, and Documents.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(workflowApprovalsPath())}
            >
              Approvals
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(workflowSettingsPath())}
            >
              Settings
            </Button>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
