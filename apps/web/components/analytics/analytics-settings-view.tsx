"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import {
  canAdminAnalytics,
  type AnalyticsPermissionSource,
} from "@/lib/analytics/permissions";
import {
  analyticsDatasetsPath,
  analyticsDiagnosticsPath,
  analyticsHealthPath,
  analyticsHomePath,
  analyticsReportsPath,
} from "@/lib/analytics/routes";

import { PageShell, ANALYTICS_PRODUCT_NAME } from "./analytics-ui";

/** Native settings — preferences for Decision Companion; admin tools secondary. */
export function AnalyticsSettingsView({
  permissions,
}: {
  readonly permissions?: AnalyticsPermissionSource;
}) {
  const router = useRouter();
  const isOperator = canAdminAnalytics(permissions);

  return (
    <PageShell
      title="Settings"
      description="Personalise your Decision Companion. Administrative reporting stays below the product boundary."
      breadcrumbs={[ANALYTICS_PRODUCT_NAME, "Settings"]}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(analyticsHomePath())}
        >
          Home
        </Button>
      }
    >
      <section
        className="rounded-lg border border-[var(--color-border)] p-4"
        data-testid="analytics-settings"
      >
        <h2 className="text-sm font-semibold">Experience</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          APZ Analytics opens on questions and horizons. Insight answers remain
          available from each question. Theme and locale follow APZHUB preferences.
        </p>
      </section>

      {isOperator ? (
        <section
          className="rounded-lg border border-dashed border-[var(--color-border)] p-4"
          data-testid="analytics-settings-operator"
        >
          <h2 className="text-sm font-semibold">Operator tools</h2>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Administrative reporting, datasets, health, and diagnostics are role-gated
            and secondary.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(analyticsDatasetsPath())}
            >
              Datasets
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(analyticsReportsPath())}
            >
              Reports
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(analyticsHealthPath())}
            >
              Health
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(analyticsDiagnosticsPath())}
            >
              Diagnostics
            </Button>
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
