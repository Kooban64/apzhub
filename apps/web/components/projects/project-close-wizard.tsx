"use client";

/**
 * S-10 Project Close Wizard — sole project closure experience (no bypass).
 */

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import {
  getClosureReadiness,
  getProjectLifecycle,
  transitionProjectLifecycle,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";

import { ErrorState, LoadingState } from "./projects-ui";

const CLOSURE_OUTCOMES = [
  { value: "delivered", label: "Delivered" },
  { value: "delivered_with_variance", label: "Delivered with variance" },
  { value: "stopped", label: "Stopped" },
  { value: "superseded", label: "Superseded" },
] as const;

type Step = "outcome" | "summary" | "checklist" | "waivers" | "confirm";

const STEPS: readonly Step[] = [
  "outcome",
  "summary",
  "checklist",
  "waivers",
  "confirm",
];

function fieldClass() {
  return "h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2";
}

export function ProjectCloseWizard({
  projectId,
  onClose,
  onClosed,
}: {
  readonly projectId: string;
  readonly onClose: () => void;
  readonly onClosed?: () => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("outcome");
  const [outcome, setOutcome] = useState("");
  const [closureSummary, setClosureSummary] = useState("");
  const [waiverKeys, setWaiverKeys] = useState("");
  const [waiverReason, setWaiverReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const lifecycle = useQuery({
    queryKey: projectsQueryKeys.lifecycle(projectId),
    queryFn: ({ signal }) => getProjectLifecycle(projectId, { signal }),
  });

  const closure = useQuery({
    queryKey: projectsQueryKeys.closureReadiness(projectId),
    queryFn: ({ signal }) => getClosureReadiness(projectId, { signal }),
  });

  const stage = String(lifecycle.data?.stage ?? "");
  const stepIndex = STEPS.indexOf(step);

  const closeMutation = useMutation({
    mutationFn: async () => {
      const waivers =
        waiverKeys.trim() && waiverReason.trim()
          ? waiverKeys
              .split(/[,\s]+/)
              .map((k) => k.trim())
              .filter(Boolean)
              .map((policyKey) => ({
                policyKey,
                reason: waiverReason.trim(),
              }))
          : undefined;

      if (stage === "active" || stage === "on_hold") {
        await transitionProjectLifecycle(projectId, {
          to: "closing",
          outcome,
          closureSummary: closureSummary.trim(),
          waivers,
        });
      }
      return transitionProjectLifecycle(projectId, {
        to: "closed",
        outcome,
        closureSummary: closureSummary.trim(),
        waivers,
      });
    },
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
      onClosed?.();
      onClose();
    },
    onError: (err: unknown) => {
      setActionError(isProjectsApiError(err) ? err.message : "Close failed.");
    },
  });

  function canAdvance(): boolean {
    if (step === "outcome") return Boolean(outcome);
    if (step === "summary") return closureSummary.trim().length >= 8;
    if (step === "checklist") return true;
    if (step === "waivers") return true;
    return Boolean(closure.data?.ready && outcome && closureSummary.trim());
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
      data-testid="project-close-wizard-backdrop"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-lg border border-[var(--color-border)] bg-[var(--color-background)] shadow-lg"
        onClick={(event) => event.stopPropagation()}
        data-testid="project-close-wizard"
      >
        <header className="flex items-start justify-between gap-2 border-b border-[var(--color-border)] px-4 py-3">
          <div>
            <h2 id={titleId} className="text-base font-semibold">
              Close project
            </h2>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Step {stepIndex + 1} of {STEPS.length}: {step}
            </p>
          </div>
          <Button
            ref={closeRef}
            type="button"
            size="sm"
            variant="outline"
            onClick={onClose}
            data-testid="close-wizard-dismiss"
          >
            Cancel
          </Button>
        </header>

        <div className="space-y-3 px-4 py-3">
          {lifecycle.isLoading || closure.isLoading ? (
            <LoadingState label="Loading closure readiness…" />
          ) : null}

          {step === "outcome" ? (
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium">Closure outcome</span>
              <select
                className={fieldClass()}
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                data-testid="close-wizard-outcome"
              >
                <option value="">Select outcome</option>
                {CLOSURE_OUTCOMES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {step === "summary" ? (
            <Input
              label="Closure summary / evidence"
              value={closureSummary}
              onChange={(e) => setClosureSummary(e.target.value)}
              data-testid="close-wizard-summary"
            />
          ) : null}

          {step === "checklist" ? (
            <div data-testid="close-wizard-checklist">
              <p className="text-sm font-medium">
                Closure readiness — {closure.data?.ready ? "Ready" : "Blocked"}
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {(closure.data?.gaps ?? []).map((g) => (
                  <li key={g.code}>
                    {g.message}
                    {g.waivable ? ` (waivable: ${g.code})` : ""}
                  </li>
                ))}
                {(closure.data?.gaps ?? []).length === 0 ? (
                  <li>All closure criteria met.</li>
                ) : null}
              </ul>
              {!closure.data?.ready ? (
                <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                  Resolve blocking gaps before Confirm. Workflow approvals cannot be
                  waived.
                </p>
              ) : null}
            </div>
          ) : null}

          {step === "waivers" ? (
            <div className="space-y-2">
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Optional policy waivers for open work items only. Closure, hold,
                governance, checkpoint, and exception approvals are not waivable.
              </p>
              <Input
                label="Waiver policy keys (comma-separated)"
                value={waiverKeys}
                onChange={(e) => setWaiverKeys(e.target.value)}
                data-testid="close-wizard-waiver-keys"
              />
              <Input
                label="Waiver reason"
                value={waiverReason}
                onChange={(e) => setWaiverReason(e.target.value)}
                data-testid="close-wizard-waiver-reason"
              />
            </div>
          ) : null}

          {step === "confirm" ? (
            <div className="space-y-2 text-sm" data-testid="close-wizard-confirm">
              <p>
                <span className="text-[var(--color-muted-foreground)]">Outcome:</span>{" "}
                {outcome}
              </p>
              <p>
                <span className="text-[var(--color-muted-foreground)]">Summary:</span>{" "}
                {closureSummary}
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Confirm closes the project via the lifecycle gate. This is the only
                closure path.
              </p>
            </div>
          ) : null}

          {actionError ? <ErrorState message={actionError} /> : null}
        </div>

        <footer className="flex flex-wrap justify-between gap-2 border-t border-[var(--color-border)] px-4 py-3">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={stepIndex === 0 || closeMutation.isPending}
            onClick={() => setStep(STEPS[stepIndex - 1]!)}
            data-testid="close-wizard-back"
          >
            Back
          </Button>
          {step !== "confirm" ? (
            <Button
              type="button"
              size="sm"
              disabled={!canAdvance()}
              onClick={() => {
                const next = STEPS[stepIndex + 1]!;
                setStep(next);
                if (next === "checklist" || next === "confirm") {
                  void closure.refetch();
                }
              }}
              data-testid="close-wizard-next"
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={!canAdvance() || closeMutation.isPending}
              onClick={() => closeMutation.mutate()}
              data-testid="close-wizard-submit"
            >
              Confirm close
            </Button>
          )}
        </footer>
      </div>
    </div>
  );
}
