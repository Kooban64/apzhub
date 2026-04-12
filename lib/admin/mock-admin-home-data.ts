import type { AdminActionRequiredItem } from "@/lib/admin/contracts/alerts";
import { adminAlertsPanelSchema } from "@/lib/admin/contracts/alerts";
import type { AdminAuditSnippet } from "@/lib/admin/contracts/audit";
import { adminAuditSnippetSchema } from "@/lib/admin/contracts/audit";
import type { AdminHealthStrip } from "@/lib/admin/contracts/health";
import { adminHealthStripSchema } from "@/lib/admin/contracts/health";
import type { AdminPrivilegedActionTrace } from "@/lib/admin/contracts/privileged-action-trace";
import { adminPrivilegedActionListSchema } from "@/lib/admin/contracts/privileged-action-trace";
import type { AdminProvisioningPreview } from "@/lib/admin/contracts/provisioning";
import { adminProvisioningPreviewSchema } from "@/lib/admin/contracts/provisioning";
import type { AdminQuickActions } from "@/lib/admin/contracts/quick-actions";
import { adminQuickActionsSchema } from "@/lib/admin/contracts/quick-actions";

export type AdminHomeData = {
  health: AdminHealthStrip;
  alerts: AdminActionRequiredItem[];
  provisioning: AdminProvisioningPreview;
  audit: AdminAuditSnippet;
  quickActions: AdminQuickActions;
};

const rawHealth = {
  overall: "degraded" as const,
  headline: "Google Workspace connector latency elevated; no user write impact detected.",
  subsystems: [
    {
      id: "api",
      name: "Control API",
      status: "ok" as const,
      detail: "p99 within SLO",
    },
    {
      id: "google",
      name: "Google connector",
      status: "degraded" as const,
      detail: "Elevated token refresh latency",
      since: "2026-04-10T14:22:00Z",
    },
    {
      id: "jobs",
      name: "Job runner",
      status: "ok" as const,
      detail: "Queue depth nominal",
    },
  ],
};

const rawAlerts: AdminActionRequiredItem[] = [
  {
    id: "alert-1",
    severity: "critical",
    title: "Pending domain verification",
    summary: "Acme Corp — DNS TXT not detected after 48h.",
    domain: "platform",
    pointerKind: "route",
    pointerRoute: "/admin/users",
    recoveryHint: "Open Users, locate the tenant admin contact, and confirm DNS propagation before retrying verification.",
    ctaLabel: "Open users",
    ctaHref: "/admin/users",
    blocked: false,
  },
  {
    id: "alert-2",
    severity: "warning",
    title: "SCIM token expiring",
    summary: "Northwind — token expires in 6 days.",
    domain: "security",
    pointerKind: "route",
    pointerRoute: "/admin/provisioning",
    recoveryHint: "Rotate the SCIM token from tenant security settings, then confirm the provisioning queue is clear.",
    ctaLabel: "Open provisioning",
    ctaHref: "/admin/provisioning",
    blocked: false,
  },
  {
    id: "alert-3",
    severity: "info",
    title: "Provisioning job retry storm",
    summary: "Three jobs failed for the same connector in 10 minutes.",
    domain: "provisioning",
    pointerKind: "job",
    pointerId: "job-cal-fail",
    pointerRoute: "/admin/provisioning",
    recoveryHint: "Inspect the failed job, apply the recommended fix, then retry from the queue inspector.",
    ctaLabel: "View queue",
    ctaHref: "/admin/provisioning",
    blocked: false,
  },
];

const rawProvisioning = {
  rows: [
    {
      id: "prov-1",
      tenantLabel: "Contoso Ltd",
      requestType: "New tenant",
      stage: "provisioning" as const,
      updatedAt: "2026-04-11T09:15:00Z",
    },
    {
      id: "prov-2",
      tenantLabel: "Fabrikam",
      requestType: "Seat expansion",
      stage: "awaiting_approval" as const,
      updatedAt: "2026-04-11T08:40:00Z",
    },
    {
      id: "prov-3",
      tenantLabel: "Adventure Works",
      requestType: "Connector repair",
      stage: "queued" as const,
      updatedAt: "2026-04-10T22:01:00Z",
    },
  ],
};

