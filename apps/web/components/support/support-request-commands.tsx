"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { isSupportApiError } from "@/lib/support/errors";
import {
  canAssignSupportRequest,
  canTransitionSupportRequest,
  canUpdateSupportRequest,
  type SupportPermissionSource,
} from "@/lib/support/permissions";
import {
  assignSupportRequestOwner,
  changeSupportRequestCustomer,
  changeSupportRequestPriority,
  changeSupportRequestState,
  closeSupportRequest,
  removeSupportRequestOwner,
  reopenSupportRequest,
} from "@/lib/support/support-api";
import type {
  SupportRequest,
  SupportRequestPriority,
  SupportRequestStatus,
} from "@/lib/support/types";

import { ConfirmDialog } from "./support-ui";

const STATUSES: readonly SupportRequestStatus[] = [
  "new",
  "open",
  "pending",
  "closed",
  "merged",
];
const PRIORITIES: readonly SupportRequestPriority[] = [
  "low",
  "normal",
  "high",
  "urgent",
];

export function SupportRequestCommands({
  request,
  permissions,
  onUpdated,
}: {
  readonly request: SupportRequest;
  readonly permissions?: SupportPermissionSource;
  readonly onUpdated?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [closeOpen, setCloseOpen] = useState(false);
  const [ownerId, setOwnerId] = useState(request.assigneeId ?? "");
  const [customerId, setCustomerId] = useState(request.requesterId);
  const [status, setStatus] = useState<SupportRequestStatus>(request.status);
  const [priority, setPriority] = useState<SupportRequestPriority>(request.priority);

  const canTransition = canTransitionSupportRequest(permissions);
  const canUpdate = canUpdateSupportRequest(permissions);
  const canAssign = canAssignSupportRequest(permissions);

  const run = useMutation({
    mutationFn: async (action: () => Promise<unknown>) => action(),
    onSuccess: () => {
      setError(null);
      onUpdated?.();
    },
    onError: (cause: unknown) => {
      setError(isSupportApiError(cause) ? cause.message : "Command failed.");
    },
  });

  const busy = run.isPending;
  const isClosed = request.status === "closed";

  return (
    <div className="flex flex-col gap-3" data-testid="support-request-commands">
      <div className="flex flex-wrap gap-2">
        {canTransition && !isClosed ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => setCloseOpen(true)}
            data-testid="support-command-close"
          >
            Close
          </Button>
        ) : null}
        {canTransition && isClosed ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => run.mutate(() => reopenSupportRequest(request.id))}
            data-testid="support-command-reopen"
          >
            Reopen
          </Button>
        ) : null}
      </div>

      {canTransition ? (
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">State</span>
            <select
              className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as SupportRequestStatus)
              }
              disabled={busy}
              data-testid="support-command-state"
            >
              {STATUSES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy || status === request.status}
            onClick={() =>
              run.mutate(() => changeSupportRequestState(request.id, status))
            }
            data-testid="support-command-state-apply"
          >
            Apply state
          </Button>
        </div>
      ) : null}

      {canUpdate ? (
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Priority</span>
            <select
              className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm"
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as SupportRequestPriority)
              }
              disabled={busy}
              data-testid="support-command-priority"
            >
              {PRIORITIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy || priority === request.priority}
            onClick={() =>
              run.mutate(() => changeSupportRequestPriority(request.id, priority))
            }
            data-testid="support-command-priority-apply"
          >
            Apply priority
          </Button>
        </div>
      ) : null}

      {canAssign ? (
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[220px] flex-1">
            <Input
              label="Owner"
              value={ownerId}
              onChange={(event) => setOwnerId(event.target.value)}
              disabled={busy}
              data-testid="support-command-owner"
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy || !ownerId.trim()}
            onClick={() =>
              run.mutate(() => assignSupportRequestOwner(request.id, ownerId.trim()))
            }
            data-testid="support-command-owner-assign"
          >
            Assign owner
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={busy || !request.assigneeId}
            onClick={() => run.mutate(() => removeSupportRequestOwner(request.id))}
            data-testid="support-command-owner-remove"
          >
            Remove owner
          </Button>
        </div>
      ) : null}

      {canUpdate ? (
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[220px] flex-1">
            <Input
              label="Customer"
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              disabled={busy}
              data-testid="support-command-customer"
            />
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy || !customerId.trim()}
            onClick={() =>
              run.mutate(() =>
                changeSupportRequestCustomer(request.id, customerId.trim()),
              )
            }
            data-testid="support-command-customer-apply"
          >
            Change customer
          </Button>
        </div>
      ) : null}

      {error ? (
        <p className="text-sm text-[var(--color-muted-foreground)]" role="alert">
          {error}
        </p>
      ) : null}

      <ConfirmDialog
        open={closeOpen}
        title="Close support request?"
        description="Closing marks this request as closed. You can reopen it later."
        confirmLabel="Close request"
        busy={busy}
        onCancel={() => setCloseOpen(false)}
        onConfirm={() => {
          setCloseOpen(false);
          run.mutate(() => closeSupportRequest(request.id));
        }}
      />
    </div>
  );
}
