"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import {
  getInsightHorizon,
  listQuestionsByHorizon,
} from "@/lib/analytics/enterprise-questions";
import {
  canViewAnalytics,
  type AnalyticsPermissionSource,
} from "@/lib/analytics/permissions";
import {
  analyticsHomePath,
  analyticsQuestionDetailPath,
  analyticsQuestionsPath,
  type AnalyticsHorizonKey,
} from "@/lib/analytics/routes";

import { EmptyState, PageShell, ANALYTICS_PRODUCT_NAME } from "./analytics-ui";

export function AnalyticsHorizonView({
  horizonKey,
  permissions,
}: {
  readonly horizonKey: AnalyticsHorizonKey;
  readonly permissions?: AnalyticsPermissionSource;
}) {
  const router = useRouter();
  const canView = canViewAnalytics(permissions);
  const horizon = getInsightHorizon(horizonKey);
  const questions = listQuestionsByHorizon(horizonKey);

  if (!canView) {
    return (
      <PageShell title="Horizon" breadcrumbs={[ANALYTICS_PRODUCT_NAME]}>
        <EmptyState
          title="Permission required"
          description="You do not have permission to view insight horizons."
        />
      </PageShell>
    );
  }

  if (!horizon) {
    return (
      <PageShell title="Unknown horizon" breadcrumbs={[ANALYTICS_PRODUCT_NAME]}>
        <EmptyState
          title="Horizon not found"
          description="Return to APZ Analytics Home."
          action={
            <Button
              type="button"
              size="sm"
              onClick={() => router.push(analyticsHomePath())}
            >
              Home
            </Button>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={horizon.title}
      description={`${horizon.prompt} — ${horizon.description}`}
      breadcrumbs={[ANALYTICS_PRODUCT_NAME, "Horizons", horizon.title]}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(analyticsQuestionsPath())}
        >
          All questions
        </Button>
      }
    >
      <ul
        className="divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]"
        data-testid={`analytics-horizon-${horizonKey}`}
      >
        {questions.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="flex w-full flex-col gap-1 px-3 py-3 text-left hover:bg-[var(--color-muted)]/40"
              onClick={() => router.push(analyticsQuestionDetailPath(item.id))}
              data-testid={`analytics-horizon-question-${item.id}`}
            >
              <span className="font-medium">{item.question}</span>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                {item.whyItMatters}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
