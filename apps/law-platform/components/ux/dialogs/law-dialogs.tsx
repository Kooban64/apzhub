"use client";

import type { ReactNode } from "react";

import { Button } from "@apzhub/ui";

export interface LawDialogProps {
  readonly open: boolean;
  readonly title: string;
  readonly description?: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly tone?: "default" | "destructive" | "success";
  readonly onConfirm?: () => void;
  readonly onCancel?: () => void;
  readonly children?: ReactNode;
}

function LawDialogFrame({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  onCancel,
  children,
  testId,
}: LawDialogProps & { readonly testId: string }) {
  if (!open) {
    return null;
  }

  const confirmVariant = tone === "destructive" ? "default" : "default";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      data-testid={testId}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${testId}-title`}
    >
      <div className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-lg">
        <div className="flex flex-col gap-2">
          <h2
            id={`${testId}-title`}
            className="text-lg font-semibold text-[var(--color-foreground)]"
          >
            {title}
          </h2>
          {description ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {description}
            </p>
          ) : null}
          {children}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          {confirmLabel && onConfirm ? (
            <Button
              type="button"
              variant={confirmVariant}
              className={
                tone === "destructive"
                  ? "bg-[var(--color-destructive)] text-white hover:opacity-90"
                  : tone === "success"
                    ? "bg-[var(--color-success)] text-[var(--color-success-foreground)] hover:opacity-90"
                    : undefined
              }
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function LawConfirmationDialog(props: Omit<LawDialogProps, "tone">) {
  return (
    <LawDialogFrame
      {...props}
      testId="law-confirmation-dialog"
      confirmLabel={props.confirmLabel ?? "Confirm"}
    />
  );
}

export function LawDeleteDialog(props: Omit<LawDialogProps, "tone">) {
  return (
    <LawDialogFrame
      {...props}
      tone="destructive"
      testId="law-delete-dialog"
      confirmLabel={props.confirmLabel ?? "Delete"}
    />
  );
}

export function LawSuccessDialog(
  props: Omit<LawDialogProps, "tone" | "cancelLabel" | "onCancel"> & {
    readonly onClose?: () => void;
  },
) {
  return (
    <LawDialogFrame
      {...props}
      tone="success"
      testId="law-success-dialog"
      confirmLabel={props.confirmLabel ?? "Done"}
      cancelLabel="Close"
      onCancel={props.onClose}
      onConfirm={props.onConfirm ?? props.onClose}
    />
  );
}
