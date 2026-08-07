"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import {
  ENTERPRISE_QUESTION_CATALOGUE,
  INSIGHT_HORIZONS,
  listQuestionsByHorizon,
} from "@/lib/analytics/enterprise-questions";
import {
  canAdminAnalytics,
  canViewAnalytics,
  type AnalyticsPermissionSource,
} from "@/lib/analytics/permissions";
import {
  analyticsDecisionPacksPath,
  analyticsHelpPath,
  analyticsHorizonPath,
  analyticsKpisPath,
  analyticsQuestionDetailPath,
  analyticsQuestionsPath,
  analyticsSearchPath,
  analyticsSettingsPath,
  analyticsTimelinePath,
  analyticsTrendsPath,
  type AnalyticsHorizonKey,
} from "@/lib/analytics/routes";

import { EmptyState, PageShell, ANALYTICS_PRODUCT_NAME } from "./analytics-ui";

const COMPANION_LINKS = [
  {
    label: "Enterprise questions",
    path: analyticsQuestionsPath,
    testId: "analytics-home-link-questions",
  },
  {
    label: "Decision packs",
    path: analyticsDecisionPacksPath,
    testId: "analytics-home-link-packs",
  },
  {
    label: "Trends",
    path: analyticsTrendsPath,
    testId: "analytics-home-link-trends",
  },
  {
    label: "KPIs",
    path: analyticsKpisPath,
    testId: "analytics-home-link-kpis",
  },
  {
    label: "Decision timeline",
    path: analyticsTimelinePath,
    testId: "analytics-home-link-timeline",
  },
  {
    label: "Find an insight",
    path: analyticsSearchPath,
    testId: "analytics-home-link-search",
  },
  {
    label: "Help",
    path: analyticsHelpPath,
    testId: "analytics-home-link-help",
  },
  {
    label: "Settings",
    path: analyticsSettingsPath,
    testId: "analytics-home-link-settings",
  },
] as const;

export function AnalyticsHomeView({
  permissions,
}: {
  readonly permissions?: AnalyticsPermissionSource;
}) {
  const router = useRouter();
  const canView = canViewAnalytics(permissions);
  const isOperator = canAdminAnalytics(permissions);

  if (!canView) {
    return (
      <PageShell title="Home" breadcrumbs={[ANALYTICS_PRODUCT_NAME, "Home"]}>
        <EmptyState
          title="Permission required"
          description="You do not have permission to view APZ Analytics."
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Home"
      description="Your Decision Companion — begin with a business question, leave with a decision."
      breadcrumbs={[ANALYTICS_PRODUCT_NAME, "Home"]}
      actions={
        <Button
          type="button"
          size="sm"
          onClick={() => router.push(analyticsQuestionsPath())}
          data-testid="analytics-home-open-catalogue"
        >
          Open question catalogue
        </Button>
      }
    >
      <section data-testid="analytics-home-onboarding">
        <h2 className="mb-2 text-sm font-semibold">Start with a business question</h2>
        <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
          APZ Analytics is where better decisions are made. Choose a question the
          organisation needs answered — not a dashboard to browse.
        </p>
        <div className="flex flex-wrap gap-2" data-testid="analytics-home-links">
          {COMPANION_LINKS.map((link) => (
            <Button
              key={link.testId}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(link.path())}
              data-testid={link.testId}
            >
              {link.label}
            </Button>
          ))}
        </div>
      </section>

      <section data-testid="analytics-home-horizons">
        <h2 className="mb-2 text-sm font-semibold">Insight horizons</h2>
        <div className="grid gap-2 md:grid-cols-3">
          {INSIGHT_HORIZONS.map((horizon) => {
            const sample = listQuestionsByHorizon(horizon.id).slice(0, 3);
            return (
              <button
                key={horizon.id}
                type="button"
                className="flex flex-col rounded-lg border border-[var(--color-border)] px-3 py-3 text-left hover:bg-[var(--color-muted)]/30"
                data-testid={`analytics-home-horizon-${horizon.id}`}
                onClick={() =>
                  router.push(analyticsHorizonPath(horizon.id as AnalyticsHorizonKey))
                }
              >
                <span className="font-medium">{horizon.title}</span>
                <span className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
                  {horizon.prompt}
                </span>
                <ul className="mt-2 space-y-1 text-xs text-[var(--color-muted-foreground)]">
                  {sample.map((q) => (
                    <li key={q.id}>· {q.question}</li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </section>

      <section data-testid="analytics-home-questions">
        <h2 className="mb-2 text-sm font-semibold">Questions that need answers</h2>
        <ul className="grid gap-2 md:grid-cols-2">
          {ENTERPRISE_QUESTION_CATALOGUE.slice(0, 6).map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="flex w-full flex-col rounded-lg border border-[var(--color-border)] px-3 py-2 text-left hover:bg-[var(--color-muted)]/30"
                data-testid={`analytics-home-question-${item.id}`}
                onClick={() => router.push(analyticsQuestionDetailPath(item.id))}
              >
                <span className="font-medium">{item.question}</span>
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  {item.domain} · {item.horizon}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(analyticsQuestionsPath())}
            data-testid="analytics-home-view-all-questions"
          >
            View all enterprise questions
          </Button>
        </div>
      </section>

      {isOperator ? (
        <section
          className="rounded-lg border border-dashed border-[var(--color-border)] p-4"
          data-testid="analytics-home-operator-note"
        >
          <h2 className="text-sm font-semibold">Operator access</h2>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Datasets, reports, health, and diagnostics remain secondary operator tools.
            They do not define the primary Decision Companion experience.
          </p>
        </section>
      ) : null}
    </PageShell>
  );
}
