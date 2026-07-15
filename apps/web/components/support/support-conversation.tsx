"use client";

import { formatSupportDate } from "@/lib/support/format";
import { renderableArticleBody } from "@/lib/support/sanitize-article-body";
import type { SupportArticle } from "@/lib/support/types";

import { AttachmentMetadataList, VisibilityBadge } from "./support-ui";

function articleBorderClass(article: SupportArticle): string {
  if (article.visibility === "internal" || article.channel === "note") {
    return "border-dashed border-[var(--color-border)] bg-[var(--color-muted)]/20";
  }
  if (article.senderType === "system") {
    return "border-dotted border-[var(--color-border)]";
  }
  return "border-[var(--color-border)]";
}

function articleKindLabel(article: SupportArticle): string {
  if (article.senderType === "system") return "System";
  if (article.visibility === "internal" || article.channel === "note") return "Internal";
  return "Public";
}

export function SupportConversation({
  articles,
}: {
  readonly articles: readonly SupportArticle[];
}) {
  if (articles.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted-foreground)]" data-testid="support-conversation-empty">
        No conversation articles yet.
      </p>
    );
  }

  const sorted = [...articles].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <ol className="flex flex-col gap-3" data-testid="support-conversation">
      {sorted.map((article) => {
        const body = renderableArticleBody(article.body, article.bodyFormat);
        return (
          <li
            key={article.id}
            className={`rounded-lg border p-3 ${articleBorderClass(article)}`}
            data-testid="support-conversation-item"
            data-visibility={article.visibility}
            data-sender={article.senderType}
          >
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
              <VisibilityBadge visibility={article.visibility} />
              <span className="rounded-md border border-[var(--color-border)] px-2 py-0.5">
                {articleKindLabel(article)}
              </span>
              <span>Channel: {article.channel}</span>
              <span>
                {article.author.displayName ?? article.author.email ?? article.senderType}
              </span>
              <span>{formatSupportDate(article.createdAt)}</span>
            </div>
            {article.subject ? (
              <p className="mt-2 text-sm font-medium">{article.subject}</p>
            ) : null}
            <p className="mt-2 whitespace-pre-wrap text-sm">{body.text}</p>
            <AttachmentMetadataList attachments={article.attachments} />
          </li>
        );
      })}
    </ol>
  );
}
