"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { QepPageShell, QepPanel } from "./qep-ui";

type KnowledgeArticle = {
  articleId: string;
  title: string;
  body: string;
  status: "draft" | "published";
  tags: string[];
  updatedAt: string;
  createdBy: string;
};

async function fetchArticles(): Promise<readonly KnowledgeArticle[]> {
  const res = await fetch("/api/v1/qep/knowledge");
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Failed to load articles");
  return (body.data?.items ?? []) as KnowledgeArticle[];
}

async function postKnowledge(payload: Record<string, unknown>) {
  const res = await fetch("/api/v1/qep/knowledge", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Knowledge action failed");
  return body.data;
}

export function QepKnowledgeRouterView() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["qep", "knowledge"], queryFn: fetchArticles });
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");

  const create = useMutation({
    mutationFn: () =>
      postKnowledge({
        action: "create",
        title,
        body,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    onSuccess: () => {
      setTitle("");
      setBody("");
      setTags("");
      void qc.invalidateQueries({ queryKey: ["qep", "knowledge"] });
    },
  });

  return (
    <QepPageShell
      title="Learning"
      description="QE knowledge base — draft and publish reusable practice articles (M16)."
      breadcrumbs={["QEP", "Learning"]}
    >
      <div className="mb-4 flex flex-wrap gap-2 text-xs">
        <Link
          href="/workspace/qep/verification-design"
          className="text-[var(--color-primary)] underline-offset-2 hover:underline"
        >
          Verification Design
        </Link>
      </div>

      <QepPanel title="Create draft article">
        <div className="flex flex-col gap-2">
          <input
            className="h-8 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
            placeholder="Article title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="min-h-[80px] rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1.5 text-xs"
            placeholder="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <input
            className="h-8 rounded border border-[var(--color-border)] bg-[var(--color-background)] px-2 text-xs"
            placeholder="Tags (comma-separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
          <button
            type="button"
            className="h-8 w-fit rounded bg-[var(--color-primary)] px-3 text-xs text-[var(--color-primary-foreground)] disabled:opacity-50"
            disabled={!title.trim() || create.isPending}
            onClick={() => create.mutate()}
          >
            Save draft
          </button>
        </div>
        {create.error ? (
          <p className="mt-2 text-xs text-[var(--color-destructive)]">
            {(create.error as Error).message}
          </p>
        ) : null}
      </QepPanel>

      <QepPanel title="Articles">
        {q.isLoading ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
        ) : null}
        {q.error ? (
          <p className="text-xs text-[var(--color-destructive)]">
            {(q.error as Error).message}
          </p>
        ) : null}
        {(q.data?.length ?? 0) === 0 ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">
            No articles yet. Capture QE practice notes as drafts, then publish for
            reuse.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)] rounded border border-[var(--color-border)]">
            {(q.data ?? []).map((a) => (
              <li
                key={a.articleId}
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 text-xs"
              >
                <div>
                  <p className="font-medium">{a.title}</p>
                  <p className="font-mono text-[10px] text-[var(--color-muted-foreground)]">
                    {a.articleId} · {a.status}
                    {a.tags.length > 0 ? ` · ${a.tags.join(", ")}` : ""}
                  </p>
                  {a.body ? (
                    <p className="mt-1 line-clamp-2 text-[var(--color-muted-foreground)]">
                      {a.body}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  {a.status === "draft" ? (
                    <button
                      type="button"
                      className="text-[var(--color-primary)]"
                      onClick={() =>
                        void postKnowledge({
                          action: "publish",
                          articleId: a.articleId,
                        }).then(() =>
                          qc.invalidateQueries({ queryKey: ["qep", "knowledge"] }),
                        )
                      }
                    >
                      Publish
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </QepPanel>
    </QepPageShell>
  );
}
