"use client";

/**
 * Identity Administration Workbench (APZIDENTITY-004).
 * Consumes only identity typed-client facades — no gateway/core/persistence.
 * Metadata / lifecycle only — authentication, provisioning, and directory sync
 * remain outside this workbench.
 */

import { Button, Input } from "@apzhub/ui";
import type { QueryClient } from "@tanstack/react-query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";

import {
  createActivation,
  createDeactivation,
  createDepartment,
  createGroup,
  createInvitation,
  createMembership,
  createOrganisation,
  createPolicy,
  createPosition,
  createReference,
  createRole,
  createServiceAssignment,
  createTenant,
  createUser,
  getCapabilities,
  getDepartment,
  getGroup,
  getHealth,
  getInvitation,
  getManagementCapabilities,
  getMembership,
  getOrganisation,
  getPolicy,
  getPosition,
  getReadiness,
  getReference,
  getRole,
  getServiceAssignment,
  getTenant,
  getUser,
  listAudit,
  listDepartments,
  listGroups,
  listHistory,
  listInvitations,
  listMemberships,
  listOrganisations,
  listPolicies,
  listPositions,
  listReferences,
  listRoles,
  listServiceAssignments,
  listTenants,
  listUsers,
  updateDepartment,
  updateGroup,
  updateInvitation,
  updateMembership,
  updateOrganisation,
  updatePolicy,
  updatePosition,
  updateReference,
  updateRole,
  updateServiceAssignment,
  updateTenant,
  updateUser,
} from "@/lib/identity/identity-api";
import {
  IdentityClientError,
  toIdentityUserMessage,
} from "@/lib/identity/identity-errors";
import type {
  CreateIdentityActivationClientInput,
  CreateIdentityDeactivationClientInput,
  CreateIdentityDepartmentClientInput,
  CreateIdentityGroupClientInput,
  CreateIdentityInvitationClientInput,
  CreateIdentityMembershipClientInput,
  CreateIdentityOrganisationClientInput,
  CreateIdentityPolicyClientInput,
  CreateIdentityPositionClientInput,
  CreateIdentityReferenceClientInput,
  CreateIdentityRoleClientInput,
  CreateIdentityServiceAssignmentClientInput,
  CreateIdentityTenantClientInput,
  CreateIdentityUserClientInput,
  IdentityActivationViewModel,
  IdentityDeactivationViewModel,
  IdentityDepartmentViewModel,
  IdentityGroupViewModel,
  IdentityInvitationViewModel,
  IdentityMembershipViewModel,
  IdentityOrganisationViewModel,
  IdentityPolicyViewModel,
  IdentityPositionViewModel,
  IdentityReferenceViewModel,
  IdentityRoleViewModel,
  IdentityServiceAssignmentViewModel,
  IdentityTenantViewModel,
  IdentityUserViewModel,
  UpdateIdentityDepartmentClientInput,
  UpdateIdentityGroupClientInput,
  UpdateIdentityInvitationClientInput,
  UpdateIdentityMembershipClientInput,
  UpdateIdentityOrganisationClientInput,
  UpdateIdentityPolicyClientInput,
  UpdateIdentityPositionClientInput,
  UpdateIdentityReferenceClientInput,
  UpdateIdentityRoleClientInput,
  UpdateIdentityServiceAssignmentClientInput,
  UpdateIdentityTenantClientInput,
  UpdateIdentityUserClientInput,
} from "@/lib/identity/identity-types";
import { identityQueryKeys } from "@/lib/identity/query-keys";
import type { IdentitySection } from "@/lib/identity/routes";

const AUTH_BANNER = "AUTHENTICATION NOT MANAGED HERE";
const PROVISIONING_BANNER = "PROVISIONING NOT AVAILABLE";
const DIRECTORY_SYNC_BANNER = "DIRECTORY SYNC NOT AVAILABLE";
const INVITATION_BANNER = "NO EMAIL DELIVERY — INVITATION METADATA ONLY";

const SERVICE_CAPABILITY_OPTIONS = [
  "workflow-engine",
  "workflows",
  "documents",
  "reporting",
  "search",
  "support",
  "testing",
  "administration",
  "configuration",
  "notifications",
] as const;

function PageShell({
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
    <div className="flex flex-col gap-6 p-1" data-testid="identity-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Identity
          </p>
          <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </header>
      {children}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  readonly title: string;
  readonly description?: string;
}) {
  return (
    <div
      className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-10 text-center"
      data-testid="identity-empty"
    >
      <p className="font-medium text-[var(--color-foreground)]">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
  forbidden,
  notFound,
  unavailable,
}: {
  readonly message: string;
  readonly onRetry?: () => void;
  readonly forbidden?: boolean;
  readonly notFound?: boolean;
  readonly unavailable?: boolean;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/30 px-4 py-6"
      data-testid={
        forbidden
          ? "identity-forbidden"
          : unavailable
            ? "identity-unavailable"
            : notFound
              ? "identity-not-found"
              : "identity-error"
      }
      role="alert"
    >
      <p className="font-medium text-[var(--color-foreground)]">
        {forbidden
          ? "Access denied"
          : unavailable
            ? "Identity service unavailable"
            : notFound
              ? "Not found"
              : "Unable to load identity data"}
      </p>
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

function StatusCard({
  label,
  value,
  testId,
  emphasize,
}: {
  readonly label: string;
  readonly value: string;
  readonly testId?: string;
  readonly emphasize?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-lg border border-[var(--color-border)] px-4 py-3",
        emphasize
          ? "border-[var(--color-destructive)]/40 bg-[var(--color-muted)]/40"
          : "",
      ].join(" ")}
      data-testid={testId}
    >
      <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-[var(--color-foreground)]">{value}</p>
    </div>
  );
}

function NoticeBanner({
  text,
  testId,
}: {
  readonly text: string;
  readonly testId?: string;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-destructive)]/30 bg-[var(--color-muted)]/40 px-4 py-3 text-sm font-medium"
      data-testid={testId}
      role="status"
    >
      {text}
    </div>
  );
}

function MetaTable({
  columns,
  rows,
  caption,
  onRowClick,
  selectedId,
  testId = "identity-table",
}: {
  readonly columns: readonly string[];
  readonly rows: readonly {
    readonly id: string;
    readonly cells: readonly ReactNode[];
  }[];
  readonly caption?: string;
  readonly onRowClick?: (id: string) => void;
  readonly selectedId?: string | null;
  readonly testId?: string;
}) {
  return (
    <div
      className="overflow-x-auto rounded-lg border border-[var(--color-border)]"
      data-testid={testId}
    >
      <table className="min-w-full text-left text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/20">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-3 py-2 font-medium text-[var(--color-foreground)]"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={[
                "border-b border-[var(--color-border)]",
                onRowClick ? "cursor-pointer hover:bg-[var(--color-muted)]/30" : "",
                selectedId === row.id ? "bg-[var(--color-muted)]/40" : "",
              ].join(" ")}
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
              aria-selected={selectedId === row.id}
            >
              {row.cells.map((cell, index) => (
                <td
                  key={`${row.id}-${index}`}
                  className="px-3 py-2 text-[var(--color-foreground)]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function copyText(value: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  throw new Error("Clipboard is unavailable.");
}

function isForbidden(error: unknown): boolean {
  return (
    error instanceof IdentityClientError &&
    (error.status === 403 || error.code === "FORBIDDEN")
  );
}

function isNotFound(error: unknown): boolean {
  return error instanceof IdentityClientError && error.status === 404;
}

function isUnavailable(error: unknown): boolean {
  return (
    error instanceof IdentityClientError &&
    (error.status === 503 || error.code === "IDENTITY_SERVICE_UNAVAILABLE")
  );
}

function countByStatus(
  items: readonly { readonly status: string }[],
  status: string,
): number {
  return items.filter((item) => item.status === status).length;
}

function filterByText<T extends Record<string, unknown>>(
  items: readonly T[],
  query: string,
  fields: readonly (keyof T)[],
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...items];
  return items.filter((item) =>
    fields.some((field) =>
      String(item[field] ?? "")
        .toLowerCase()
        .includes(q),
    ),
  );
}

function useIdentityAction<TInput, TOutput>(
  queryClient: QueryClient,
  mutationFn: (input: TInput) => Promise<TOutput>,
  label: string,
  setStatusMessage: (message: string | null) => void,
  setActionError: (message: string | null) => void,
) {
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      setActionError(null);
      setStatusMessage(`Completed: ${label}`);
      await queryClient.invalidateQueries({ queryKey: identityQueryKeys.all });
    },
    onError: (error: unknown) => {
      setStatusMessage(null);
      setActionError(toIdentityUserMessage(error));
    },
  });
}

const SECTION_META: Record<
  IdentitySection,
  { readonly title: string; readonly description: string }
