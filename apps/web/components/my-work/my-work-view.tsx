"use client";

import type { MyWorkComposition, WorkCard } from "@apzhub/platform-service-contracts";
import { useSession } from "@apzhub/auth";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { fetchMyWorkComposition, isMyWorkApiError } from "@/lib/my-work/my-work-api";
import { myWorkQueryKeys } from "@/lib/my-work/query-keys";

function greetingName(
  sessionName: string | undefined | null,
  composed?: string,
): string {
  const name = sessionName?.trim() || composed?.trim();
  return name || "there";
}

function QueueSection({
  title,
  cards,
  testId,
}: {
  readonly title: string;
  readonly cards: readonly WorkCard[];
  readonly testId: string;
}) {
  const router = useRouter();

  return (
    <section
      className="flex flex-col gap-3"
      data-testid={testId}
      aria-labelledby={`${testId}-heading`}
    >
      <div className="flex items-baseline justify-between gap-2 border-b border-[var(--color-border)] pb-2">
        <h2
          id={`${testId}-heading`}
          className="text-sm font-semibold text-[var(--color-foreground)]"
        >
          {title}
        </h2>
        <span className="text-xs text-[var(--color-muted-foreground)]">
          {cards.length}
        </span>
      </div>
      {cards.length === 0 ? (
        <p
          className="text-sm text-[var(--color-muted-foreground)]"
          data-testid={`${testId}-empty`}
        >
          Nothing here right now.
        </p>
      ) : (
        <ul className="flex flex-col gap-1" role="list">
          {cards.map((card) => (
            <li key={card.id}>
              <button
                type="button"
                className="flex w-full items-start justify-between gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-[var(--color-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ring)]"
                onClick={() => router.push(card.href)}
                data-testid={`my-work-card-${card.id}`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-[var(--color-foreground)]">
                    {card.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[var(--color-muted-foreground)]">
                    {card.productLabel}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MyWorkBody({ composition }: { readonly composition: MyWorkComposition }) {
  return (
    <div className="flex flex-col gap-8" data-testid="my-work-queues">
      <QueueSection
        title="Needs My Attention"
        cards={composition.queues.needsMyAttention}
        testId="my-work-needs-attention"
      />
      <QueueSection
        title="Due Today"
        cards={composition.queues.dueToday}
        testId="my-work-due-today"
      />
      <QueueSection
        title="Waiting For Others"
        cards={composition.queues.waitingForOthers}
        testId="my-work-waiting"
      />
      <QueueSection
        title="Recently Completed"
        cards={composition.queues.recentlyCompleted}
        testId="my-work-completed"
      />
    </div>
  );
}

export function MyWorkView() {
  const { data: session } = useSession();
  const query = useQuery({
    queryKey: myWorkQueryKeys.composition(),
    queryFn: ({ signal }) => fetchMyWorkComposition({ signal }),
  });

  const name = greetingName(
    session?.user?.name ?? session?.user?.email,
    query.data?.displayName,
  );

  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-4 md:p-6"
      data-testid="my-work-view"
    >
      <header className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
          My Work
        </p>
        <h1
          className="text-2xl font-semibold text-[var(--color-foreground)]"
          data-testid="my-work-greeting"
        >
          Good morning, {name}.
        </h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          What do you need to do?
        </p>
      </header>

      {query.isLoading ? (
        <p
          className="text-sm text-[var(--color-muted-foreground)]"
          data-testid="my-work-loading"
        >
          Loading your work…
        </p>
      ) : null}

      {query.isError ? (
        <div
          className="rounded-md border border-[var(--color-border)] p-4 text-sm text-[var(--color-muted-foreground)]"
          data-testid="my-work-error"
          role="alert"
        >
          {isMyWorkApiError(query.error)
            ? query.error.message
            : "Unable to load My Work right now."}
        </div>
      ) : null}

      {query.data ? <MyWorkBody composition={query.data} /> : null}

      {query.data?.partial ? (
        <p
          className="text-xs text-[var(--color-muted-foreground)]"
          data-testid="my-work-partial"
        >
          Some product sources were unavailable. Showing what we could compose.
        </p>
      ) : null}
    </div>
  );
}
