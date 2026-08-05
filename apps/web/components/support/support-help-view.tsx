"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import {
  supportHelpPath,
  supportInboxPath,
  supportRequestCreatePath,
  supportSettingsPath,
} from "@/lib/support/routes";

import { PageShell } from "./support-ui";

/**
 * Native APZHUB help for APZ Support — no engine documentation links.
 */
export function SupportHelpView() {
  const router = useRouter();

  return (
    <PageShell
      title="Help"
      description="Getting started with APZ Support inside APZHUB."
      breadcrumbs={["APZ Support", "Help"]}
    >
      <div className="grid gap-4 lg:grid-cols-2" data-testid="support-help">
        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Getting started</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--color-muted-foreground)]">
            <li>Open Requests from the APZ Support sidebar.</li>
            <li>
              Create a request when you need help or are handling work for someone.
            </li>
            <li>Use Conversation for customer-visible replies and internal notes.</li>
            <li>Update status and ownership so progress stays visible.</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => router.push(supportRequestCreatePath())}
              data-testid="support-help-create"
            >
              New request
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(supportInboxPath())}
            >
              View requests
            </Button>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Where things live</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted-foreground)]">
            <li>
              <strong className="text-[var(--color-foreground)]">Requests</strong> — ask
              for help, follow progress, and reach resolution.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">
                Organisations / Groups / People
              </strong>{" "}
              — who the request is about and who is handling it.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">Search</strong> — find
              requests and related records inside APZ Support.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">Analytics</strong> — a
              snapshot of request activity for your organisation.
            </li>
          </ul>
        </section>

        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Documentation</h2>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            APZ Support is an APZHUB product. Product behaviour and permissions are
            owned by APZHUB — not by any underlying engine. Ask your APZHUB
            administrator for organisation-specific guidance.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => router.push(supportInboxPath())}
          >
            Back to Requests
          </Button>
        </section>

        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Need more help?</h2>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            If something looks wrong, contact your APZHUB administrator. Prefer
            describing the APZ Support screen and action — never an engine or adapter
            name.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(supportSettingsPath())}
              data-testid="support-help-settings"
            >
              Open settings
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(supportHelpPath())}
            >
              Refresh this page
            </Button>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
