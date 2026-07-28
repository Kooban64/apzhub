"use client";

import { useCallback, useState } from "react";

import { formatSupportDate } from "@/lib/support/format";
import { isSupportApiError } from "@/lib/support/errors";
import { renderableArticleBody } from "@/lib/support/sanitize-article-body";
import { downloadSupportAttachment } from "@/lib/support/support-api";
import type { SupportArticle, SupportArticleAttachment } from "@/lib/support/types";

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
  if (article.visibility === "internal" || article.channel === "note")
    return "Internal";
  return "Public";
}

function triggerBrowserDownload(
  filename: string,
  dataBase64: string,
  contentType: string,
) {
  const binary = atob(dataBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: contentType || "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function SupportConversation({
  articles,
  supportRequestId,
}: {
  readonly articles: readonly SupportArticle[];
  readonly supportRequestId: string;
}) {
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = useCallback(
    async (articleId: string, attachment: SupportArticleAttachment) => {
      setDownloadError(null);
      try {
        const result = await downloadSupportAttachment(
          supportRequestId,
          articleId,
          attachment.id,
        );
        triggerBrowserDownload(
          result.data.filename,
          result.data.dataBase64,
          result.data.contentType,
        );
      } catch (cause: unknown) {
        setDownloadError(
          isSupportApiError(cause) ? cause.message : "Unable to download attachment.",
        );
      }
    },
    [supportRequestId],
  );

  if (articles.length === 0) {
    return (
      <p
        className="text-sm text-[var(--color-muted-foreground)]"
        data-testid="support-conversation-empty"
      >
        No conversation articles yet.
      </p>
    );
  }

  const sorted = [...articles].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <div className="flex flex-col gap-2">
      {downloadError ? (
        <p className="text-sm text-[var(--color-muted-foreground)]" role="alert">
          {downloadError}
        </p>
      ) : null}
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
                  {article.author.displayName ??
                    article.author.email ??
                    article.senderType}
                </span>
                <span>{formatSupportDate(article.createdAt)}</span>
              </div>
              {article.subject ? (
                <p className="mt-2 text-sm font-medium">{article.subject}</p>
              ) : null}
              <p className="mt-2 whitespace-pre-wrap text-sm">{body.text}</p>
              <AttachmentMetadataList
                attachments={article.attachments}
                supportRequestId={supportRequestId}
                onDownload={(attachment) => {
                  void handleDownload(article.id, attachment);
                }}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