> = {
  overview: {
    title: "Overview",
    description:
      "Identity metadata dashboard — authentication, provisioning, and directory sync are not available here.",
  },
  users: {
    title: "Users",
    description: "User metadata, lifecycle, memberships, and service assignments.",
  },
  groups: {
    title: "Groups",
    description: "Group metadata within tenants and organisations.",
  },
  roles: {
    title: "Roles",
    description: "Role metadata catalogue.",
  },
  organisations: {
    title: "Organisations",
    description: "Organisation metadata within tenants.",
  },
  tenants: {
    title: "Tenants",
    description: "Tenant metadata catalogue.",
  },
  departments: {
    title: "Departments",
    description: "Department metadata within organisations.",
  },
  positions: {
    title: "Positions",
    description: "Position metadata catalogue.",
  },
  memberships: {
    title: "Memberships",
    description:
      "Membership metadata linking users to groups, roles, or other targets.",
  },
  "service-assignments": {
    title: "Service Assignments",
    description: "Service capability assignment metadata for users and groups.",
  },
  invitations: {
    title: "Invitations",
    description: "Invitation metadata — email delivery is not available here.",
  },
  policies: {
    title: "Policies",
    description: "Policy catalogue metadata.",
  },
  audit: {
    title: "Audit",
    description: "Read-only identity audit timeline.",
  },
  history: {
    title: "History",
    description: "Read-only identity history timeline, optionally filtered by user.",
  },
  references: {
    title: "References",
    description: "Cross-product reference metadata.",
  },
  diagnostics: {
    title: "Diagnostics",
    description:
      "Health, readiness, and capabilities — authentication, provisioning, and directory sync remain unavailable.",
  },
};

type SimpleEntity = {
  readonly id: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly status: string;
};

function UserEditForm({
  user,
  onSave,
  saving,
}: {
  readonly user: IdentityUserViewModel;
  readonly onSave: (input: UpdateIdentityUserClientInput) => void;
  readonly saving: boolean;
}) {
  const [draft, setDraft] = useState({
    displayName: user.displayName,
    email: user.email ?? "",
    authSubjectRef: user.authSubjectRef ?? "",
    organisationId: user.organisationId ?? "",
  });

  return (
    <form
      className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] p-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          displayName: draft.displayName,
          email: draft.email || null,
          authSubjectRef: draft.authSubjectRef || null,
          organisationId: draft.organisationId || null,
        });
      }}
    >
      <h3 className="text-sm font-medium">Edit user</h3>
      <label className="flex flex-col gap-1 text-sm">
        <span>Edit display name</span>
        <Input
          aria-label="Edit display name"
          value={draft.displayName}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, displayName: event.target.value }))
          }
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>Edit email (optional)</span>
        <Input
          aria-label="Edit email"
          value={draft.email}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, email: event.target.value }))
          }
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>Edit auth subject reference (optional)</span>
        <Input
          aria-label="Edit auth subject reference"
          value={draft.authSubjectRef}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, authSubjectRef: event.target.value }))
          }
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>Edit organisation ID (optional)</span>
        <Input
          aria-label="Edit user organisation id"
          value={draft.organisationId}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, organisationId: event.target.value }))
          }
        />
      </label>
      <Button type="submit" variant="outline" size="sm" disabled={saving}>
        Save changes
      </Button>
    </form>
  );
}

function EntityCrudPanel<TItem extends SimpleEntity>({
  caption,
  items,
  isLoading,
  listError,
  selectedId,
  onSelect,
  detail,
  detailLoading,
  detailError,
  canManage,
  showOrganisationId,
  organisationIdRequired,
  onCreate,
  creating,
  onUpdate,
  updating,
}: {
  readonly caption: string;
  readonly items: readonly TItem[];
  readonly isLoading: boolean;
  readonly listError: unknown;
  readonly selectedId: string | null;
  readonly onSelect: (id: string) => void;
  readonly detail: TItem | undefined;
  readonly detailLoading: boolean;
  readonly detailError: unknown;
  readonly canManage: boolean;
  readonly showOrganisationId?: boolean;
  readonly organisationIdRequired?: boolean;
  readonly onCreate: (input: {
    readonly key: string;
    readonly name: string;
    readonly description?: string;
    readonly organisationId?: string;
  }) => void;
  readonly creating: boolean;
  readonly onUpdate: (input: {
    readonly name?: string;
    readonly description?: string;
    readonly status?: string;
  }) => void;
  readonly updating: boolean;
}) {
  const [draftKey, setDraftKey] = useState("");
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftOrganisationId, setDraftOrganisationId] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const singular = caption.replace(/s$/, "");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <p role="status">Loading {caption.toLowerCase()}…</p>
        ) : listError ? (
          <ErrorState
            message={toIdentityUserMessage(listError)}
            forbidden={isForbidden(listError)}
            unavailable={isUnavailable(listError)}
          />
        ) : items.length === 0 ? (
          <EmptyState title={`No ${caption.toLowerCase()}`} />
        ) : (
          <MetaTable
            caption={caption}
            columns={["ID", "Key", "Name", "Status"]}
            selectedId={selectedId}
            onRowClick={onSelect}
            rows={items.map((item) => ({
              id: item.id,
              cells: [item.id, item.key, item.name, item.status],
            }))}
          />
        )}
        {canManage ? (
          <form
            className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] p-3"
            onSubmit={(event) => {
              event.preventDefault();
              onCreate({
                key: draftKey,
                name: draftName,
                description: draftDescription || undefined,
                organisationId: draftOrganisationId || undefined,
              });
              setDraftKey("");
              setDraftName("");
              setDraftDescription("");
              setDraftOrganisationId("");
            }}
          >
            <h3 className="text-sm font-medium">Create {singular}</h3>
            <label className="flex flex-col gap-1 text-sm">
              <span>Key</span>
              <Input
                aria-label={`${singular} key`}
                value={draftKey}
                onChange={(event) => setDraftKey(event.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>Name</span>
              <Input
                aria-label={`${singular} name`}
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>Description</span>
              <Input
                aria-label={`${singular} description`}
                value={draftDescription}
                onChange={(event) => setDraftDescription(event.target.value)}
              />
            </label>
            {showOrganisationId ? (
              <label className="flex flex-col gap-1 text-sm">
                <span>
                  Organisation ID{organisationIdRequired ? "" : " (optional)"}
                </span>
                <Input
                  aria-label={`${singular} organisation id`}
                  value={draftOrganisationId}
                  onChange={(event) => setDraftOrganisationId(event.target.value)}
                  required={organisationIdRequired}
                />
              </label>
            ) : null}
            <Button type="submit" variant="outline" size="sm" disabled={creating}>
              Create {singular}
            </Button>
          </form>
        ) : null}
      </div>
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Detail</h2>
        {detailLoading ? (
          <p role="status">Loading detail…</p>
        ) : detailError ? (
          <ErrorState
            message={toIdentityUserMessage(detailError)}
            forbidden={isForbidden(detailError)}
            notFound={isNotFound(detailError)}
            unavailable={isUnavailable(detailError)}
          />
        ) : detail ? (
          <>
            <dl className="grid gap-2 text-sm" data-testid="identity-detail">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">ID</dt>
                <dd>{detail.id}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Key</dt>
                <dd>{detail.key}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Name</dt>
                <dd>{detail.name}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Description</dt>
                <dd>{detail.description ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Status</dt>
                <dd>{detail.status}</dd>
              </div>
            </dl>
            {canManage ? (
              <form
                className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  onUpdate({
                    name: editName || undefined,
                    description: editDescription || undefined,
                    status: editStatus || undefined,
                  });
                }}
              >
                <h3 className="text-sm font-medium">Update {singular}</h3>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Name</span>
                  <Input
                    aria-label={`${singular} update name`}
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    placeholder={detail.name}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Description</span>
                  <Input
                    aria-label={`${singular} update description`}
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                    placeholder={detail.description ?? ""}
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Status</span>
                  <Input
                    aria-label={`${singular} update status`}
                    value={editStatus}
                    onChange={(event) => setEditStatus(event.target.value)}
                    placeholder={detail.status}
                  />
                </label>
                <Button type="submit" variant="outline" size="sm" disabled={updating}>
                  Update {singular}
                </Button>
              </form>
            ) : null}
          </>
        ) : (
          <EmptyState title={`Select a ${singular.toLowerCase()}`} />
        )}
      </div>
    </div>
  );
}

