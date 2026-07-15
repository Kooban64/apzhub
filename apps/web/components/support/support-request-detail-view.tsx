"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { isSupportApiError } from "@/lib/support/errors";
import { formatSupportDate } from "@/lib/support/format";
import {
  canCreateSupportArticle,
  canListSupportArticles,
  type SupportPermissionSource,
} from "@/lib/support/permissions";
import { supportQueryKeys } from "@/lib/support/query-keys";
import {
  getSupportRequest,
  listSupportArticles,
  listSupportHistory,
} from "@/lib/support/support-api";

import { CustomerReplyComposer } from "./customer-reply-composer";
import { InternalNoteComposer } from "./internal-note-composer";
import { SupportConversation } from "./support-conversation";
import { SupportRequestCommands } from "./support-request-commands";
import {
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
} from "./support-ui";

export function SupportRequestDetailView({
  supportRequestId,
  permissions,
}: {
  readonly supportRequestId: string;
  readonly permissions?: SupportPermissionSource;
}) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"conversation" | "history">("conversation");

  const requestQuery = useQuery({
    queryKey: supportQueryKeys.requests.detail(supportRequestId),
    queryFn: ({ signal }) => getSupportRequest(supportRequestId, { signal }),
  });

  const articlesQuery = useQuery({
    queryKey: supportQueryKeys.requests.articles(supportRequestId),
    queryFn: ({ signal }) => listSupportArticles(supportRequestId, undefined, { signal }),
    enabled: canListSupportArticles(permissions) || permissions === undefined,
  });

  const historyQuery = useQuery({
    queryKey: supportQueryKeys.requests.history(supportRequestId),
    queryFn: ({ signal }) => listSupportHistory(supportRequestId, undefined, { signal }),
    enabled: tab === "history",
  });

  function invalidateAll() {
    void queryClient.invalidateQueries({
      queryKey: supportQueryKeys.requests.all,
    });
    void queryClient.invalidateQueries({
      queryKey: supportQueryKeys.requests.detail(supportRequestId),
    });
    void queryClient.invalidateQueries({
      queryKey: supportQueryKeys.requests.articles(supportRequestId),
    });
    void queryClient.invalidateQueries({
      queryKey: supportQueryKeys.requests.history(supportRequestId),
    });
    void queryClient.invalidateQueries({
      queryKey: supportQueryKeys.analytics(),
    });
  }

  if (requestQuery.isLoading) return <LoadingState />;
  if (requestQuery.isError || !requestQuery.data) {
    return (
      <ErrorState
        message={
          isSupportApiError(requestQuery.error)
            ? requestQuery.error.message
            : "Support request not found."
        }
        onRetry={() => void requestQuery.refetch()}
      />
    );
  }

  const request = requestQuery.data.data;
  const canCompose = canCreateSupportArticle(permissions) || permissions === undefined;

  return (
    <PageShell
      title={request.title}
      description={`Request ${request.displayId ?? request.id}`}
    >
      <div
        className="grid gap-4 rounded-lg border border-[var(--color-border)] p-4 md:grid-cols-2"
        data-testid="support-request-detail"
      >
        <div className="space-y-2 text-sm">
          <StatusBadge status={request.status} priority={request.priority} />
          <p>
            <span className="font-medium">Customer:</span> {request.requesterId}
          </p>
          <p>
            <span className="font-medium">Owner:</span> {request.assigneeId ?? "—"}
          </p>
          <p>
            <span className="font-medium">Group:</span> {request.groupId}
          </p>
          <p>
            <span className="font-medium">Organization:</span>{" "}
            {request.organizationId ?? "—"}
          </p>
          <p>
            <span className="font-medium">Created:</span>{" "}
            {formatSupportDate(request.createdAt)}
          </p>
          <p>
            <span className="font-medium">Updated:</span>{" "}
            {formatSupportDate(request.updatedAt)}
          </p>
        </div>
        <SupportRequestCommands
          request={request}
          permissions={permissions}
          onUpdated={invalidateAll}
        />
      </div>

      <div className="flex gap-2" role="tablist" aria-label="Request sections">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "conversation"}
          className={`rounded-md px-3 py-1.5 text-sm ${
            tab === "conversation"
              ? "bg-[var(--color-muted)] font-medium"
              : "text-[var(--color-muted-foreground)]"
          }`}
          onClick={() => setTab("conversation")}
          data-testid="support-tab-conversation"
        >
          Conversation
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "history"}
          className={`rounded-md px-3 py-1.5 text-sm ${
            tab === "history"
              ? "bg-[var(--color-muted)] font-medium"
              : "text-[var(--color-muted-foreground)]"
          }`}
          onClick={() => setTab("history")}
          data-testid="support-tab-history"
        >
          History
        </button>
      </div>

      {tab === "conversation" ? (
        <div className="flex flex-col gap-4" data-testid="support-conversation-panel">
          {articlesQuery.isLoading ? <LoadingState label="Loading conversation…" /> : null}
          {articlesQuery.isError ? (
            <ErrorState
              message={
                isSupportApiError(articlesQuery.error)
                  ? articlesQuery.error.message
                  : "Failed to load articles."
              }
              onRetry={() => void articlesQuery.refetch()}
            />
          ) : null}
          {articlesQuery.data ? (
            <SupportConversation articles={articlesQuery.data.data} />
          ) : null}
          {canCompose ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <InternalNoteComposer
                supportRequestId={supportRequestId}
                onCreated={invalidateAll}
              />
              <CustomerReplyComposer
                supportRequestId={supportRequestId}
                onCreated={invalidateAll}
              />
            </div>
          ) : null}
        </div>
      ) : (
        <div data-testid="support-history-panel">
          {historyQuery.isLoading ? <LoadingState label="Loading history…" /> : null}
          {historyQuery.isError ? (
            <ErrorState
              message={
                isSupportApiError(historyQuery.error)
                  ? historyQuery.error.message
                  : "Failed to load history."
              }
              onRetry={() => void historyQuery.refetch()}
            />
          ) : null}
          {historyQuery.data ? (
            <ol className="space-y-2">
              {historyQuery.data.data.map((event) => (
                <li
                  key={event.id}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                >
                  <p className="font-medium">{event.summary}</p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    {event.action} · {event.actor.displayName ?? event.actor.kind} ·{" "}
                    {formatSupportDate(event.occurredAt)}
                  </p>
                </li>
              ))}
              {historyQuery.data.data.length === 0 ? (
                <p className="text-sm text-[var(--color-muted-foreground)]">No history events.</p>
              ) : null}
            </ol>
          ) : null}
        </div>
      )}
    </PageShell>
  );
}
