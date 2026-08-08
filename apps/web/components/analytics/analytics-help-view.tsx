"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import {
  analyticsHomePath,
  analyticsQuestionsPath,
  analyticsSettingsPath,
} from "@/lib/analytics/routes";

import { PageShell, ANALYTICS_PRODUCT_NAME } from "./analytics-ui";

/** Native APZHUB help — Decision Companion framing; no BI engine docs. */
export function AnalyticsHelpView() {
  const router = useRouter();

  return (
    <PageShell
      title="Help"
      description="How APZ Analytics supports better decisions inside APZHUB."
      breadcrumbs={[ANALYTICS_PRODUCT_NAME, "Help"]}
    >
      <div className="grid gap-4 lg:grid-cols-2" data-testid="analytics-help">
        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Getting started</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--color-muted-foreground)]">
            <li>Start from a business question — not a dashboard catalogue.</li>
            <li>Open the insight answer for evidence.</li>
            <li>Use Decision Context to choose an action in a related product.</li>
            <li>Leave datasets, reports, and diagnostics to operators.</li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => router.push(analyticsQuestionsPath())}
            >
              Enterprise questions
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(analyticsHomePath())}
            >
              Analytics home
            </Button>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">What APZ Analytics is</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted-foreground)]">
            <li>Your Decision Companion — where better decisions are made.</li>
            <li>Questions and insights before visualisations.</li>
            <li>
              Consumes Projects, Support, Time, Workflow, and Quality — never owns them.
            </li>
          </ul>
          <div className="mt-4">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(analyticsSettingsPath())}
            >
              Settings
            </Button>
          </div>
        </section>

        <section
          className="rounded-lg border border-[var(--color-border)] p-4 lg:col-span-2"
          data-testid="analytics-help-limitations"
        >
          <h2 className="text-sm font-semibold">Current limitations</h2>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            APZ Analytics v1.0 is honest about what is not complete. These are product
            limits — not temporary glitches.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted-foreground)]">
            <li>
              <strong className="text-[var(--color-foreground)]">
                Live visual embed
              </strong>{" "}
              is not available. Insight answers show evidence metadata through APZHUB
              only.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">
                Catalogue search
              </strong>{" "}
              filters titles and descriptions in the Workbench — not a full semantic
              search product.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">
                Datasets, reports, health, and diagnostics
              </strong>{" "}
              are operator surfaces — not the default Decision Companion path.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">
                AI / predictive
              </strong>{" "}
              analytics and product alerting are out of scope for v1.0.
            </li>
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