export function PlatformIdentityView({
  section = "overview",
  canManage = true,
}: {
  readonly section?: IdentitySection;
  /** Server remains authoritative; UI may hide manage actions when false. */
  readonly canManage?: boolean;
}) {
  const queryClient = useQueryClient();
  const [userFilter, setUserFilter] = useState("");
  const [historyUserFilter, setHistoryUserFilter] = useState("");
  const [activationReason, setActivationReason] = useState("");
  const [apiMetadataOpen, setApiMetadataOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [selectedOrganisationId, setSelectedOrganisationId] = useState<string | null>(
    null,
  );
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null);
  const [selectedMembershipId, setSelectedMembershipId] = useState<string | null>(null);
  const [selectedServiceAssignmentId, setSelectedServiceAssignmentId] = useState<
    string | null
  >(null);
  const [selectedInvitationId, setSelectedInvitationId] = useState<string | null>(null);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(null);

  const [userDraft, setUserDraft] = useState({
    displayName: "",
    email: "",
    authSubjectRef: "",
    organisationId: "",
  });
  const [membershipDraft, setMembershipDraft] = useState({
    userId: "",
    kind: "",
    targetId: "",
  });
  const [serviceAssignmentDraft, setServiceAssignmentDraft] = useState<{
    subjectKind: string;
    subjectId: string;
    serviceCapability: string;
  }>({
    subjectKind: "user",
    subjectId: "",
    serviceCapability: SERVICE_CAPABILITY_OPTIONS[0],
  });
  const [invitationDraft, setInvitationDraft] = useState({
    email: "",
    organisationId: "",
    invitedUserId: "",
    expiresAt: "",
  });
  const [policyDraft, setPolicyDraft] = useState({
    key: "",
    name: "",
    kind: "",
    description: "",
    organisationId: "",
  });
  const [referenceDraft, setReferenceDraft] = useState({
    kind: "",
    target: "",
    label: "",
    userId: "",
  });
  const [membershipStatusDraft, setMembershipStatusDraft] = useState("");
  const [serviceAssignmentStatusDraft, setServiceAssignmentStatusDraft] = useState("");
  const [invitationStatusDraft, setInvitationStatusDraft] = useState("");
  const [policyEditDraft, setPolicyEditDraft] = useState({
    name: "",
    description: "",
  });
  const [referenceEditDraft, setReferenceEditDraft] = useState({
    target: "",
    label: "",
  });

  // ---------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------

  const usersQuery = useQuery({
    queryKey: identityQueryKeys.users.list({ limit: 100 }),
    queryFn: ({ signal }) => listUsers({ limit: 100 }, { signal }),
  });

  const userId = selectedUserId ?? usersQuery.data?.items[0]?.id ?? null;
  const userDetailQuery = useQuery({
    queryKey: identityQueryKeys.users.detail(userId ?? ""),
    queryFn: ({ signal }) => getUser(userId!, { signal }),
    enabled: Boolean(userId),
  });

  const groupsQuery = useQuery({
    queryKey: identityQueryKeys.groups.list(),
    queryFn: ({ signal }) => listGroups(undefined, { signal }),
    enabled: section === "groups" || section === "overview",
  });
  const groupId = selectedGroupId ?? groupsQuery.data?.items[0]?.id ?? null;
  const groupDetailQuery = useQuery({
    queryKey: identityQueryKeys.groups.detail(groupId ?? ""),
    queryFn: ({ signal }) => getGroup(groupId!, { signal }),
    enabled: Boolean(groupId) && section === "groups",
  });

  const rolesQuery = useQuery({
    queryKey: identityQueryKeys.roles.list(),
    queryFn: ({ signal }) => listRoles(undefined, { signal }),
    enabled: section === "roles" || section === "overview",
  });
  const roleId = selectedRoleId ?? rolesQuery.data?.items[0]?.id ?? null;
  const roleDetailQuery = useQuery({
    queryKey: identityQueryKeys.roles.detail(roleId ?? ""),
    queryFn: ({ signal }) => getRole(roleId!, { signal }),
    enabled: Boolean(roleId) && section === "roles",
  });

  const organisationsQuery = useQuery({
    queryKey: identityQueryKeys.organisations.list(),
    queryFn: ({ signal }) => listOrganisations(undefined, { signal }),
    enabled: section === "organisations" || section === "overview",
  });
  const organisationId =
    selectedOrganisationId ?? organisationsQuery.data?.items[0]?.id ?? null;
  const organisationDetailQuery = useQuery({
    queryKey: identityQueryKeys.organisations.detail(organisationId ?? ""),
    queryFn: ({ signal }) => getOrganisation(organisationId!, { signal }),
    enabled: Boolean(organisationId) && section === "organisations",
  });

  const tenantsQuery = useQuery({
    queryKey: identityQueryKeys.tenants.list(),
    queryFn: ({ signal }) => listTenants(undefined, { signal }),
    enabled: section === "tenants" || section === "overview",
  });
  const tenantId = selectedTenantId ?? tenantsQuery.data?.items[0]?.id ?? null;
  const tenantDetailQuery = useQuery({
    queryKey: identityQueryKeys.tenants.detail(tenantId ?? ""),
    queryFn: ({ signal }) => getTenant(tenantId!, { signal }),
    enabled: Boolean(tenantId) && section === "tenants",
  });

  const departmentsQuery = useQuery({
    queryKey: identityQueryKeys.departments.list(),
    queryFn: ({ signal }) => listDepartments(undefined, { signal }),
    enabled: section === "departments" || section === "overview",
  });
  const departmentId =
    selectedDepartmentId ?? departmentsQuery.data?.items[0]?.id ?? null;
  const departmentDetailQuery = useQuery({
    queryKey: identityQueryKeys.departments.detail(departmentId ?? ""),
    queryFn: ({ signal }) => getDepartment(departmentId!, { signal }),
    enabled: Boolean(departmentId) && section === "departments",
  });

  const positionsQuery = useQuery({
    queryKey: identityQueryKeys.positions.list(),
    queryFn: ({ signal }) => listPositions(undefined, { signal }),
    enabled: section === "positions" || section === "overview",
  });
  const positionId = selectedPositionId ?? positionsQuery.data?.items[0]?.id ?? null;
  const positionDetailQuery = useQuery({
    queryKey: identityQueryKeys.positions.detail(positionId ?? ""),
    queryFn: ({ signal }) => getPosition(positionId!, { signal }),
    enabled: Boolean(positionId) && section === "positions",
  });

  const membershipsQuery = useQuery({
    queryKey: identityQueryKeys.memberships.list(),
    queryFn: ({ signal }) => listMemberships(undefined, { signal }),
    enabled: section === "memberships" || section === "overview" || section === "users",
  });
  const membershipId =
    selectedMembershipId ?? membershipsQuery.data?.items[0]?.id ?? null;
  const membershipDetailQuery = useQuery({
    queryKey: identityQueryKeys.memberships.detail(membershipId ?? ""),
    queryFn: ({ signal }) => getMembership(membershipId!, { signal }),
    enabled: Boolean(membershipId) && section === "memberships",
  });

  const serviceAssignmentsQuery = useQuery({
    queryKey: identityQueryKeys.serviceAssignments.list(),
    queryFn: ({ signal }) => listServiceAssignments(undefined, { signal }),
    enabled:
      section === "service-assignments" ||
      section === "overview" ||
      section === "users",
  });
  const serviceAssignmentId =
    selectedServiceAssignmentId ?? serviceAssignmentsQuery.data?.items[0]?.id ?? null;
  const serviceAssignmentDetailQuery = useQuery({
    queryKey: identityQueryKeys.serviceAssignments.detail(serviceAssignmentId ?? ""),
    queryFn: ({ signal }) => getServiceAssignment(serviceAssignmentId!, { signal }),
    enabled: Boolean(serviceAssignmentId) && section === "service-assignments",
  });

  const invitationsQuery = useQuery({
    queryKey: identityQueryKeys.invitations.list(),
    queryFn: ({ signal }) => listInvitations(undefined, { signal }),
    enabled: section === "invitations" || section === "overview",
  });
  const invitationId =
    selectedInvitationId ?? invitationsQuery.data?.items[0]?.id ?? null;
  const invitationDetailQuery = useQuery({
    queryKey: identityQueryKeys.invitations.detail(invitationId ?? ""),
    queryFn: ({ signal }) => getInvitation(invitationId!, { signal }),
    enabled: Boolean(invitationId) && section === "invitations",
  });

  const policiesQuery = useQuery({
    queryKey: identityQueryKeys.policies.list(),
    queryFn: ({ signal }) => listPolicies(undefined, { signal }),
    enabled: section === "policies" || section === "overview",
  });
  const policyId = selectedPolicyId ?? policiesQuery.data?.items[0]?.id ?? null;
  const policyDetailQuery = useQuery({
    queryKey: identityQueryKeys.policies.detail(policyId ?? ""),
    queryFn: ({ signal }) => getPolicy(policyId!, { signal }),
    enabled: Boolean(policyId) && section === "policies",
  });

  const auditQuery = useQuery({
    queryKey: identityQueryKeys.audit.list(),
    queryFn: ({ signal }) => listAudit({ limit: 50 }, { signal }),
    enabled: section === "audit" || section === "overview",
  });

  const historyQuery = useQuery({
    queryKey: identityQueryKeys.history.list({
      userId: historyUserFilter || undefined,
    }),
    queryFn: ({ signal }) =>
      listHistory({ userId: historyUserFilter || undefined }, { signal }),
    enabled: section === "history",
  });

  const referencesQuery = useQuery({
    queryKey: identityQueryKeys.references.list(),
    queryFn: ({ signal }) => listReferences(undefined, { signal }),
    enabled: section === "references" || section === "overview",
  });
  const referenceId = selectedReferenceId ?? referencesQuery.data?.items[0]?.id ?? null;
  const referenceDetailQuery = useQuery({
    queryKey: identityQueryKeys.references.detail(referenceId ?? ""),
    queryFn: ({ signal }) => getReference(referenceId!, { signal }),
    enabled: Boolean(referenceId) && section === "references",
  });

  const healthQuery = useQuery({
    queryKey: identityQueryKeys.diagnostics.health(),
    queryFn: ({ signal }) => getHealth({ signal }),
    enabled: section === "overview" || section === "diagnostics",
  });
  const readinessQuery = useQuery({
    queryKey: identityQueryKeys.diagnostics.readiness(),
    queryFn: ({ signal }) => getReadiness({ signal }),
    enabled: section === "overview" || section === "diagnostics",
  });
  const capabilitiesQuery = useQuery({
    queryKey: identityQueryKeys.diagnostics.capabilities(),
    queryFn: ({ signal }) => getCapabilities({ signal }),
    enabled: section === "diagnostics" || apiMetadataOpen,
  });
  const managementCapsQuery = useQuery({
    queryKey: identityQueryKeys.diagnostics.managementCapabilities(),
    queryFn: ({ signal }) => getManagementCapabilities({ signal }),
    enabled: section === "overview" || section === "diagnostics" || apiMetadataOpen,
  });

  // ---------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------

  const createUserMutation = useIdentityAction<
    CreateIdentityUserClientInput,
    IdentityUserViewModel
  >(queryClient, createUser, "create user", setStatusMessage, setActionError);
  const updateUserMutation = useIdentityAction<
    UpdateIdentityUserClientInput,
    IdentityUserViewModel
  >(
    queryClient,
    (input: UpdateIdentityUserClientInput) => updateUser(userId!, input),
    "update user",
    setStatusMessage,
    setActionError,
  );
  const activateMutation = useIdentityAction<
    CreateIdentityActivationClientInput,
    IdentityActivationViewModel
  >(queryClient, createActivation, "activate user", setStatusMessage, setActionError);
  const deactivateMutation = useIdentityAction<
    CreateIdentityDeactivationClientInput,
    IdentityDeactivationViewModel
  >(
    queryClient,
    createDeactivation,
    "deactivate user",
    setStatusMessage,
    setActionError,
  );

  const createGroupMutation = useIdentityAction<
    CreateIdentityGroupClientInput,
    IdentityGroupViewModel
  >(queryClient, createGroup, "create group", setStatusMessage, setActionError);
  const updateGroupMutation = useIdentityAction<
    UpdateIdentityGroupClientInput,
    IdentityGroupViewModel
  >(
    queryClient,
    (input: UpdateIdentityGroupClientInput) => updateGroup(groupId!, input),
    "update group",
    setStatusMessage,
    setActionError,
  );

  const createRoleMutation = useIdentityAction<
    CreateIdentityRoleClientInput,
    IdentityRoleViewModel
  >(queryClient, createRole, "create role", setStatusMessage, setActionError);
  const updateRoleMutation = useIdentityAction<
    UpdateIdentityRoleClientInput,
    IdentityRoleViewModel
  >(
    queryClient,
    (input: UpdateIdentityRoleClientInput) => updateRole(roleId!, input),
    "update role",
    setStatusMessage,
    setActionError,
  );

  const createOrganisationMutation = useIdentityAction<
    CreateIdentityOrganisationClientInput,
    IdentityOrganisationViewModel
  >(
    queryClient,
    createOrganisation,
    "create organisation",
    setStatusMessage,
    setActionError,
  );
  const updateOrganisationMutation = useIdentityAction<
    UpdateIdentityOrganisationClientInput,
    IdentityOrganisationViewModel
  >(
    queryClient,
    (input: UpdateIdentityOrganisationClientInput) =>
      updateOrganisation(organisationId!, input),
    "update organisation",
    setStatusMessage,
    setActionError,
  );

  const createTenantMutation = useIdentityAction<
    CreateIdentityTenantClientInput,
    IdentityTenantViewModel
  >(queryClient, createTenant, "create tenant", setStatusMessage, setActionError);
  const updateTenantMutation = useIdentityAction<
    UpdateIdentityTenantClientInput,
    IdentityTenantViewModel
  >(
    queryClient,
    (input: UpdateIdentityTenantClientInput) => updateTenant(tenantId!, input),
    "update tenant",
    setStatusMessage,
    setActionError,
  );

  const createDepartmentMutation = useIdentityAction<
    CreateIdentityDepartmentClientInput,
    IdentityDepartmentViewModel
  >(
    queryClient,
    createDepartment,
    "create department",
    setStatusMessage,
    setActionError,
  );
  const updateDepartmentMutation = useIdentityAction<
    UpdateIdentityDepartmentClientInput,
    IdentityDepartmentViewModel
  >(
    queryClient,
    (input: UpdateIdentityDepartmentClientInput) =>
      updateDepartment(departmentId!, input),
    "update department",
    setStatusMessage,
    setActionError,
  );

  const createPositionMutation = useIdentityAction<
    CreateIdentityPositionClientInput,
    IdentityPositionViewModel
  >(queryClient, createPosition, "create position", setStatusMessage, setActionError);
  const updatePositionMutation = useIdentityAction<
    UpdateIdentityPositionClientInput,
    IdentityPositionViewModel
  >(
    queryClient,
    (input: UpdateIdentityPositionClientInput) => updatePosition(positionId!, input),
    "update position",
    setStatusMessage,
    setActionError,
  );

  const createMembershipMutation = useIdentityAction<
    CreateIdentityMembershipClientInput,
    IdentityMembershipViewModel
  >(
    queryClient,
    createMembership,
    "create membership",
    setStatusMessage,
    setActionError,
  );
  const updateMembershipMutation = useIdentityAction<
    UpdateIdentityMembershipClientInput,
    IdentityMembershipViewModel
  >(
    queryClient,
    (input: UpdateIdentityMembershipClientInput) =>
      updateMembership(membershipId!, input),
    "update membership",
    setStatusMessage,
    setActionError,
  );

  const createServiceAssignmentMutation = useIdentityAction<
    CreateIdentityServiceAssignmentClientInput,
    IdentityServiceAssignmentViewModel
  >(
    queryClient,
    createServiceAssignment,
    "create service assignment",
    setStatusMessage,
    setActionError,
  );
  const updateServiceAssignmentMutation = useIdentityAction<
    UpdateIdentityServiceAssignmentClientInput,
    IdentityServiceAssignmentViewModel
  >(
    queryClient,
    (input: UpdateIdentityServiceAssignmentClientInput) =>
      updateServiceAssignment(serviceAssignmentId!, input),
    "update service assignment",
    setStatusMessage,
    setActionError,
  );

  const createInvitationMutation = useIdentityAction<
    CreateIdentityInvitationClientInput,
    IdentityInvitationViewModel
  >(
    queryClient,
    createInvitation,
    "create invitation",
    setStatusMessage,
    setActionError,
  );
  const updateInvitationMutation = useIdentityAction<
    UpdateIdentityInvitationClientInput,
    IdentityInvitationViewModel
  >(
    queryClient,
    (input: UpdateIdentityInvitationClientInput) =>
      updateInvitation(invitationId!, input),
    "update invitation",
    setStatusMessage,
    setActionError,
  );

  const createPolicyMutation = useIdentityAction<
    CreateIdentityPolicyClientInput,
    IdentityPolicyViewModel
  >(queryClient, createPolicy, "create policy", setStatusMessage, setActionError);
  const updatePolicyMutation = useIdentityAction<
    UpdateIdentityPolicyClientInput,
    IdentityPolicyViewModel
  >(
    queryClient,
    (input: UpdateIdentityPolicyClientInput) => updatePolicy(policyId!, input),
    "update policy",
    setStatusMessage,
    setActionError,
  );

  const createReferenceMutation = useIdentityAction<
    CreateIdentityReferenceClientInput,
    IdentityReferenceViewModel
  >(queryClient, createReference, "create reference", setStatusMessage, setActionError);
  const updateReferenceMutation = useIdentityAction<
    UpdateIdentityReferenceClientInput,
    IdentityReferenceViewModel
  >(
    queryClient,
    (input: UpdateIdentityReferenceClientInput) => updateReference(referenceId!, input),
    "update reference",
    setStatusMessage,
    setActionError,
  );

  // ---------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------

  const meta = SECTION_META[section];
  const users = useMemo(() => usersQuery.data?.items ?? [], [usersQuery.data]);
  const selectedUser = userDetailQuery.data;

  const filteredUsers = useMemo(
    () => filterByText(users, userFilter, ["displayName", "email"]),
    [users, userFilter],
  );

  const membershipsForUser = useMemo(
    () => (membershipsQuery.data?.items ?? []).filter((item) => item.userId === userId),
    [membershipsQuery.data, userId],
  );
  const serviceAssignmentsForUser = useMemo(
    () =>
      (serviceAssignmentsQuery.data?.items ?? []).filter(
        (item) => item.subjectId === userId,
      ),
    [serviceAssignmentsQuery.data, userId],
  );

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({ queryKey: identityQueryKeys.all });
  };

  const currentSelectedId: string | null = (() => {
    switch (section) {
      case "users":
        return userId;
      case "groups":
        return groupId;
      case "roles":
        return roleId;
      case "organisations":
        return organisationId;
      case "tenants":
        return tenantId;
      case "departments":
        return departmentId;
      case "positions":
        return positionId;
      case "memberships":
        return membershipId;
      case "service-assignments":
        return serviceAssignmentId;
      case "invitations":
        return invitationId;
      case "policies":
        return policyId;
      case "references":
        return referenceId;
      default:
        return null;
    }
  })();

  const toolbar = (
    <div
      className="flex flex-wrap items-center gap-2"
      role="toolbar"
      aria-label="Identity commands"
    >
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void invalidateAll()}
      >
        Refresh
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setApiMetadataOpen((open) => !open)}
      >
        Open API Metadata
      </Button>
      {currentSelectedId ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void copyText(currentSelectedId)
              .then(() => setStatusMessage("Copied ID"))
              .catch((error) => setActionError(toIdentityUserMessage(error)));
          }}
        >
          Copy ID
        </Button>
      ) : null}
    </div>
  );

  if (usersQuery.isError && isForbidden(usersQuery.error)) {
    return (
      <PageShell title={meta.title} description={meta.description}>
        <ErrorState forbidden message={toIdentityUserMessage(usersQuery.error)} />
      </PageShell>
    );
  }
  if (usersQuery.isError && isUnavailable(usersQuery.error)) {
    return (
      <PageShell title={meta.title} description={meta.description}>
        <ErrorState unavailable message={toIdentityUserMessage(usersQuery.error)} />
      </PageShell>
    );
  }

  return (
    <PageShell title={meta.title} description={meta.description} actions={toolbar}>
      {statusMessage ? (
        <p
          className="text-sm text-[var(--color-foreground)]"
          data-testid="identity-status"
          role="status"
        >
          {statusMessage}
        </p>
      ) : null}
      {actionError ? (
        <p
          className="text-sm text-[var(--color-destructive)]"
          data-testid="identity-action-error"
          role="alert"
        >
          {actionError}
        </p>
      ) : null}

      {apiMetadataOpen ? (
        <div
          className="rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm"
          data-testid="api-metadata-panel"
        >
          <p className="font-medium">API metadata</p>
          <p className="mt-1 text-[var(--color-muted-foreground)]">
            Management plane ready:{" "}
            {managementCapsQuery.data?.managementPlaneReady ? "yes" : "no"}
          </p>
          <p className="text-[var(--color-muted-foreground)]">
            HTTP enabled: {managementCapsQuery.data?.httpEnabled ? "yes" : "no"}
          </p>
          <p className="text-[var(--color-muted-foreground)]">
            Workbench enabled:{" "}
            {managementCapsQuery.data?.workbenchEnabled ? "yes" : "no"}
          </p>
        </div>
      ) : null}

      {section === "overview" ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatusCard
              label="Authentication"
              value={AUTH_BANNER}
              testId="card-auth-status"
              emphasize
            />
            <StatusCard
              label="Provisioning"
              value={PROVISIONING_BANNER}
              testId="card-provisioning-status"
              emphasize
            />
            <StatusCard
              label="Directory sync"
              value={DIRECTORY_SYNC_BANNER}
              testId="card-directory-sync-status"
              emphasize
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatusCard
              label="Total users"
              value={String(users.length)}
              testId="card-users-count"
            />
            <StatusCard
              label="Active users"
              value={String(countByStatus(users, "active"))}
              testId="card-active-users-count"
            />
            <StatusCard
              label="Inactive users"
              value={String(countByStatus(users, "inactive"))}
              testId="card-inactive-users-count"
            />
            <StatusCard
              label="Groups"
              value={String(groupsQuery.data?.items.length ?? 0)}
              testId="card-groups-count"
            />
            <StatusCard
              label="Roles"
              value={String(rolesQuery.data?.items.length ?? 0)}
              testId="card-roles-count"
            />
            <StatusCard
              label="Organisations"
              value={String(organisationsQuery.data?.items.length ?? 0)}
              testId="card-organisations-count"
            />
            <StatusCard
              label="Tenants"
              value={String(tenantsQuery.data?.items.length ?? 0)}
              testId="card-tenants-count"
            />
            <StatusCard
              label="Pending invitations"
              value={String(countByStatus(invitationsQuery.data?.items ?? [], "sent"))}
              testId="card-pending-invitations-count"
            />
            <StatusCard
              label="Service assignments"
              value={String(serviceAssignmentsQuery.data?.items.length ?? 0)}
              testId="card-service-assignments-count"
            />
            <StatusCard
              label="Recent audit entries"
              value={String(auditQuery.data?.items.length ?? 0)}
              testId="card-audit-count"
            />
            <StatusCard
              label="Service enabled"
              value={
                managementCapsQuery.data?.identityEnabled ? "Ready" : "Unavailable"
              }
              testId="card-service-status"
            />
            <StatusCard
              label="Management plane"
              value={
                managementCapsQuery.data?.managementPlaneReady ? "Ready" : "Unavailable"
              }
              testId="card-management-plane-status"
            />
          </div>
          {usersQuery.isLoading ? <p role="status">Loading users…</p> : null}
          {usersQuery.isError ? (
            <ErrorState
              message={toIdentityUserMessage(usersQuery.error)}
              onRetry={() => void usersQuery.refetch()}
            />
          ) : null}
        </div>
      ) : null}

      {section === "users" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <NoticeBanner text={AUTH_BANNER} testId="banner-auth" />
            <label className="flex flex-col gap-1 text-sm">
              <span>Filter by name or email</span>
              <Input
                aria-label="User search"
                value={userFilter}
                onChange={(event) => setUserFilter(event.target.value)}
                placeholder="Filter by display name or email…"
              />
            </label>
            {usersQuery.isLoading ? (
              <p role="status">Loading users…</p>
            ) : filteredUsers.length === 0 ? (
              <EmptyState title="No users" />
            ) : (
              <MetaTable
                caption="Users"
                columns={["ID", "Display name", "Email", "Status"]}
                selectedId={userId}
                onRowClick={setSelectedUserId}
                rows={filteredUsers.map((item) => ({
                  id: item.id,
                  cells: [item.id, item.displayName, item.email ?? "—", item.status],
                }))}
              />
            )}
            {canManage ? (
              <form
                className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  createUserMutation.mutate({
                    displayName: userDraft.displayName,
                    email: userDraft.email || undefined,
                    authSubjectRef: userDraft.authSubjectRef || undefined,
                    organisationId: userDraft.organisationId || undefined,
                  });
                  setUserDraft({
                    displayName: "",
                    email: "",
                    authSubjectRef: "",
                    organisationId: "",
                  });
                }}
              >
                <h3 className="text-sm font-medium">Create user</h3>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Display name</span>
                  <Input
                    aria-label="Display name"
                    value={userDraft.displayName}
                    onChange={(event) =>
                      setUserDraft((draft) => ({
                        ...draft,
                        displayName: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Email (optional)</span>
                  <Input
                    aria-label="Email"
                    value={userDraft.email}
                    onChange={(event) =>
                      setUserDraft((draft) => ({ ...draft, email: event.target.value }))
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Auth subject reference (optional)</span>
                  <Input
                    aria-label="Auth subject reference"
                    value={userDraft.authSubjectRef}
                    onChange={(event) =>
                      setUserDraft((draft) => ({
                        ...draft,
                        authSubjectRef: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Organisation ID (optional)</span>
                  <Input
                    aria-label="User organisation id"
                    value={userDraft.organisationId}
                    onChange={(event) =>
                      setUserDraft((draft) => ({
                        ...draft,
                        organisationId: event.target.value,
                      }))
                    }
                  />
                </label>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={createUserMutation.isPending}
                >
                  Create user
                </Button>
              </form>
            ) : null}
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">Details</h2>
            {userDetailQuery.isLoading ? (
              <p role="status">Loading detail…</p>
            ) : userDetailQuery.isError ? (
              <ErrorState
                message={toIdentityUserMessage(userDetailQuery.error)}
                forbidden={isForbidden(userDetailQuery.error)}
                notFound={isNotFound(userDetailQuery.error)}
                unavailable={isUnavailable(userDetailQuery.error)}
              />
            ) : selectedUser ? (
              <>
                <dl className="grid gap-2 text-sm" data-testid="identity-detail">
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">ID</dt>
                    <dd>{selectedUser.id}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">
                      Display name
                    </dt>
                    <dd>{selectedUser.displayName}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Email</dt>
                    <dd>{selectedUser.email ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Status</dt>
                    <dd data-testid="user-status">{selectedUser.status}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">
                      Organisation
                    </dt>
                    <dd>{selectedUser.organisationId ?? "—"}</dd>
                  </div>
                </dl>
                {canManage ? (
                  <UserEditForm
                    key={selectedUser.id}
                    user={selectedUser}
                    onSave={(input) => updateUserMutation.mutate(input)}
                    saving={updateUserMutation.isPending}
                  />
                ) : null}
                {canManage ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <span className="sr-only">Activation / deactivation reason</span>
                      <Input
                        aria-label="Activation reason"
                        value={activationReason}
                        onChange={(event) => setActivationReason(event.target.value)}
                        className="h-8 w-44"
                        placeholder="Reason (optional)"
                      />
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={activateMutation.isPending}
                      onClick={() =>
                        activateMutation.mutate({
                          userId: selectedUser.id,
                          reason: activationReason || undefined,
                        })
                      }
                    >
                      Activate
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={deactivateMutation.isPending}
                      onClick={() =>
                        deactivateMutation.mutate({
                          userId: selectedUser.id,
                          reason: activationReason || undefined,
                        })
                      }
                    >
                      Deactivate
                    </Button>
                  </div>
                ) : null}
                <div>
                  <h3 className="mb-2 text-sm font-medium">Memberships</h3>
                  {membershipsForUser.length === 0 ? (
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      No memberships
                    </p>
                  ) : (
                    <ul className="space-y-1 text-sm" data-testid="user-memberships">
                      {membershipsForUser.map((item) => (
                        <li key={item.id}>
                          {item.kind} → {item.targetId} ({item.status})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-medium">Service assignments</h3>
                  {serviceAssignmentsForUser.length === 0 ? (
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      No service assignments
                    </p>
                  ) : (
                    <ul
                      className="space-y-1 text-sm"
                      data-testid="user-service-assignments"
                    >
                      {serviceAssignmentsForUser.map((item) => (
                        <li key={item.id}>
                          {item.serviceCapability} ({item.status})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            ) : (
              <EmptyState title="Select a user" />
            )}
          </div>
        </div>
      ) : null}

      {section === "groups" ? (
        <EntityCrudPanel
          caption="Groups"
          items={groupsQuery.data?.items ?? []}
          isLoading={groupsQuery.isLoading}
          listError={groupsQuery.isError ? groupsQuery.error : null}
          selectedId={groupId}
          onSelect={setSelectedGroupId}
          detail={groupDetailQuery.data}
          detailLoading={groupDetailQuery.isLoading}
          detailError={groupDetailQuery.isError ? groupDetailQuery.error : null}
          canManage={canManage}
          showOrganisationId
          onCreate={(input) =>
            createGroupMutation.mutate({
              key: input.key,
              name: input.name,
              description: input.description,
              organisationId: input.organisationId,
            })
          }
          creating={createGroupMutation.isPending}
          onUpdate={(input) => updateGroupMutation.mutate(input)}
          updating={updateGroupMutation.isPending}
        />
      ) : null}

      {section === "roles" ? (
        <EntityCrudPanel
          caption="Roles"
          items={rolesQuery.data?.items ?? []}
          isLoading={rolesQuery.isLoading}
          listError={rolesQuery.isError ? rolesQuery.error : null}
          selectedId={roleId}
          onSelect={setSelectedRoleId}
          detail={roleDetailQuery.data}
          detailLoading={roleDetailQuery.isLoading}
          detailError={roleDetailQuery.isError ? roleDetailQuery.error : null}
          canManage={canManage}
          showOrganisationId
          onCreate={(input) =>
            createRoleMutation.mutate({
              key: input.key,
              name: input.name,
              description: input.description,
              organisationId: input.organisationId,
            })
          }
          creating={createRoleMutation.isPending}
          onUpdate={(input) => updateRoleMutation.mutate(input)}
          updating={updateRoleMutation.isPending}
        />
      ) : null}

      {section === "organisations" ? (
        <EntityCrudPanel
          caption="Organisations"
          items={organisationsQuery.data?.items ?? []}
          isLoading={organisationsQuery.isLoading}
          listError={organisationsQuery.isError ? organisationsQuery.error : null}
          selectedId={organisationId}
          onSelect={setSelectedOrganisationId}
          detail={organisationDetailQuery.data}
          detailLoading={organisationDetailQuery.isLoading}
          detailError={
            organisationDetailQuery.isError ? organisationDetailQuery.error : null
          }
          canManage={canManage}
          onCreate={(input) =>
            createOrganisationMutation.mutate({
              key: input.key,
              name: input.name,
              description: input.description,
            })
          }
          creating={createOrganisationMutation.isPending}
          onUpdate={(input) => updateOrganisationMutation.mutate(input)}
          updating={updateOrganisationMutation.isPending}
        />
      ) : null}

      {section === "tenants" ? (
        <EntityCrudPanel
          caption="Tenants"
          items={tenantsQuery.data?.items ?? []}
          isLoading={tenantsQuery.isLoading}
          listError={tenantsQuery.isError ? tenantsQuery.error : null}
          selectedId={tenantId}
          onSelect={setSelectedTenantId}
          detail={tenantDetailQuery.data}
          detailLoading={tenantDetailQuery.isLoading}
          detailError={tenantDetailQuery.isError ? tenantDetailQuery.error : null}
          canManage={canManage}
          onCreate={(input) =>
            createTenantMutation.mutate({
              key: input.key,
              name: input.name,
              description: input.description,
            })
          }
          creating={createTenantMutation.isPending}
          onUpdate={(input) => updateTenantMutation.mutate(input)}
          updating={updateTenantMutation.isPending}
        />
      ) : null}

      {section === "departments" ? (
        <EntityCrudPanel
          caption="Departments"
          items={departmentsQuery.data?.items ?? []}
          isLoading={departmentsQuery.isLoading}
          listError={departmentsQuery.isError ? departmentsQuery.error : null}
          selectedId={departmentId}
          onSelect={setSelectedDepartmentId}
          detail={departmentDetailQuery.data}
          detailLoading={departmentDetailQuery.isLoading}
          detailError={
            departmentDetailQuery.isError ? departmentDetailQuery.error : null
          }
          canManage={canManage}
          showOrganisationId
          organisationIdRequired
          onCreate={(input) =>
            createDepartmentMutation.mutate({
              organisationId: input.organisationId ?? "",
              key: input.key,
              name: input.name,
              description: input.description,
            })
          }
          creating={createDepartmentMutation.isPending}
          onUpdate={(input) => updateDepartmentMutation.mutate(input)}
          updating={updateDepartmentMutation.isPending}
        />
      ) : null}

      {section === "positions" ? (
        <EntityCrudPanel
          caption="Positions"
          items={positionsQuery.data?.items ?? []}
          isLoading={positionsQuery.isLoading}
          listError={positionsQuery.isError ? positionsQuery.error : null}
          selectedId={positionId}
          onSelect={setSelectedPositionId}
          detail={positionDetailQuery.data}
          detailLoading={positionDetailQuery.isLoading}
          detailError={positionDetailQuery.isError ? positionDetailQuery.error : null}
          canManage={canManage}
          showOrganisationId
          onCreate={(input) =>
            createPositionMutation.mutate({
              key: input.key,
              name: input.name,
              description: input.description,
              organisationId: input.organisationId,
            })
          }
          creating={createPositionMutation.isPending}
          onUpdate={(input) => updatePositionMutation.mutate(input)}
          updating={updatePositionMutation.isPending}
        />
      ) : null}

      {section === "memberships" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            {membershipsQuery.isLoading ? (
              <p role="status">Loading memberships…</p>
            ) : (membershipsQuery.data?.items.length ?? 0) === 0 ? (
              <EmptyState title="No memberships" />
            ) : (
              <MetaTable
                caption="Memberships"
                columns={["ID", "User", "Kind", "Target", "Status"]}
                selectedId={membershipId}
                onRowClick={setSelectedMembershipId}
                rows={(membershipsQuery.data?.items ?? []).map((item) => ({
                  id: item.id,
                  cells: [item.id, item.userId, item.kind, item.targetId, item.status],
                }))}
              />
            )}
            {canManage ? (
              <form
                className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  createMembershipMutation.mutate({
                    userId: membershipDraft.userId,
                    kind: membershipDraft.kind,
                    targetId: membershipDraft.targetId,
                  });
                  setMembershipDraft({ userId: "", kind: "", targetId: "" });
                }}
              >
                <h3 className="text-sm font-medium">Create membership</h3>
                <label className="flex flex-col gap-1 text-sm">
                  <span>User ID</span>
                  <Input
                    aria-label="Membership user id"
                    value={membershipDraft.userId}
                    onChange={(event) =>
                      setMembershipDraft((draft) => ({
                        ...draft,
                        userId: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Kind</span>
                  <Input
                    aria-label="Membership kind"
                    value={membershipDraft.kind}
                    onChange={(event) =>
                      setMembershipDraft((draft) => ({
                        ...draft,
                        kind: event.target.value,
                      }))
                    }
                    placeholder="group | role | department | position"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Target ID</span>
                  <Input
                    aria-label="Membership target id"
                    value={membershipDraft.targetId}
                    onChange={(event) =>
                      setMembershipDraft((draft) => ({
                        ...draft,
                        targetId: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={createMembershipMutation.isPending}
                >
                  Create membership
                </Button>
              </form>
            ) : null}
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">Detail</h2>
            {membershipDetailQuery.data ? (
              <>
                <dl className="grid gap-2 text-sm" data-testid="identity-detail">
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">User</dt>
                    <dd>{membershipDetailQuery.data.userId}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Kind</dt>
                    <dd>{membershipDetailQuery.data.kind}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Target</dt>
                    <dd>{membershipDetailQuery.data.targetId}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Status</dt>
                    <dd>{membershipDetailQuery.data.status}</dd>
                  </div>
                </dl>
                {canManage ? (
                  <form
                    className="flex items-end gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      updateMembershipMutation.mutate({
                        status: membershipStatusDraft || undefined,
                      });
                    }}
                  >
                    <label className="flex flex-col gap-1 text-sm">
                      <span>New status</span>
                      <Input
                        aria-label="Membership new status"
                        value={membershipStatusDraft}
                        onChange={(event) =>
                          setMembershipStatusDraft(event.target.value)
                        }
                        placeholder={membershipDetailQuery.data.status}
                      />
                    </label>
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      disabled={updateMembershipMutation.isPending}
                    >
                      Update status
                    </Button>
                  </form>
                ) : null}
              </>
            ) : (
              <EmptyState title="Select a membership" />
            )}
          </div>
        </div>
      ) : null}

      {section === "service-assignments" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            {serviceAssignmentsQuery.isLoading ? (
              <p role="status">Loading service assignments…</p>
            ) : (serviceAssignmentsQuery.data?.items.length ?? 0) === 0 ? (
              <EmptyState title="No service assignments" />
            ) : (
              <MetaTable
                caption="Service assignments"
                columns={["ID", "Subject kind", "Subject", "Capability", "Status"]}
                selectedId={serviceAssignmentId}
                onRowClick={setSelectedServiceAssignmentId}
                rows={(serviceAssignmentsQuery.data?.items ?? []).map((item) => ({
                  id: item.id,
                  cells: [
                    item.id,
                    item.subjectKind,
                    item.subjectId,
                    item.serviceCapability,
                    item.status,
                  ],
                }))}
              />
            )}
            {canManage ? (
              <form
                className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  createServiceAssignmentMutation.mutate({
                    subjectKind: serviceAssignmentDraft.subjectKind,
                    subjectId: serviceAssignmentDraft.subjectId,
                    serviceCapability: serviceAssignmentDraft.serviceCapability,
                  });
                  setServiceAssignmentDraft({
                    subjectKind: "user",
                    subjectId: "",
                    serviceCapability: SERVICE_CAPABILITY_OPTIONS[0],
                  });
                }}
              >
                <h3 className="text-sm font-medium">Create service assignment</h3>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Subject kind</span>
                  <Input
                    aria-label="Service assignment subject kind"
                    value={serviceAssignmentDraft.subjectKind}
                    onChange={(event) =>
                      setServiceAssignmentDraft((draft) => ({
                        ...draft,
                        subjectKind: event.target.value,
                      }))
                    }
                    placeholder="user | group"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Subject ID</span>
                  <Input
                    aria-label="Service assignment subject id"
                    value={serviceAssignmentDraft.subjectId}
                    onChange={(event) =>
                      setServiceAssignmentDraft((draft) => ({
                        ...draft,
                        subjectId: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Service capability</span>
                  <select
                    aria-label="Service capability"
                    value={serviceAssignmentDraft.serviceCapability}
                    onChange={(event) =>
                      setServiceAssignmentDraft((draft) => ({
                        ...draft,
                        serviceCapability: event.target.value,
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-sm text-[var(--color-foreground)]"
                  >
                    {SERVICE_CAPABILITY_OPTIONS.map((capability) => (
                      <option key={capability} value={capability}>
                        {capability}
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={createServiceAssignmentMutation.isPending}
                >
                  Create service assignment
                </Button>
              </form>
            ) : null}
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">Detail</h2>
            {serviceAssignmentDetailQuery.data ? (
              <>
                <dl className="grid gap-2 text-sm" data-testid="identity-detail">
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">
                      Subject kind
                    </dt>
                    <dd>{serviceAssignmentDetailQuery.data.subjectKind}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Subject</dt>
                    <dd>{serviceAssignmentDetailQuery.data.subjectId}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Capability</dt>
                    <dd>{serviceAssignmentDetailQuery.data.serviceCapability}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Status</dt>
                    <dd>{serviceAssignmentDetailQuery.data.status}</dd>
                  </div>
                </dl>
                {canManage ? (
                  <form
                    className="flex items-end gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      updateServiceAssignmentMutation.mutate({
                        status: serviceAssignmentStatusDraft || undefined,
                      });
                    }}
                  >
                    <label className="flex flex-col gap-1 text-sm">
                      <span>New status</span>
                      <Input
                        aria-label="Service assignment new status"
                        value={serviceAssignmentStatusDraft}
                        onChange={(event) =>
                          setServiceAssignmentStatusDraft(event.target.value)
                        }
                        placeholder={serviceAssignmentDetailQuery.data.status}
                      />
                    </label>
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      disabled={updateServiceAssignmentMutation.isPending}
                    >
                      Update status
                    </Button>
                  </form>
                ) : null}
              </>
            ) : (
              <EmptyState title="Select a service assignment" />
            )}
          </div>
        </div>
      ) : null}

      {section === "invitations" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <NoticeBanner text={INVITATION_BANNER} testId="banner-invitations" />
            {invitationsQuery.isLoading ? (
              <p role="status">Loading invitations…</p>
            ) : (invitationsQuery.data?.items.length ?? 0) === 0 ? (
              <EmptyState title="No invitations" />
            ) : (
              <MetaTable
                caption="Invitations"
                columns={["ID", "Email", "Status", "Expires"]}
                selectedId={invitationId}
                onRowClick={setSelectedInvitationId}
                rows={(invitationsQuery.data?.items ?? []).map((item) => ({
                  id: item.id,
                  cells: [item.id, item.email, item.status, item.expiresAt ?? "—"],
                }))}
              />
            )}
            {canManage ? (
              <form
                className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  createInvitationMutation.mutate({
                    email: invitationDraft.email,
                    organisationId: invitationDraft.organisationId || undefined,
                    invitedUserId: invitationDraft.invitedUserId || undefined,
                    expiresAt: invitationDraft.expiresAt || undefined,
                  });
                  setInvitationDraft({
                    email: "",
                    organisationId: "",
                    invitedUserId: "",
                    expiresAt: "",
                  });
                }}
              >
                <h3 className="text-sm font-medium">Create invitation</h3>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Email</span>
                  <Input
                    aria-label="Invitation email"
                    type="email"
                    value={invitationDraft.email}
                    onChange={(event) =>
                      setInvitationDraft((draft) => ({
                        ...draft,
                        email: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Organisation ID (optional)</span>
                  <Input
                    aria-label="Invitation organisation id"
                    value={invitationDraft.organisationId}
                    onChange={(event) =>
                      setInvitationDraft((draft) => ({
                        ...draft,
                        organisationId: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Invited user ID (optional)</span>
                  <Input
                    aria-label="Invitation invited user id"
                    value={invitationDraft.invitedUserId}
                    onChange={(event) =>
                      setInvitationDraft((draft) => ({
                        ...draft,
                        invitedUserId: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Expires at (optional, ISO-8601)</span>
                  <Input
                    aria-label="Invitation expiry"
                    value={invitationDraft.expiresAt}
                    onChange={(event) =>
                      setInvitationDraft((draft) => ({
                        ...draft,
                        expiresAt: event.target.value,
                      }))
                    }
                    placeholder="2026-12-31T00:00:00.000Z"
                  />
                </label>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={createInvitationMutation.isPending}
                >
                  Create invitation
                </Button>
              </form>
            ) : null}
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">Detail</h2>
            {invitationDetailQuery.data ? (
              <>
                <dl className="grid gap-2 text-sm" data-testid="identity-detail">
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Email</dt>
                    <dd>{invitationDetailQuery.data.email}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Status</dt>
                    <dd>{invitationDetailQuery.data.status}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Expires</dt>
                    <dd>{invitationDetailQuery.data.expiresAt ?? "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Delivery</dt>
                    <dd data-testid="invitation-no-email">{INVITATION_BANNER}</dd>
                  </div>
                </dl>
                {canManage ? (
                  <form
                    className="flex items-end gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      updateInvitationMutation.mutate({
                        status: invitationStatusDraft || undefined,
                      });
                    }}
                  >
                    <label className="flex flex-col gap-1 text-sm">
                      <span>New status</span>
                      <Input
                        aria-label="Invitation new status"
                        value={invitationStatusDraft}
                        onChange={(event) =>
                          setInvitationStatusDraft(event.target.value)
                        }
                        placeholder={invitationDetailQuery.data.status}
                      />
                    </label>
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      disabled={updateInvitationMutation.isPending}
                    >
                      Update status
                    </Button>
                  </form>
                ) : null}
              </>
            ) : (
              <EmptyState title="Select an invitation" />
            )}
          </div>
        </div>
      ) : null}

      {section === "policies" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            {policiesQuery.isLoading ? (
              <p role="status">Loading policies…</p>
            ) : (policiesQuery.data?.items.length ?? 0) === 0 ? (
              <EmptyState title="No policies" />
            ) : (
              <MetaTable
                caption="Policies"
                columns={["ID", "Kind", "Key", "Name"]}
                selectedId={policyId}
                onRowClick={setSelectedPolicyId}
                rows={(policiesQuery.data?.items ?? []).map((item) => ({
                  id: item.id,
                  cells: [item.id, item.kind, item.key, item.name],
                }))}
              />
            )}
            {canManage ? (
              <form
                className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  createPolicyMutation.mutate({
                    key: policyDraft.key,
                    name: policyDraft.name,
                    kind: policyDraft.kind,
                    description: policyDraft.description || undefined,
                    organisationId: policyDraft.organisationId || undefined,
                  });
                  setPolicyDraft({
                    key: "",
                    name: "",
                    kind: "",
                    description: "",
                    organisationId: "",
                  });
                }}
              >
                <h3 className="text-sm font-medium">Create policy</h3>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Key</span>
                  <Input
                    aria-label="Policy key"
                    value={policyDraft.key}
                    onChange={(event) =>
                      setPolicyDraft((draft) => ({ ...draft, key: event.target.value }))
                    }
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Name</span>
                  <Input
                    aria-label="Policy name"
                    value={policyDraft.name}
                    onChange={(event) =>
                      setPolicyDraft((draft) => ({
                        ...draft,
                        name: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Kind</span>
                  <Input
                    aria-label="Policy kind"
                    value={policyDraft.kind}
                    onChange={(event) =>
                      setPolicyDraft((draft) => ({
                        ...draft,
                        kind: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Description (optional)</span>
                  <Input
                    aria-label="Policy description"
                    value={policyDraft.description}
                    onChange={(event) =>
                      setPolicyDraft((draft) => ({
                        ...draft,
                        description: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Organisation ID (optional)</span>
                  <Input
                    aria-label="Policy organisation id"
                    value={policyDraft.organisationId}
                    onChange={(event) =>
                      setPolicyDraft((draft) => ({
                        ...draft,
                        organisationId: event.target.value,
                      }))
                    }
                  />
                </label>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={createPolicyMutation.isPending}
                >
                  Create policy
                </Button>
              </form>
            ) : null}
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">Detail</h2>
            {policyDetailQuery.data ? (
              <>
                <dl className="grid gap-2 text-sm" data-testid="identity-detail">
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Name</dt>
                    <dd>{policyDetailQuery.data.name}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Kind</dt>
                    <dd>{policyDetailQuery.data.kind}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">
                      Description
                    </dt>
                    <dd>{policyDetailQuery.data.description ?? "—"}</dd>
                  </div>
                </dl>
                {canManage ? (
                  <form
                    className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] p-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      updatePolicyMutation.mutate({
                        name: policyEditDraft.name || undefined,
                        description: policyEditDraft.description || undefined,
                      });
                    }}
                  >
                    <label className="flex flex-col gap-1 text-sm">
                      <span>Name</span>
                      <Input
                        aria-label="Policy update name"
                        value={policyEditDraft.name}
                        onChange={(event) =>
                          setPolicyEditDraft((draft) => ({
                            ...draft,
                            name: event.target.value,
                          }))
                        }
                        placeholder={policyDetailQuery.data.name}
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span>Description</span>
                      <Input
                        aria-label="Policy update description"
                        value={policyEditDraft.description}
                        onChange={(event) =>
                          setPolicyEditDraft((draft) => ({
                            ...draft,
                            description: event.target.value,
                          }))
                        }
                        placeholder={policyDetailQuery.data.description ?? ""}
                      />
                    </label>
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      disabled={updatePolicyMutation.isPending}
                    >
                      Update policy
                    </Button>
                  </form>
                ) : null}
              </>
            ) : (
              <EmptyState title="Select a policy" />
            )}
          </div>
        </div>
      ) : null}

      {section === "audit" ? (
        <div>
          {auditQuery.isLoading ? (
            <p role="status">Loading audit…</p>
          ) : (auditQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No audit entries" />
          ) : (
            <MetaTable
              caption="Audit"
              testId="identity-audit-table"
              columns={["Time", "Action", "Actor", "User", "Detail"]}
              rows={(auditQuery.data?.items ?? []).map((entry) => ({
                id: entry.id,
                cells: [
                  entry.createdAt,
                  entry.action,
                  entry.actorUserId,
                  entry.userId ?? "—",
                  entry.detail ?? "—",
                ],
              }))}
            />
          )}
        </div>
      ) : null}

      {section === "history" ? (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span>Filter by user ID (optional)</span>
            <Input
              aria-label="History user filter"
              value={historyUserFilter}
              onChange={(event) => setHistoryUserFilter(event.target.value)}
              placeholder="usr_…"
            />
          </label>
          {historyQuery.isLoading ? (
            <p role="status">Loading history…</p>
          ) : (historyQuery.data?.items.length ?? 0) === 0 ? (
            <EmptyState title="No history entries" />
          ) : (
            <MetaTable
              caption="History"
              testId="identity-history-table"
              columns={["Time", "Summary", "Actor", "User"]}
              rows={(historyQuery.data?.items ?? []).map((entry) => ({
                id: entry.id,
                cells: [
                  entry.createdAt,
                  entry.summary,
                  entry.actorUserId,
                  entry.userId ?? "—",
                ],
              }))}
            />
          )}
        </div>
      ) : null}

      {section === "references" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            {referencesQuery.isLoading ? (
              <p role="status">Loading references…</p>
            ) : (referencesQuery.data?.items.length ?? 0) === 0 ? (
              <EmptyState title="No references" />
            ) : (
              <MetaTable
                caption="References"
                columns={["ID", "Kind", "Target", "Label"]}
                selectedId={referenceId}
                onRowClick={setSelectedReferenceId}
                rows={(referencesQuery.data?.items ?? []).map((item) => ({
                  id: item.id,
                  cells: [item.id, item.kind, item.target, item.label ?? "—"],
                }))}
              />
            )}
            {canManage ? (
              <form
                className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  createReferenceMutation.mutate({
                    kind: referenceDraft.kind,
                    target: referenceDraft.target,
                    label: referenceDraft.label || undefined,
                    userId: referenceDraft.userId || undefined,
                  });
                  setReferenceDraft({ kind: "", target: "", label: "", userId: "" });
                }}
              >
                <h3 className="text-sm font-medium">Create reference</h3>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Kind</span>
                  <Input
                    aria-label="Reference kind"
                    value={referenceDraft.kind}
                    onChange={(event) =>
                      setReferenceDraft((draft) => ({
                        ...draft,
                        kind: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Target</span>
                  <Input
                    aria-label="Reference target"
                    value={referenceDraft.target}
                    onChange={(event) =>
                      setReferenceDraft((draft) => ({
                        ...draft,
                        target: event.target.value,
                      }))
                    }
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>Label (optional)</span>
                  <Input
                    aria-label="Reference label"
                    value={referenceDraft.label}
                    onChange={(event) =>
                      setReferenceDraft((draft) => ({
                        ...draft,
                        label: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span>User ID (optional)</span>
                  <Input
                    aria-label="Reference user id"
                    value={referenceDraft.userId}
                    onChange={(event) =>
                      setReferenceDraft((draft) => ({
                        ...draft,
                        userId: event.target.value,
                      }))
                    }
                  />
                </label>
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={createReferenceMutation.isPending}
                >
                  Create reference
                </Button>
              </form>
            ) : null}
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium">Detail</h2>
            {referenceDetailQuery.data ? (
              <>
                <dl className="grid gap-2 text-sm" data-testid="identity-detail">
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Kind</dt>
                    <dd>{referenceDetailQuery.data.kind}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Target</dt>
                    <dd>{referenceDetailQuery.data.target}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">Label</dt>
                    <dd>{referenceDetailQuery.data.label ?? "—"}</dd>
                  </div>
                </dl>
                {canManage ? (
                  <form
                    className="flex flex-col gap-2 rounded-lg border border-[var(--color-border)] p-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      updateReferenceMutation.mutate({
                        target: referenceEditDraft.target || undefined,
                        label: referenceEditDraft.label || undefined,
                      });
                    }}
                  >
                    <label className="flex flex-col gap-1 text-sm">
                      <span>Target</span>
                      <Input
                        aria-label="Reference update target"
                        value={referenceEditDraft.target}
                        onChange={(event) =>
                          setReferenceEditDraft((draft) => ({
                            ...draft,
                            target: event.target.value,
                          }))
                        }
                        placeholder={referenceDetailQuery.data.target}
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span>Label</span>
                      <Input
                        aria-label="Reference update label"
                        value={referenceEditDraft.label}
                        onChange={(event) =>
                          setReferenceEditDraft((draft) => ({
                            ...draft,
                            label: event.target.value,
                          }))
                        }
                        placeholder={referenceDetailQuery.data.label ?? ""}
                      />
                    </label>
                    <Button
                      type="submit"
                      variant="outline"
                      size="sm"
                      disabled={updateReferenceMutation.isPending}
                    >
                      Update reference
                    </Button>
                  </form>
                ) : null}
              </>
            ) : (
              <EmptyState title="Select a reference" />
            )}
          </div>
        </div>
      ) : null}

      {section === "diagnostics" ? (
        <div className="flex flex-col gap-4">
          <NoticeBanner text={AUTH_BANNER} testId="banner-auth" />
          <NoticeBanner text={PROVISIONING_BANNER} testId="banner-provisioning" />
          <NoticeBanner text={DIRECTORY_SYNC_BANNER} testId="banner-directory-sync" />
          {healthQuery.isError && isUnavailable(healthQuery.error) ? (
            <ErrorState
              unavailable
              message={toIdentityUserMessage(healthQuery.error)}
            />
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <StatusCard
                  label="Identity enabled"
                  value={
                    managementCapsQuery.data?.identityEnabled ? "Ready" : "Unavailable"
                  }
                  testId="diag-identity"
                />
                <StatusCard
                  label="HTTP enabled"
                  value={
                    managementCapsQuery.data?.httpEnabled ? "Ready" : "Unavailable"
                  }
                  testId="diag-http"
                />
                <StatusCard
                  label="Workbench enabled"
                  value={
                    managementCapsQuery.data?.workbenchEnabled ? "Ready" : "Unavailable"
                  }
                  testId="diag-workbench"
                />
                <StatusCard
                  label="Authentication managed"
                  value="Unavailable"
                  testId="diag-authentication"
                  emphasize
                />
                <StatusCard
                  label="Provisioning"
                  value="Unavailable"
                  testId="diag-provisioning"
                  emphasize
                />
                <StatusCard
                  label="Directory sync"
                  value="Unavailable"
                  testId="diag-directory-sync"
                  emphasize
                />
                <StatusCard
                  label="Readiness"
                  value={
                    (readinessQuery.data as { ready?: boolean } | undefined)?.ready
                      ? "Ready"
                      : "Unavailable"
                  }
                  testId="diag-readiness"
                />
                <StatusCard
                  label="Health status"
                  value={String(
                    (healthQuery.data as { status?: string } | undefined)?.status ??
                      "unknown",
                  )}
                  testId="diag-health"
                />
              </div>
              {healthQuery.data ? (
                <pre
                  className="overflow-x-auto rounded-lg border border-[var(--color-border)] p-3 text-xs"
                  data-testid="diagnostics-health"
                >
                  {JSON.stringify(healthQuery.data, null, 2)}
                </pre>
              ) : null}
              {readinessQuery.data ? (
                <pre className="overflow-x-auto rounded-lg border border-[var(--color-border)] p-3 text-xs">
                  {JSON.stringify(readinessQuery.data, null, 2)}
                </pre>
              ) : null}
              {capabilitiesQuery.data ? (
                <pre className="overflow-x-auto rounded-lg border border-[var(--color-border)] p-3 text-xs">
                  {JSON.stringify(capabilitiesQuery.data, null, 2)}
                </pre>
              ) : null}
              {managementCapsQuery.data ? (
                <pre
                  className="overflow-x-auto rounded-lg border border-[var(--color-border)] p-3 text-xs"
                  data-testid="diagnostics-management-capabilities"
                >
                  {JSON.stringify(managementCapsQuery.data, null, 2)}
                </pre>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </PageShell>
  );
}
