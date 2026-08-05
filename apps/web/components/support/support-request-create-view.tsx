"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isSupportApiError } from "@/lib/support/errors";
import { supportQueryKeys } from "@/lib/support/query-keys";
import { createSupportRequest } from "@/lib/support/support-api";
import { supportRequestDetailPath } from "@/lib/support/routes";
import type { SupportRequestPriority, SupportRequestStatus } from "@/lib/support/types";

import { SupportLookupSelect } from "./support-lookup-select";
import { PageShell } from "./support-ui";

export function SupportRequestCreateView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [status, setStatus] = useState<SupportRequestStatus>("new");
  const [priority, setPriority] = useState<SupportRequestPriority>("normal");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createSupportRequest({
        title: title.trim(),
        requesterId: customerId.trim(),
        groupId: groupId.trim(),
        organizationId: organizationId.trim() || undefined,
        assigneeId: ownerId.trim() || undefined,
        status,
        priority,
      }),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: supportQueryKeys.requests.all });
      void queryClient.invalidateQueries({ queryKey: supportQueryKeys.analytics() });
      router.push(supportRequestDetailPath(result.data.id));
    },
    onError: (cause: unknown) => {
      setError(
        isSupportApiError(cause) ? cause.message : "Unable to create support request.",
      );
    },
  });

  return (
    <PageShell
      title="New request"
      description="Create a request so someone can ask for help and follow progress in APZ Support."
      breadcrumbs={["APZ Support", "Requests", "New"]}
    >
      <form
        className="flex max-w-xl flex-col gap-4"
        data-testid="support-request-create"
        onSubmit={(event) => {
          event.preventDefault();
          setError(null);
          if (!title.trim() || !customerId.trim() || !groupId.trim()) {
            setError("Title, customer, and group are required.");
            return;
          }
          mutation.mutate();
        }}
      >
        <Input
          label="Title *"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          data-testid="support-create-title"
        />
        <SupportLookupSelect
          kind="users"
          label="Customer"
          value={customerId}
          onChange={setCustomerId}
          required
        />
        <SupportLookupSelect
          kind="organizations"
          label="Organization"
          value={organizationId}
          onChange={setOrganizationId}
        />
        <SupportLookupSelect
          kind="groups"
          label="Group"
          value={groupId}
          onChange={setGroupId}
          required
        />
        <SupportLookupSelect
          kind="users"
          label="Owner"
          value={ownerId}
          onChange={setOwnerId}
        />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">State</span>
          <select
            className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2"
            value={status}
            onChange={(event) => setStatus(event.target.value as SupportRequestStatus)}
          >
            <option value="new">new</option>
            <option value="open">open</option>
            <option value="pending">pending</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Priority</span>
          <select
            className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as SupportRequestPriority)
            }
          >
            <option value="low">low</option>
            <option value="normal">normal</option>
            <option value="high">high</option>
            <option value="urgent">urgent</option>
          </select>
        </label>
        {error ? (
          <p className="text-sm text-[var(--color-muted-foreground)]" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={mutation.isPending}
            data-testid="support-create-submit"
          >
            {mutation.isPending ? "Creating…" : "Create request"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/workspace/support/requests")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </PageShell>
  );
}
