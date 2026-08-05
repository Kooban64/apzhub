"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isSupportApiError } from "@/lib/support/errors";
import { formatSupportDate } from "@/lib/support/format";
import {
  canArchiveOrganization,
  canCreateOrganization,
  canUpdateOrganization,
  type SupportPermissionSource,
} from "@/lib/support/permissions";
import { supportQueryKeys } from "@/lib/support/query-keys";
import { SUPPORT_BASE } from "@/lib/support/routes";
import {
  archiveSupportOrganization,
  createSupportOrganization,
  getSupportOrganization,
  listSupportOrganizations,
  updateSupportOrganization,
} from "@/lib/support/support-api";

import {
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  SupportTable,
} from "./support-ui";

export function SupportOrganizationsView({
  organizationId,
  permissions,
}: {
  readonly organizationId?: string;
  readonly permissions?: SupportPermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [note, setNote] = useState("");
  const [editName, setEditName] = useState("");
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const listQuery = useQuery({
    queryKey: supportQueryKeys.organizations.list({}),
    queryFn: ({ signal }) => listSupportOrganizations({ limit: 50 }, { signal }),
    enabled: !organizationId,
  });

  const detailQuery = useQuery({
    queryKey: supportQueryKeys.organizations.detail(organizationId ?? ""),
    queryFn: ({ signal }) => getSupportOrganization(organizationId!, { signal }),
    enabled: Boolean(organizationId),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createSupportOrganization({
        name: name.trim(),
        domain: domain.trim() || undefined,
        note: note.trim() || undefined,
      }),
    onSuccess: (result) => {
      setName("");
      setDomain("");
      setNote("");
      void queryClient.invalidateQueries({
        queryKey: supportQueryKeys.organizations.all,
      });
      router.push(`${SUPPORT_BASE}/organizations/${result.data.id}`);
    },
    onError: (cause: unknown) => {
      setError(isSupportApiError(cause) ? cause.message : "Create failed.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateSupportOrganization(organizationId!, { name: editName.trim() }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: supportQueryKeys.organizations.detail(organizationId!),
      });
    },
    onError: (cause: unknown) => {
      setError(isSupportApiError(cause) ? cause.message : "Update failed.");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveSupportOrganization(organizationId!),
    onSuccess: () => {
      setArchiveOpen(false);
      router.push(`${SUPPORT_BASE}/organizations`);
    },
    onError: (cause: unknown) => {
      setError(isSupportApiError(cause) ? cause.message : "Archive failed.");
    },
  });

  if (organizationId) {
    if (detailQuery.isLoading) return <LoadingState />;
    if (detailQuery.isError || !detailQuery.data) {
      return (
        <ErrorState
          message={
            isSupportApiError(detailQuery.error)
              ? detailQuery.error.message
              : "Organization not found."
          }
          onRetry={() => void detailQuery.refetch()}
        />
      );
    }
    const org = detailQuery.data.data;
    return (
      <PageShell
        title={org.name}
        description="Organisation in APZ Support."
        breadcrumbs={["APZ Support", "Organisations", org.name]}
      >
        <div className="space-y-2 text-sm" data-testid="support-organization-detail">
          <p>
            <span className="font-medium">Domain:</span> {org.domain ?? "—"}
          </p>
          <p>
            <span className="font-medium">Active:</span> {org.active ? "Yes" : "No"}
          </p>
          <p>
            <span className="font-medium">Updated:</span>{" "}
            {formatSupportDate(org.updatedAt)}
          </p>
          {org.note ? <p>{org.note}</p> : null}
        </div>
        {canUpdateOrganization(permissions) ? (
          <div className="flex max-w-md flex-col gap-2">
            <Input
              label="Name"
              value={editName || org.name}
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
        {canArchiveOrganization(permissions) ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setArchiveOpen(true)}
            data-testid="support-organization-archive"
          >
            Archive
          </Button>
        ) : null}
        {error ? (
          <p className="text-sm" role="alert">
            {error}
          </p>
        ) : null}
        <ConfirmDialog
          open={archiveOpen}
          title="Archive organization?"
          description="Archiving deactivates this organisation in APZ Support."
          confirmLabel="Archive"
          busy={archiveMutation.isPending}
          onCancel={() => setArchiveOpen(false)}
          onConfirm={() => archiveMutation.mutate()}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Organisations"
      description="Organisations linked to requests in APZ Support."
      breadcrumbs={["APZ Support", "Organisations"]}
    >
      {canCreateOrganization(permissions) ? (
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
          <Input
            label="Domain"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
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
              : "Failed to load organizations."
          }
          onRetry={() => void listQuery.refetch()}
        />
      ) : null}
      {listQuery.isSuccess && listQuery.data.data.length === 0 ? (
        <EmptyState title="No organizations" />
      ) : null}
      {listQuery.data ? (
        <SupportTable
          columns={["Name", "Domain", "Active", "Updated"]}
          rows={listQuery.data.data.map((org) => ({
            id: org.id,
            cells: [
              org.name,
              org.domain ?? "—",
              org.active ? "Yes" : "No",
              formatSupportDate(org.updatedAt),
            ],
          }))}
          onRowClick={(id) => router.push(`${SUPPORT_BASE}/organizations/${id}`)}
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
