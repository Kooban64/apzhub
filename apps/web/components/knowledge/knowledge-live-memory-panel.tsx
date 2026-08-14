"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { listKnowledgeObjects } from "@/lib/knowledge/organisational-memory-api";
import { knowledgeMemoryObjectPath } from "@/lib/knowledge/routes";

import { EmptyState, ErrorState, LoadingState } from "./knowledge-ui";

/** Live Wave A memory — supplements static companion/catalogue illustrations. */
export function KnowledgeLiveMemoryPanel({
  title = "Live organisational memory",
  limit = 6,
  testId = "knowledge-live-memory",
}: {
  readonly title?: string;
  readonly limit?: number;
  readonly testId?: string;
}) {
  const router = useRouter();
  const query = useQuery({
    queryKey: ["knowledge", "objects", "live-panel"],
    queryFn: ({ signal }) => listKnowledgeObjects(undefined, { signal }),
  });

  const items = (query.data ?? []).slice(0, limit);

  return (
    <section className="mt-6" data-testid={testId}>
      <h2 className="mb-2 text-sm font-semibold">{title}</h2>
      <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
        From the platform memory store — not illustrative catalogue entries.
      </p>
      {query.isLoading ? <LoadingState label="Loading memory…" /> : null}
      {query.isError ? (
        <ErrorState
          title="Unable to load live memory"
          description="Organisational memory could not be loaded from the platform store."
        />
      ) : null}
      {query.isSuccess && items.length === 0 ? (
        <EmptyState
          title="No memory objects yet"
          description="Capture a lesson or library item to see trusted memory here."
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
                  {item.kind} · {item.status} — {item.summary}
                </p>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
