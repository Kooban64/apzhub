"use client";

import { Button } from "@apzhub/ui";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { isSupportApiError } from "@/lib/support/errors";
import { readAttachmentFiles } from "@/lib/support/read-attachment-files";
import { createCustomerReply } from "@/lib/support/support-api";
import type {
  CustomerReplyChannel,
  SupportArticleAttachmentUpload,
} from "@/lib/support/types";

const CHANNELS: readonly CustomerReplyChannel[] = [
  "email",
  "phone",
  "web",
  "chat",
  "sms",
  "fax",
];

export function CustomerReplyComposer({
  supportRequestId,
  onCreated,
  disabled = false,
}: {
  readonly supportRequestId: string;
  readonly onCreated?: () => void;
  readonly disabled?: boolean;
}) {
  const [body, setBody] = useState("");
  const [channel, setChannel] = useState<CustomerReplyChannel>("email");
  const [attachments, setAttachments] = useState<
    readonly SupportArticleAttachmentUpload[]
  >([]);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createCustomerReply(supportRequestId, {
        body: body.trim(),
        channel,
        attachments: attachments.length > 0 ? attachments : undefined,
      }),
    onSuccess: () => {
      setBody("");
      setAttachments([]);
      setError(null);
      onCreated?.();
    },
    onError: (cause: unknown) => {
      setError(
        isSupportApiError(cause) ? cause.message : "Unable to send customer reply.",
      );
    },
  });

  const submitting = mutation.isPending;

  return (
    <form
      className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] p-3"
      data-testid="support-customer-reply-composer"
      onSubmit={(event) => {
        event.preventDefault();
        if (!body.trim() || submitting || disabled) return;
        mutation.mutate();
      }}
    >
      <div>
        <p className="text-sm font-medium">Customer reply</p>
        <p
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/30 px-2 py-1 text-xs"
          role="note"
          data-testid="support-customer-reply-warning"
        >
          Warning: this reply is customer-visible. It will not be saved as an internal
          note.
        </p>
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Channel</span>
        <select
          className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm"
          value={channel}
          onChange={(event) => setChannel(event.target.value as CustomerReplyChannel)}
          disabled={submitting || disabled}
          data-testid="support-customer-reply-channel"
        >
          {CHANNELS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <textarea
        className="min-h-24 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        required
        disabled={submitting || disabled}
        aria-label="Customer reply body"
        data-testid="support-customer-reply-body"
      />
      <input
        type="file"
        multiple
        disabled={submitting || disabled}
        aria-label="Attach files to customer reply"
        data-testid="support-customer-reply-attachments"
        onChange={(event) => {
          const files = event.target.files;
          if (!files?.length) {
            setAttachments([]);
            return;
          }
          void readAttachmentFiles(files)
            .then((next) => {
              setAttachments(next);
              setError(null);
            })
            .catch((cause: unknown) => {
              setAttachments([]);
              setError(
                cause instanceof Error ? cause.message : "Unable to read files.",
              );
            });
        }}
      />
      {attachments.length > 0 ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">
          {attachments.length} file(s) ready to upload
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-[var(--color-muted-foreground)]" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="sm"
          disabled={submitting || disabled || !body.trim()}
          data-testid="support-customer-reply-submit"
        >
          {submitting ? "Sending…" : "Send customer reply"}
        </Button>
      </div>
    </form>
  );
}
