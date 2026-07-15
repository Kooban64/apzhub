"use client";

import { Button } from "@apzhub/ui";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { isSupportApiError } from "@/lib/support/errors";
import { createInternalNote } from "@/lib/support/support-api";

export function InternalNoteComposer({
  supportRequestId,
  onCreated,
  disabled = false,
}: {
  readonly supportRequestId: string;
  readonly onCreated?: () => void;
  readonly disabled?: boolean;
}) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => createInternalNote(supportRequestId, { body: body.trim() }),
    onSuccess: () => {
      setBody("");
      setError(null);
      onCreated?.();
    },
    onError: (cause: unknown) => {
      setError(
        isSupportApiError(cause) ? cause.message : "Unable to save internal note.",
      );
    },
  });

  const submitting = mutation.isPending;

  return (
    <form
      className="flex flex-col gap-3 rounded-lg border border-dashed border-[var(--color-border)] p-3"
      data-testid="support-internal-note-composer"
      onSubmit={(event) => {
        event.preventDefault();
        if (!body.trim() || submitting || disabled) return;
        mutation.mutate();
      }}
    >
      <div>
        <p className="text-sm font-medium">Internal note</p>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Visibility is fixed to Internal note. Customers cannot see this.
        </p>
      </div>
      <textarea
        className="min-h-24 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        required
        disabled={submitting || disabled}
        aria-label="Internal note body"
        data-testid="support-internal-note-body"
      />
      <input type="hidden" name="visibility" value="internal" readOnly />
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
          data-testid="support-internal-note-submit"
        >
          {submitting ? "Saving…" : "Add internal note"}
        </Button>
      </div>
    </form>
  );
}