const rawAudit = {
  events: [
    {
      id: "aud-1",
      actor: "ops.admin@example.com",
      verb: "suspended_user",
      target: "user/u-8821",
      at: "2026-04-11T10:02:11Z",
      domain: "identity" as const,
      outcome: "success" as const,
      metadata: "reason=manual_review",
      contextSummary: "User suspended after manual review; session invalidated on next request.",
    },
    {
      id: "aud-2",
      actor: "system",
      verb: "token_rotated",
      target: "connector/google",
      at: "2026-04-11T09:58:00Z",
      domain: "security" as const,
      outcome: "success" as const,
      contextSummary: "Connector secret rotated on schedule; no operator action required.",
    },
    {
      id: "aud-3",
      actor: "ops.admin@example.com",
      verb: "updated_tenant_policy",
      target: "tenant/acme",
      at: "2026-04-11T09:12:44Z",
      domain: "access" as const,
      outcome: "success" as const,
      contextSummary: "Bundle default roles tightened for new hires.",
    },
    {
      id: "aud-4",
      actor: "system",
      verb: "launch_blocked",
      target: "service/calendar/user/u-1002",
      at: "2026-04-11T08:40:00Z",
      domain: "launch" as const,
      outcome: "blocked" as const,
      contextSummary: "Launch denied: no effective role for calendar (launch reason no_access).",
    },
    {
      id: "aud-5",
      actor: "pat@example.com",
      verb: "google_disconnected",
      target: "linked_account/google",
      at: "2026-04-11T08:05:00Z",
      domain: "linked_account" as const,
      outcome: "success" as const,
      contextSummary: "User disconnected Google from profile; mail/calendar widgets moved to connectable state.",
    },
    {
      id: "aud-6",
      actor: "system",
      verb: "provisioning_job_failed",
      target: "job/job-cal-fail",
      at: "2026-04-10T18:05:00Z",
      domain: "provisioning" as const,
      outcome: "failure" as const,
      contextSummary: "Connector timeout; job surfaced in admin queue for retry.",
    },
  ],
};

const rawPrivileged = {
  items: [
    {
      id: "priv-1",
      correlationId: "corr-9f2a",
      actor: "ops.admin@example.com",
      verb: "user_suspend",
      target: "user/u-8821",
      domain: "identity",
      at: "2026-04-11T10:02:10Z",
      outcome: "success",
      contextSummary: "Suspension confirmed against policy ticket PDQ-441.",
    },
    {
      id: "priv-2",
      correlationId: "corr-8b11",
      actor: "ops.admin@example.com",
      verb: "policy_update",
      target: "tenant/acme/access",
      domain: "access",
      at: "2026-04-11T09:12:40Z",
      outcome: "success",
    },
    {
      id: "priv-3",
      correlationId: "corr-7aa0",
      actor: "ops.admin@example.com",
      verb: "manual_provisioning_override",
      target: "job/job-manual-1",
      domain: "provisioning",
      at: "2026-04-09T12:29:00Z",
      outcome: "pending",
      contextSummary: "Awaiting second approver for revoke propagation.",
    },
  ],
};

const rawQuickActions = {
  actions: [
    {
      id: "qa-refresh",
      label: "Refresh health snapshot",
      href: "/admin",
      disabled: false,
    },
    {
      id: "qa-export",
      label: "Export audit slice (7d)",
      disabled: true,
      disabledReason: "Exports are not available in this build.",
    },
    {
      id: "qa-incident",
      label: "Open incident channel",
      href: "mailto:incidents@example.com?subject=Apzhub%20incident",
      disabled: false,
    },
  ],
};

/** Parsed mock snapshot for admin home — never construct UI payloads by hand. */
export function getMockAdminHomeData(): AdminHomeData {
  const health = adminHealthStripSchema.parse(rawHealth);
  const alertsPanel = adminAlertsPanelSchema.parse({ items: rawAlerts });
  const provisioning = adminProvisioningPreviewSchema.parse(rawProvisioning);
  const audit = adminAuditSnippetSchema.parse(rawAudit);
  const quickActions = adminQuickActionsSchema.parse(rawQuickActions);
  return {
    health,
    alerts: alertsPanel.items,
    provisioning,
    audit,
    quickActions,
  };
}

export function getMockPrivilegedActionTraces(): AdminPrivilegedActionTrace[] {
  return adminPrivilegedActionListSchema.parse(rawPrivileged).items;
}
