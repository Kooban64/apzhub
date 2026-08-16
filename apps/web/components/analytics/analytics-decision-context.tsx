"use client";

import Link from "next/link";

import type { EnterpriseQuestion } from "@/lib/analytics/enterprise-questions";

/** Map related product labels to workbench paths for drill-to-work. */
export function relatedProductWorkbenchPath(label: string): string | null {
  const normalized = label.trim().toLowerCase();
  if (normalized.includes("project")) return "/workspace/projects";
  if (normalized.includes("support")) return "/workspace/support";
  if (normalized.includes("time")) return "/workspace/time";
  if (normalized.includes("workflow")) return "/workspace/workflow";
  if (normalized.includes("document")) return "/workspace/documents";
  if (normalized.includes("knowledge")) return "/workspace/knowledge";
  return null;
}

/**
 * Decision Context — every insight communicates why it matters,
 * what changed, possible actions, related products, and evidence.
 */
export function AnalyticsDecisionContext({
  question,
}: {
  readonly question: EnterpriseQuestion;
}) {
  return (
    <section
      className="grid gap-3 rounded-lg border border-[var(--color-border)] p-4 md:grid-cols-2"
      data-testid="analytics-decision-context"
    >
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Why this matters
        </h3>
        <p className="mt-1 text-sm text-[var(--color-foreground)]">
          {question.whyItMatters}
        </p>
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
          What changed
        </h3>
        <p className="mt-1 text-sm text-[var(--color-foreground)]">
          {question.whatChanged}
        </p>
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Possible actions
        </h3>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-[var(--color-foreground)]">
          {question.possibleActions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Related products
        </h3>
        <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-[var(--color-foreground)]">
          {question.relatedProducts.map((product) => {
            const href = relatedProductWorkbenchPath(product);
            return (
              <li key={product}>
                {href ? (
                  <Link
                    href={href}
                    className="text-[var(--color-primary)] underline-offset-2 hover:underline"
                    data-testid={`analytics-related-product-${product
                      .replace(/\s+/g, "-")
                      .toLowerCase()}`}
                  >
                    {product}
                  </Link>
                ) : (
                  <span>{product}</span>
                )}
              </li>
            );
          })}
        </ul>
        <h3 className="mt-3 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Supporting evidence
        </h3>
        <p className="mt-1 text-sm text-[var(--color-foreground)]">
          {question.supportingEvidence}
        </p>
      </div>
    </section>
  );
}
