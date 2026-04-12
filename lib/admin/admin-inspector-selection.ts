import type { AdminActionRequiredItem } from "@/lib/admin/contracts/alerts";
import type { AdminAuditEvent } from "@/lib/admin/contracts/audit";
import type { AdminProvisioningQueueRow } from "@/lib/admin/contracts/provisioning";
import type { AccessRealizationStatus } from "@/lib/admin/access/realization-status";
import { getAllowedJobActions } from "@/lib/admin/provisioning/job-actions";
import type { AdminProvisioningJob } from "@/lib/admin/provisioning/job-contract";

/** Where the selection originated in the admin shell. */
export type AdminInspectorScope = "none" | "home" | "user" | "matrix_cell" | "provisioning";

/** Stable discriminator for inspector body routing (avoid panel-specific branching on id shape alone). */
export type AdminInspectorKind =
  | "none"
  | "home_alert"
  | "home_queue"
  | "home_audit"
  | "directory_user"
  | "matrix_cell"
  | "provisioning_job";

export type AdminInspectorSelectionStatus = "active" | "stale" | "blocked" | null;

export type AdminInspectorAction = {
  id: string;
  label: string;
  disabled: boolean;
  disabledReason?: string;
};

/** Frozen inspector selection — extend fields here as new admin surfaces ship. */
export type AdminInspectorSelection = {
  scope: AdminInspectorScope;
  id: string | null;
  kind: AdminInspectorKind;
  title: string | null;
  status: AdminInspectorSelectionStatus;
  actions: AdminInspectorAction[];
};

export function emptyAdminInspectorSelection(): AdminInspectorSelection {
  return {
    scope: "none",
    id: null,
    kind: "none",
    title: null,
    status: null,
    actions: [],
  };
}

function ctaAction(item: AdminActionRequiredItem): AdminInspectorAction[] {
  if (!item.ctaLabel) {
    return [];
  }
  return [
    {
      id: "primary_cta",
      label: item.ctaLabel,
      disabled: item.blocked || !item.ctaHref,
      disabledReason: item.blocked
        ? "Complete prerequisites before this action is available."
        : !item.ctaHref
          ? "No destination configured."
          : undefined,
    },
  ];
}

export function selectHomeAlert(item: AdminActionRequiredItem): AdminInspectorSelection {
  return {
    scope: "home",
    id: item.id,
    kind: "home_alert",
    title: item.title,
    status: item.blocked ? "blocked" : "active",
    actions: ctaAction(item),
  };
}

export function selectHomeQueue(row: AdminProvisioningQueueRow): AdminInspectorSelection {
  return {
    scope: "home",
    id: row.id,
    kind: "home_queue",
    title: row.tenantLabel,
    status: row.stage === "failed" ? "blocked" : "active",
    actions: [
      {
        id: "open_provisioning_queue",
        label: "Open provisioning queue",
        disabled: false,
      },
    ],
  };
}

export function selectHomeAudit(ev: AdminAuditEvent): AdminInspectorSelection {
  return {
    scope: "home",
    id: ev.id,
    kind: "home_audit",
    title: `${ev.verb} → ${ev.target}`,
    status: "active",
    actions: [],
  };
}

export function selectDirectoryUser(input: {
  userId: string;
  displayName: string;
  status: AdminInspectorSelectionStatus;
}): AdminInspectorSelection {
  return {
    scope: "user",
    id: input.userId,
    kind: "directory_user",
    title: input.displayName,
    status: input.status,
    actions: [
      { id: "open_matrix", label: "Show in access matrix", disabled: false },
      { id: "edit_overrides", label: "Edit overrides", disabled: true, disabledReason: "Not available in this build." },
    ],
  };
}

/** Matrix cell id encoding: `${userId}::${serviceId}` */
export function matrixCellSelectionId(userId: string, serviceId: string): string {
  return `${userId}::${serviceId}`;
}

export function parseMatrixCellId(id: string): { userId: string; serviceId: string } | null {
  const parts = id.split("::");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return null;
  }
  return { userId: parts[0], serviceId: parts[1] };
}

export function selectMatrixCell(input: {
  userId: string;
  serviceId: string;
  title: string;
  status: AdminInspectorSelectionStatus;
  activeJobId?: string | null;
}): AdminInspectorSelection {
  const actions: AdminInspectorAction[] = [
    { id: "open_user", label: "Open user", disabled: false },
    { id: "edit_cell", label: "Edit access", disabled: true, disabledReason: "Not available in this build." },
  ];
  if (input.activeJobId) {
    actions.push({ id: "open_job", label: "Open provisioning job", disabled: false });
  }
  return {
    scope: "matrix_cell",
    id: matrixCellSelectionId(input.userId, input.serviceId),
    kind: "matrix_cell",
    title: input.title,
    status: input.status,
    actions,
  };
}

export function isSelectionEmpty(s: AdminInspectorSelection): boolean {
  return s.scope === "none" || s.kind === "none" || !s.id;
}

export function selectProvisioningJob(job: AdminProvisioningJob): AdminInspectorSelection {
  const actions = getAllowedJobActions(job).map((a) => ({
    id: a.id,
    label: a.label,
    disabled: a.disabled,
    disabledReason: a.disabledReason,
  }));
  const status: AdminInspectorSelectionStatus =
    job.status === "failed" || job.status === "cancelled"
      ? "blocked"
      : job.status === "superseded"
        ? "stale"
        : "active";
  return {
    scope: "provisioning",
    id: job.id,
    kind: "provisioning_job",
    title: job.subjectLabel,
    status,
    actions,
  };
}

export function matrixCellSelectionInspectorStatus(
  realization: AccessRealizationStatus | undefined,
): AdminInspectorSelectionStatus {
  if (!realization) {
    return "active";
  }
  if (
    realization === "failed" ||
    realization === "manual_action" ||
    realization === "suspended" ||
    realization === "revoked"
  ) {
    return "blocked";
  }
  return "active";
}
