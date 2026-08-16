"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { listKnowledgeObjects } from "@/lib/knowledge/organisational-memory-api";
import { knowledgeMemoryObjectPath } from "@/lib/knowledge/routes";

import { EmptyState, ErrorState, LoadingState } from "./knowledge-ui";

/**
 * Stream 4 — contextual memory suggestions for work surfaces.
 * Reuses organisational memory list; no spaces/collections CMS.
 */
export function KnowledgeContextualSuggestions({
  title = "Suggested for your work",
  description = "Trusted organisational memory that may apply to this context.",
  limit = 4,
  testId = "knowledge-contextual-suggestions",
  compact = false,
}: {
  readonly title?: string;
  readonly description?: string;
  readonly limit?: number;
  readonly testId?: string;
  readonly compact?: boolean;
}) {
  const router = useRouter();
  const query = useQuery({
    queryKey: ["knowledge", "objects", "contextual-suggestions"],
    queryFn: ({ signal }) => listKnowledgeObjects(undefined, { signal }),
  });

  const items = (query.data ?? []).slice(0, limit);

  return (
    <section className={compact ? "space-y-2" : "mt-6"} data-testid={testId}>
      <h2
        className={
          compact
            ? "text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]"
            : "mb-2 text-sm font-semibold"
        }
      >
        {title}
      </h2>
      {!compact ? (
        <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
          {description}
        </p>
      ) : null}
      {query.isLoading ? <LoadingState label="Loading suggestions…" /> : null}
      {query.isError ? (
        <ErrorState
          title="Unable to load suggestions"
          description="Organisational memory could not be loaded."
        />
      ) : null}
      {query.isSuccess && items.length === 0 ? (
        <EmptyState
          title="No suggestions yet"
          description="Capture a lesson or library item to surface memory here."
        />
      ) : null}
      {items.length > 0 ? (
        <ul className="grid gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="w-full rounded-lg border border-[var(--color-border)] p-3 text-left hover:bg-[var(--color-accent)]/40"
                onClick={() => router.push(knowledgeMemoryObjectPath(item.id))}
                data-testid={`${testId}-item-${item.id}`}
              >
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                  {item.kind} · {item.status}
                  {compact ? "" : ` — ${item.summary}`}
                </p>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
