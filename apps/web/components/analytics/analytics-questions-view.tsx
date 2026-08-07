"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  ENTERPRISE_QUESTION_CATALOGUE,
  QUESTION_DOMAINS,
  type QuestionDomain,
} from "@/lib/analytics/enterprise-questions";
import {
  canViewAnalytics,
  type AnalyticsPermissionSource,
} from "@/lib/analytics/permissions";
import { analyticsHomePath, analyticsQuestionDetailPath } from "@/lib/analytics/routes";

import { EmptyState, PageShell, ANALYTICS_PRODUCT_NAME } from "./analytics-ui";

export function AnalyticsQuestionsView({
  permissions,
}: {
  readonly permissions?: AnalyticsPermissionSource;
}) {
  const router = useRouter();
  const canView = canViewAnalytics(permissions);
  const [domain, setDomain] = useState<QuestionDomain | "all">("all");

  const items = useMemo(() => {
    if (domain === "all") return ENTERPRISE_QUESTION_CATALOGUE;
    return ENTERPRISE_QUESTION_CATALOGUE.filter((item) => item.domain === domain);
  }, [domain]);

  if (!canView) {
    return (
      <PageShell
        title="Enterprise questions"
        breadcrumbs={[ANALYTICS_PRODUCT_NAME, "Questions"]}
      >
        <EmptyState
          title="Permission required"
          description="You do not have permission to view the Enterprise Question Catalogue."
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Enterprise questions"
      description="Questions before reports. Select a business question to open its insight and decision context."
      breadcrumbs={[ANALYTICS_PRODUCT_NAME, "Questions"]}
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
      <div className="flex flex-wrap gap-2" data-testid="analytics-questions-domains">
        <Button
          type="button"
          size="sm"
          variant={domain === "all" ? "default" : "outline"}
          onClick={() => setDomain("all")}
        >
          All domains
        </Button>
        {QUESTION_DOMAINS.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={domain === item.id ? "default" : "outline"}
            onClick={() => setDomain(item.id)}
            data-testid={`analytics-questions-domain-${item.id}`}
          >
            {item.title}
          </Button>
        ))}
      </div>

      <ul
        className="mt-4 divide-y divide-[var(--color-border)] rounded-lg border border-[var(--color-border)]"
        data-testid="analytics-questions-catalogue"
      >
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="flex w-full flex-col gap-1 px-3 py-3 text-left hover:bg-[var(--color-muted)]/40"
              onClick={() => router.push(analyticsQuestionDetailPath(item.id))}
              data-testid={`analytics-question-row-${item.id}`}
            >
              <span className="font-medium">{item.question}</span>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                {item.id} · {item.domain} · {item.horizon}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {items.length === 0 ? (
        <EmptyState
          title="No questions in this domain"
          description="Choose another business domain."
        />
      ) : null}
    </PageShell>
  );
}
