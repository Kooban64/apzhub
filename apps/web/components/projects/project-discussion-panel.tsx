"use client";

/**
 * W007 Object Discussion panel — operational conversations (not chat).
 */

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import {
  createConversation,
  listConversationMessages,
  listConversations,
  postConversationMessage,
  resolveConversation,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";

import { ErrorState, LoadingState } from "./projects-ui";

const DECISION_OUTCOMES = [
  "approved",
  "rejected",
  "deferred",
  "superseded",
  "cancelled",
] as const;

export function ProjectDiscussionPanel({
  projectId,
  anchorType,
  anchorId,
  canWrite = false,
}: {
  readonly projectId: string;
  readonly anchorType: string;
  readonly anchorId: string;
  readonly canWrite?: boolean;
}) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [mention, setMention] = useState("");
  const [outcome, setOutcome] =
    useState<(typeof DECISION_OUTCOMES)[number]>("approved");
  const [error, setError] = useState<string | null>(null);

  const conversations = useQuery({
    queryKey: [
      ...projectsQueryKeys.all,
      "conversations",
      projectId,
      anchorType,
      anchorId,
    ],
    queryFn: ({ signal }) =>
      listConversations(projectId, { anchorType, anchorId }, { signal }),
  });

  const active = conversations.data?.[0];
  const isDecision =
    String(active?.conversationType) === "decision" || anchorType === "decision";

  const messages = useQuery({
    queryKey: [...projectsQueryKeys.all, "conversation-messages", active?.id],
    queryFn: ({ signal }) =>
      listConversationMessages(projectId, String(active!.id), { signal }),
    enabled: Boolean(active?.id),
  });

  const ensure = useMutation({
    mutationFn: () =>
      createConversation(projectId, {
        anchorType,
        anchorId,
        conversationType: anchorType === "decision" ? "decision" : undefined,
      }),
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Create failed.");
    },
  });

  const post = useMutation({
    mutationFn: async () => {
      let conversationId = active ? String(active.id) : "";
      if (!conversationId) {
        const created = await createConversation(projectId, {
          anchorType,
          anchorId,
          conversationType: anchorType === "decision" ? "decision" : undefined,
        });
        conversationId = String(created.id);
      }
      return postConversationMessage(projectId, conversationId, {
        body: body.trim(),
        mentionPrincipalIds: mention.trim() ? [mention.trim()] : undefined,
      });
    },
    onSuccess: async () => {
      setBody("");
      setMention("");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Post failed.");
    },
  });

  const resolve = useMutation({
    mutationFn: () =>
      resolveConversation(projectId, String(active!.id), {
        decisionOutcome: isDecision ? outcome : undefined,
        status: "resolved",
        summary: isDecision ? `Outcome: ${outcome}` : "Resolved",
      }),
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Resolve failed.");
    },
  });

  return (
    <section className="space-y-3" data-testid="object-discussion-panel">
      <h3 className="text-sm font-semibold">Discussion</h3>
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Object-anchored operational conversation — not a chat hub.
        {Number(active?.unreadCount ?? 0) > 0
          ? ` · ${String(active?.unreadCount)} unread`
          : ""}
      </p>
      {error ? <ErrorState message={error} /> : null}
      {conversations.isLoading ? <LoadingState label="Loading discussion…" /> : null}

      {!active && canWrite ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={ensure.isPending}
          onClick={() => ensure.mutate()}
        >
          Start discussion
        </Button>
      ) : null}

      {active ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">
          {String(active.conversationType)} · {String(active.status)}
          {active.decisionOutcome ? ` · ${String(active.decisionOutcome)}` : ""}
        </p>
      ) : null}

      <ul className="max-h-64 space-y-2 overflow-y-auto text-sm">
        {(messages.data ?? []).map((m) => (
          <li
            key={String(m.id)}
            className="border border-[var(--color-border)] px-2 py-1"
          >
            <p>{String(m.body)}</p>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {String(m.authorPrincipalId)} · {String(m.messageType)}
              {Array.isArray(m.mentionPrincipalIds) && m.mentionPrincipalIds.length > 0
                ? ` · @${m.mentionPrincipalIds.map(String).join(", @")}`
                : ""}
            </p>
          </li>
        ))}
        {active && (messages.data?.length ?? 0) === 0 && !messages.isLoading ? (
          <li className="text-[var(--color-muted-foreground)]">No messages yet.</li>
        ) : null}
      </ul>

      {canWrite && (!active || String(active.status) === "open") ? (
        <div className="flex flex-col gap-2">
          <Input
            label="Message"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <Input
            label="Mention principal (optional)"
            value={mention}
            onChange={(e) => setMention(e.target.value)}
          />
          <Button
            type="button"
            size="sm"
            disabled={!body.trim() || post.isPending}
            onClick={() => post.mutate()}
          >
            Post
          </Button>
        </div>
      ) : null}

      {canWrite && active && String(active.status) === "open" ? (
        <div className="flex flex-wrap items-end gap-2 border-t border-[var(--color-border)] pt-2">
          {isDecision ? (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Decision outcome</span>
              <select
                className="h-9 border border-[var(--color-border)] bg-transparent px-2"
                value={outcome}
                onChange={(e) =>
                  setOutcome(e.target.value as (typeof DECISION_OUTCOMES)[number])
                }
              >
                {DECISION_OUTCOMES.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={resolve.isPending}
            onClick={() => resolve.mutate()}
          >
            {isDecision ? "Record outcome & resolve" : "Resolve"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
