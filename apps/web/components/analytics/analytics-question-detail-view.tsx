"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import { getEnterpriseQuestion } from "@/lib/analytics/enterprise-questions";
import {
  canViewAnalytics,
  type AnalyticsPermissionSource,
} from "@/lib/analytics/permissions";
import {
  analyticsHorizonPath,
  analyticsHomePath,
  analyticsQuestionsPath,
  analyticsSuitePath,
  type AnalyticsHorizonKey,
} from "@/lib/analytics/routes";

import { AnalyticsDecisionContext } from "./analytics-decision-context";
import { EmptyState, PageShell, ANALYTICS_PRODUCT_NAME } from "./analytics-ui";

export function AnalyticsQuestionDetailView({
  questionId,
  permissions,
}: {
  readonly questionId: string;
  readonly permissions?: AnalyticsPermissionSource;
}) {
  const router = useRouter();
  const canView = canViewAnalytics(permissions);
  const question = getEnterpriseQuestion(questionId);

  if (!canView) {
    return (
      <PageShell title="Question" breadcrumbs={[ANALYTICS_PRODUCT_NAME, "Questions"]}>
        <EmptyState
          title="Permission required"
          description="You do not have permission to view this question."
        />
      </PageShell>
    );
  }

  if (!question) {
    return (
      <PageShell
        title="Unknown question"
        breadcrumbs={[ANALYTICS_PRODUCT_NAME, "Questions"]}
      >
        <EmptyState
          title="Question not found"
          description="Return to the Enterprise Question Catalogue."
          action={
            <Button
              type="button"
              size="sm"
              onClick={() => router.push(analyticsQuestionsPath())}
            >
              Question catalogue
            </Button>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={question.question}
      description="Question → Insight → Decision. Supporting evidence informs action — it is not the destination."
      breadcrumbs={[ANALYTICS_PRODUCT_NAME, "Questions", question.id]}
      actions={
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(analyticsQuestionsPath())}
          >
            Catalogue
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(analyticsHomePath())}
          >
            Home
          </Button>
        </>
      }
    >
      <div
        className="flex flex-wrap gap-2 text-xs text-[var(--color-muted-foreground)]"
        data-testid="analytics-question-meta"
      >
        <span>{question.id}</span>
        <span aria-hidden="true">·</span>
        <span>{question.domain}</span>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          className="underline-offset-2 hover:underline"
          onClick={() =>
            router.push(analyticsHorizonPath(question.horizon as AnalyticsHorizonKey))
          }
        >
          {question.horizon} horizon
        </button>
      </div>

      <AnalyticsDecisionContext question={question} />

      {question.answerSuite ? (
        <section
          className="rounded-lg border border-[var(--color-border)] p-4"
          data-testid="analytics-question-insight-answer"
        >
          <h2 className="text-sm font-semibold">Insight answer</h2>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Open the curated insight that answers this question. The visualisation is an
            answer — not the product.
          </p>
          <Button
            type="button"
            size="sm"
            className="mt-3"
            onClick={() => router.push(analyticsSuitePath(question.answerSuite!))}
            data-testid="analytics-question-open-answer"
          >
            Open insight answer
          </Button>
        </section>
      ) : null}
    </PageShell>
  );
}
