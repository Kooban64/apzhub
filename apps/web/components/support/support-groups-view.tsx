"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isSupportApiError } from "@/lib/support/errors";
import { formatSupportDate } from "@/lib/support/format";
import {
  canCreateGroup,
  canUpdateGroup,
  type SupportPermissionSource,
} from "@/lib/support/permissions";
import { supportQueryKeys } from "@/lib/support/query-keys";
import { SUPPORT_BASE } from "@/lib/support/routes";
import {
  createSupportGroup,
  getSupportGroup,
  listSupportGroups,
  updateSupportGroup,
} from "@/lib/support/support-api";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  SupportTable,
} from "./support-ui";

export function SupportGroupsView({
  groupId,
  permissions,
}: {
  readonly groupId?: string;
  readonly permissions?: SupportPermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [editName, setEditName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: supportQueryKeys.groups.list({}),
    queryFn: ({ signal }) => listSupportGroups({ limit: 50 }, { signal }),
    enabled: !groupId,
  });

  const detailQuery = useQuery({
    queryKey: supportQueryKeys.groups.detail(groupId ?? ""),
    queryFn: ({ signal }) => getSupportGroup(groupId!, { signal }),
    enabled: Boolean(groupId),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createSupportGroup({
        name: name.trim(),
        note: note.trim() || undefined,
      }),
    onSuccess: (result) => {
      setName("");
      setNote("");
      void queryClient.invalidateQueries({ queryKey: supportQueryKeys.groups.all });
      router.push(`${SUPPORT_BASE}/groups/${result.data.id}`);
    },
    onError: (cause: unknown) => {
      setError(isSupportApiError(cause) ? cause.message : "Create failed.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateSupportGroup(groupId!, { name: editName.trim() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: supportQueryKeys.groups.detail(groupId!),
      });
    },
    onError: (cause: unknown) => {
      setError(isSupportApiError(cause) ? cause.message : "Update failed.");
    },
  });

  if (groupId) {
    if (detailQuery.isLoading) return <LoadingState />;
    if (detailQuery.isError || !detailQuery.data) {
      return (
        <ErrorState
          message={
            isSupportApiError(detailQuery.error)
              ? detailQuery.error.message
              : "Group not found."
          }
          onRetry={() => void detailQuery.refetch()}
        />
      );
    }
    const group = detailQuery.data.data;
    return (
      <PageShell title={group.name} description="Support group detail">
        <div className="space-y-2 text-sm" data-testid="support-group-detail">
          <p>
            <span className="font-medium">ID:</span> {group.id}
          </p>
          <p>
            <span className="font-medium">Active:</span> {group.active ? "Yes" : "No"}
          </p>
          <p>
            <span className="font-medium">Updated:</span>{" "}
            {formatSupportDate(group.updatedAt)}
          </p>
          {group.note ? <p>{group.note}</p> : null}
        </div>
        {canUpdateGroup(permissions) ? (
          <div className="flex max-w-md flex-col gap-2">
            <Input
              label="Name"
              value={editName || group.name}
              onChange={(event) => setEditName(event.target.value)}
            />
            <Button
              type="button"
              size="sm"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
            >
              Update
            </Button>
          </div>
        ) : null}
        {error ? (
          <p className="text-sm" role="alert">
            {error}
          </p>
        ) : null}
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Groups"
      description="Support groups (queues). No delete — update only."
    >
      {canCreateGroup(permissions) ? (
        <form
          className="grid max-w-xl gap-2 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            createMutation.mutate();
          }}
        >
          <Input
            label="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input label="Note" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex items-end">
            <Button type="submit" size="sm" disabled={createMutation.isPending}>
              Create
            </Button>
          </div>
        </form>
      ) : null}
      {listQuery.isLoading ? <LoadingState /> : null}
      {listQuery.isError ? (
        <ErrorState
          message={
            isSupportApiError(listQuery.error)
              ? listQuery.error.message
              : "Failed to load groups."
          }
          onRetry={() => void listQuery.refetch()}
        />
      ) : null}
      {listQuery.isSuccess && listQuery.data.data.length === 0 ? (
        <EmptyState title="No groups" />
      ) : null}
      {listQuery.data ? (
        <SupportTable
          columns={["Name", "Active", "Updated"]}
          rows={listQuery.data.data.map((group) => ({
            id: group.id,
            cells: [
              group.name,
              group.active ? "Yes" : "No",
              formatSupportDate(group.updatedAt),
            ],
          }))}
          onRowClick={(id) => router.push(`${SUPPORT_BASE}/groups/${id}`)}
        />
      ) : null}
      {error ? (
        <p className="text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </PageShell>
  );
}
