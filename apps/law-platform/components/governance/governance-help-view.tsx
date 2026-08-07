"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import {
  lawContextPath,
  lawHomePath,
  lawQuestionsPath,
  lawSettingsPath,
} from "../../lib/governance/routes";
import { LAW_PLATFORM_NAME } from "../../lib/law-platform-constants";

import { GovernancePage } from "./governance-shell";

export function GovernanceHelpView() {
  const router = useRouter();

  return (
    <GovernancePage
      title="Help"
      description="How APZ Law supports enterprise governance inside APZHUB."
      breadcrumbs={[LAW_PLATFORM_NAME, "Help"]}
    >
      <div className="grid gap-4 lg:grid-cols-2" data-testid="governance-help">
        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Getting started</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--color-muted-foreground)]">
            <li>Start from a governance question — not matters or billing.</li>
            <li>Understand which obligations apply to the business activity.</li>
            <li>Act in the related product with governance context in mind.</li>
            <li>Leave practice administration to authorised operators.</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => router.push(lawQuestionsPath())}
            >
              Governance questions
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(lawHomePath())}
            >
              Law home
            </Button>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">What APZ Law is</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted-foreground)]">
            <li>Your Governance Companion — obligations supporting work.</li>
            <li>Not legal advice and not a practice management system.</li>
            <li>Governance appears where work is performed (by reference).</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(lawContextPath())}
            >
              Governance in context
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(lawSettingsPath())}
            >
              Settings
            </Button>
          </div>
        </section>
      </div>
    </GovernancePage>
  );
}
