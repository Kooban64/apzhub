"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { executeTestingCommand, type TestingCommandId } from "@/lib/testing/commands";
import { toTestingUserMessage } from "@/lib/testing/errors";
import { FIXTURE_IDS } from "@/lib/testing/mock-client";
import {
  canApproveCertification,
  canArchive,
  canExecute,
  canRegisterEvidence,
  canRejectCertification,
  canReviewCertification,
  type TestingPermissionSource,
} from "@/lib/testing/permissions";

export type TestingCommandsContext = {
  readonly executionId?: string;
  readonly certificationId?: string;
  readonly caseId?: string;
};

type CommandSpec = {
  readonly id: TestingCommandId;
  readonly label: string;
  readonly enabled: boolean;
  readonly testId: string;
};

export function TestingCommandsPanel({
  permissions,
  context,
  variant,
  onSuccess,
}: {
  readonly permissions?: TestingPermissionSource;
  readonly context: TestingCommandsContext;
  readonly variant: "execution" | "certification";
  readonly onSuccess?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [caseId, setCaseId] = useState<string>(context.caseId ?? FIXTURE_IDS.case);
  const [evidenceTitle, setEvidenceTitle] = useState("Execution evidence");
  const [comment, setComment] = useState("");

  const run = useMutation({
    mutationFn: async (commandId: TestingCommandId) => {
      switch (commandId) {
        case "start_execution":
          return executeTestingCommand(
            "start_execution",
            { caseId: caseId.trim() },
            permissions,
          );
        case "pause_execution":
          if (!context.executionId) throw new Error("Execution ID required.");
          return executeTestingCommand(
            "pause_execution",
            { executionId: context.executionId },
            permissions,
          );
        case "resume_execution":
          if (!context.executionId) throw new Error("Execution ID required.");
          return executeTestingCommand(
            "resume_execution",
            { executionId: context.executionId },
            permissions,
          );
        case "submit_evidence":
          if (!context.executionId) throw new Error("Execution ID required.");
          return executeTestingCommand(
            "submit_evidence",
            {
              executionId: context.executionId,
              title: evidenceTitle.trim() || "Execution evidence",
            },
            permissions,
          );
        case "review":
        case "approve":
        case "reject":
          if (!context.certificationId) throw new Error("Certification ID required.");
          return executeTestingCommand(
            commandId,
            {
              certificationId: context.certificationId,
              comment: comment.trim() || undefined,
            },
            permissions,
          );
        case "archive":
          if (!context.certificationId) throw new Error("Certification ID required.");
          return executeTestingCommand(
            "archive",
            { certificationId: context.certificationId },
            permissions,
          );
        default:
          throw new Error(`Unsupported command: ${commandId}`);
      }
    },
    onSuccess: () => {
      setError(null);
      onSuccess?.();
    },
    onError: (cause: unknown) => {
      setError(toTestingUserMessage(cause));
    },
  });

  const busy = run.isPending;

  const executionCommands: readonly CommandSpec[] =
    variant === "execution"
      ? [
          {
            id: "start_execution",
            label: "Start execution",
            enabled: canExecute(permissions),
            testId: "testing-command-start",
          },
          {
            id: "pause_execution",
            label: "Pause",
            enabled: canExecute(permissions) && Boolean(context.executionId),
            testId: "testing-command-pause",
          },
          {
            id: "resume_execution",
            label: "Resume",
            enabled: canExecute(permissions) && Boolean(context.executionId),
            testId: "testing-command-resume",
          },
          {
            id: "submit_evidence",
            label: "Submit evidence",
            enabled: canRegisterEvidence(permissions) && Boolean(context.executionId),
            testId: "testing-command-submit-evidence",
          },
        ]
      : [];

  const certificationCommands: readonly CommandSpec[] =
    variant === "certification"
      ? [
          {
            id: "review",
            label: "Send to review",
            enabled: canReviewCertification(permissions) && Boolean(context.certificationId),
            testId: "testing-command-review",
          },
          {
            id: "approve",
            label: "Approve",
            enabled: canApproveCertification(permissions) && Boolean(context.certificationId),
            testId: "testing-command-approve",
          },
          {
            id: "reject",
            label: "Reject",
            enabled: canRejectCertification(permissions) && Boolean(context.certificationId),
            testId: "testing-command-reject",
          },
          {
            id: "archive",
            label: "Archive",
            enabled: canArchive(permissions) && Boolean(context.certificationId),
            testId: "testing-command-archive",
          },
        ]
      : [];

  const commands = variant === "execution" ? executionCommands : certificationCommands;
  const visibleCommands = commands.filter((command) => command.enabled);

  if (visibleCommands.length === 0) return null;

  return (
    <div className="flex flex-col gap-3" data-testid="testing-commands-panel">
      {variant === "execution" && canExecute(permissions) && !context.executionId ? (
        <div className="max-w-md">
          <Input
            label="Case ID"
            value={caseId}
            onChange={(event) => setCaseId(event.target.value)}
            disabled={busy}
            data-testid="testing-command-case-id"
          />
        </div>
      ) : null}

      {variant === "execution" && canRegisterEvidence(permissions) && context.executionId ? (
        <div className="max-w-md">
          <Input
            label="Evidence title"
            value={evidenceTitle}
            onChange={(event) => setEvidenceTitle(event.target.value)}
            disabled={busy}
            data-testid="testing-command-evidence-title"
          />
        </div>
      ) : null}

      {variant === "certification" && context.certificationId ? (
        <div className="max-w-md">
          <Input
            label="Comment (optional)"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            disabled={busy}
            data-testid="testing-command-comment"
          />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {visibleCommands.map((command) => (
          <Button
            key={command.id}
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => run.mutate(command.id)}
            data-testid={command.testId}
          >
            {command.label}
          </Button>
        ))}
      </div>

      {error ? (
        <p className="text-sm text-[var(--color-muted-foreground)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
