"use client";

import Link from "next/link";
import { useState } from "react";

import { QepPageShell, QepPanel } from "./qep-ui";

type QepMyWorkTab = "all" | "tests" | "defects" | "reviews" | "approvals";

const TABS: readonly { readonly id: QepMyWorkTab; readonly label: string }[] = [
  { id: "all", label: "All" },
  { id: "tests", label: "Tests" },
  { id: "defects", label: "Defects" },
  { id: "reviews", label: "Reviews" },
  { id: "approvals", label: "Approvals" },
];

const QUEUES: readonly {
  readonly id: Exclude<QepMyWorkTab, "all">;
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly cta: string;
}[] = [
  {
    id: "tests",
    title: "Test execution",
    description: "Manual and automated runs waiting for your attention.",
    href: "/workspace/qep/test-execution",
    cta: "Open execution",
  },
  {
    id: "defects",
    title: "Defects",
    description: "Investigation and retest work linked to quality evidence.",
    href: "/workspace/qep/defects",
    cta: "Open defects",
  },
  {
    id: "reviews",
    title: "Verification reviews",
    description: "Verification queue and team assignments.",
    href: "/workspace/qep/verification",
    cta: "Open verification",
  },
  {
    id: "approvals",
    title: "Quality Flow approvals",
    description: "Approvals and evidence outstanding on active quality flows.",
    href: "/workspace/qep/quality-flows",
    cta: "Open quality flows",
  },
];

/**
 * Stream 2 — QEP My Work (persona attention queues).
 * Aggregates existing workbenches; does not invent a parallel SoR.
 */
export function QepMyWorkView() {
  const [tab, setTab] = useState<QepMyWorkTab>("all");
  const visible = QUEUES.filter((q) => tab === "all" || q.id === tab);

  return (
    <QepPageShell
      title="My Work"
      description="What needs you in Quality — tests, defects, reviews, and approvals."
      breadcrumbs={["Quality", "My Work"]}
    >
      <div
        className="mb-4 flex flex-wrap gap-1 rounded-md border border-[var(--color-border)] p-0.5"
        role="tablist"
        aria-label="Quality My Work"
        data-testid="qep-my-work-tabs"
      >
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`rounded px-3 py-1.5 text-sm ${
              tab === item.id
                ? "bg-[var(--color-muted)] font-medium"
                : "text-[var(--color-muted-foreground)]"
            }`}
            onClick={() => setTab(item.id)}
            data-testid={`qep-my-work-tab-${item.id}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2" data-testid="qep-my-work-queues">
        {visible.map((queue) => (
          <QepPanel key={queue.id} title={queue.title}>
            <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
              {queue.description}
            </p>
            <Link
              href={queue.href}
              className="inline-flex h-8 items-center rounded-md bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-foreground)]"
              data-testid={`qep-my-work-open-${queue.id}`}
            >
              {queue.cta}
            </Link>
          </QepPanel>
        ))}
      </div>
    </QepPageShell>
  );
}
