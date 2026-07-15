"use client";

import { Button, Card, CardContent, CardHeader, CardTitle } from "@apzhub/ui";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";

import { formatBytes, formatSupportPriority, formatSupportStatus } from "@/lib/support/format";
import type {
  SupportArticleAttachment,
  SupportRequestPriority,
  SupportRequestStatus,
} from "@/lib/support/types";

export function PageShell({
  title,
  description,
  actions,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 p-1" data-testid="support-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Support
          </p>
          <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </header>
      {children}
    </div>
  );
}

export function LoadingState({ label = "Loading Support…" }: { readonly label?: string }) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] px-4 py-8 text-center text-sm text-[var(--color-muted-foreground)]"
      data-testid="support-loading"
      role="status"
    >
      {label}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
}) {
  return (
    <div
      className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-10 text-center"
      data-testid="support-empty"
    >
      <p className="font-medium text-[var(--color-foreground)]">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{description}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry?: () => void;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/30 px-4 py-6"
      data-testid="support-error"
      role="alert"
    >
      <p className="font-medium text-[var(--color-foreground)]">Unable to load Support</p>
      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{message}</p>
      {onRetry ? (
        <div className="mt-3">
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function StatusBadge({
  status,
  priority,
}: {
  readonly status?: SupportRequestStatus | string;
  readonly priority?: SupportRequestPriority | string;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-2" data-testid="support-status-badge">
      {status ? (
        <span
          className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2 py-0.5 text-xs"
          aria-label={`Status: ${formatSupportStatus(status)}`}
        >
          <span className="font-medium">Status:</span>
          <span>{formatSupportStatus(status)}</span>
        </span>
      ) : null}
      {priority ? (
        <span
          className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2 py-0.5 text-xs"
          aria-label={`Priority: ${formatSupportPriority(priority)}`}
        >
          <span className="font-medium">Priority:</span>
          <span>{formatSupportPriority(priority)}</span>
        </span>
      ) : null}
    </span>
  );
}

export function VisibilityBadge({
  visibility,
}: {
  readonly visibility: "internal" | "public" | string;
}) {
  const isInternal = visibility === "internal";
  const label = isInternal ? "Internal note" : "Customer-visible";
  return (
    <span
      className={
        isInternal
          ? "inline-flex rounded-md border border-dashed border-[var(--color-border)] px-2 py-0.5 text-xs font-medium text-[var(--color-foreground)]"
          : "inline-flex rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-0.5 text-xs font-medium text-[var(--color-foreground)]"
      }
      data-testid="support-visibility-badge"
      aria-label={label}
    >
      {label}
    </span>
  );
}

export function AttachmentMetadataList({
  attachments,
}: {
  readonly attachments: readonly SupportArticleAttachment[];
}) {
  if (attachments.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1 text-xs text-[var(--color-muted-foreground)]" data-testid="support-attachments">
      {attachments.map((attachment) => (
        <li
          key={attachment.id}
          className="rounded border border-[var(--color-border)] px-2 py-1"
        >
          <span className="font-medium text-[var(--color-foreground)]">{attachment.filename}</span>
          {" · "}
          {attachment.contentType ?? "unknown type"}
          {" · "}
          {formatBytes(attachment.sizeBytes)}
          {attachment.disposition ? ` · ${attachment.disposition}` : ""}
          <span className="block italic">Binary access not available</span>
        </li>
      ))}
    </ul>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  busy = false,
  onConfirm,
  onCancel,
}: {
  readonly open: boolean;
  readonly title: string;
  readonly description: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly busy?: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus();
    }
  }, [open]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!open) return;
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    },
    [open, onCancel],
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      data-testid="support-confirm-dialog"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-lg"
      >
        <h2 id={titleId} className="text-lg font-semibold">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          {description}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            data-testid="support-confirm-dialog-confirm"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function SupportStatCard({
  label,
  value,
  hint,
}: {
  readonly label: string;
  readonly value: string | number;
  readonly hint?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-[var(--color-muted-foreground)]">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
        {hint ? <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function SupportTable({
  columns,
  rows,
  onRowClick,
}: {
  readonly columns: readonly string[];
  readonly rows: readonly {
    readonly id: string;
    readonly cells: readonly ReactNode[];
  }[];
  readonly onRowClick?: (id: string) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
      <table className="min-w-full text-sm">
        <thead className="bg-[var(--color-muted)]/40 text-left">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-2 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-[var(--color-muted-foreground)]"
              >
                No records.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr
                key={row.id}
                className={
                  onRowClick
                    ? "cursor-pointer border-t border-[var(--color-border)] hover:bg-[var(--color-muted)]/30"
                    : "border-t border-[var(--color-border)]"
                }
                onClick={onRowClick ? () => onRowClick(row.id) : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          onRowClick(row.id);
                        }
                      }
                    : undefined
                }
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? "link" : undefined}
              >
                {row.cells.map((cell, cellIndex) => (
                  <td key={`${row.id}-${cellIndex}`} className="px-4 py-2 align-top">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
