import type { AdminMatrixModel } from "@/lib/admin/access/matrix";
import { adminMatrixModelSchema } from "@/lib/admin/access/matrix";
import type { AdminBundleDetail, AdminBundleList } from "@/lib/admin/access/bundles";
import { adminBundleDetailSchema, adminBundleListSchema } from "@/lib/admin/access/bundles";
import type { AdminServiceDetail, AdminServiceList } from "@/lib/admin/access/services";
import { adminServiceDetailSchema, adminServiceListSchema } from "@/lib/admin/access/services";
import type { AdminUserAccessDetail } from "@/lib/admin/access/user-access-inspector";
import { adminUserAccessDetailSchema } from "@/lib/admin/access/user-access-inspector";
import type { AdminUserDirectory } from "@/lib/admin/access/user-directory";
import { adminUserDirectorySchema } from "@/lib/admin/access/user-directory";

export type AdminAccessData = {
  directory: AdminUserDirectory;
  userAccessByUserId: Record<string, AdminUserAccessDetail>;
  matrix: AdminMatrixModel;
  bundles: AdminBundleList;
  bundleDetailsById: Record<string, AdminBundleDetail>;
  services: AdminServiceList;
  serviceDetailsById: Record<string, AdminServiceDetail>;
};

/** Convenience: flat user list from directory. */
export function usersFromAccessData(data: AdminAccessData) {
  return data.directory.users;
}

const rawDirectory = {
  users: [
    {
      id: "u-1001",
      displayName: "Alex Rivera",
      email: "alex.rivera@example.com",
      platformRole: "admin" as const,
      status: "active" as const,
      linkedAccounts: [{ provider: "Google", state: "linked" as const }],
      lastLoginAt: "2026-04-11T08:10:00Z",
      accessSummary: { label: "Full workspace + admin", tone: "ok" as const },
      issueFlags: [] as const,
    },
    {
      id: "u-1002",
      displayName: "Jordan Lee",
      email: "jordan.lee@example.com",
      platformRole: "user" as const,
      status: "active" as const,
      linkedAccounts: [{ provider: "Google", state: "not_linked" as const }],
      lastLoginAt: "2026-04-09T14:22:00Z",
      accessSummary: { label: "Standard employee bundle", tone: "warning" as const },
      issueFlags: ["mfa_missing" as const],
    },
    {
      id: "u-1003",
      displayName: "Sam Patel",
      email: "sam.patel@example.com",
      platformRole: "user" as const,
      status: "suspended" as const,
      linkedAccounts: [{ provider: "Google", state: "error" as const }],
      lastLoginAt: "2026-03-01T11:00:00Z",
      accessSummary: { label: "Suspended — overrides frozen", tone: "critical" as const },
      issueFlags: ["suspended" as const, "policy_conflict" as const],
    },
  ],
};

const rawUserAccess: Record<string, AdminUserAccessDetail> = {
  "u-1001": {
    userId: "u-1001",
    displayName: "Alex Rivera",
    email: "alex.rivera@example.com",
    platformRole: "admin",
    bundleAssignments: [
      { bundleId: "b-admin", bundleName: "Administrators" },
      { bundleId: "b-core", bundleName: "Core collaboration" },
    ],
    serviceAccess: [
      {
        serviceId: "mail",
        serviceName: "Mail",
        effectiveRole: "editor",
        source: "bundle",
        realizationStatus: "provisioned",
        activeJobId: "job-mail-1",
        lastJobSummary: "Grant succeeded",
      },
      {
        serviceId: "calendar",
        serviceName: "Calendar",
        effectiveRole: "editor",
        source: "bundle_plus_override",
        realizationStatus: "pending",
        activeJobId: "job-cal-2",
        lastJobSummary: "ACL push queued",
      },
      {
        serviceId: "drive",
        serviceName: "Drive",
        effectiveRole: "viewer",
        source: "direct",
        realizationStatus: "provisioned",
        lastJobSummary: "Org default applied",
      },
    ],
  },
  "u-1002": {
    userId: "u-1002",
    displayName: "Jordan Lee",
    email: "jordan.lee@example.com",
    platformRole: "user",
    bundleAssignments: [{ bundleId: "b-std", bundleName: "Standard employee" }],
    serviceAccess: [
      {
        serviceId: "mail",
        serviceName: "Mail",
        effectiveRole: "viewer",
        source: "bundle",
        realizationStatus: "provisioned",
      },
      {
        serviceId: "calendar",
        serviceName: "Calendar",
        effectiveRole: "none",
        source: "none",
        realizationStatus: "failed",
        activeJobId: "job-cal-fail",
        lastJobSummary: "Connector timeout",
      },
      {
        serviceId: "drive",
        serviceName: "Drive",
        effectiveRole: "none",
        source: "none",
        realizationStatus: "not_assigned",
      },
    ],
  },
  "u-1003": {
    userId: "u-1003",
    displayName: "Sam Patel",
    email: "sam.patel@example.com",
    platformRole: "user",
    bundleAssignments: [],
    serviceAccess: [
      {
        serviceId: "mail",
        serviceName: "Mail",
        effectiveRole: "none",
        source: "none",
        realizationStatus: "manual_action",
        activeJobId: "job-manual-1",
        lastJobSummary: "Policy requires human confirmation before revoke propagates.",
      },
      {
        serviceId: "calendar",
        serviceName: "Calendar",
        effectiveRole: "none",
        source: "none",
        realizationStatus: "suspended",
        lastJobSummary: "Workspace suspended — outbound sync paused.",
      },
      {
        serviceId: "drive",
        serviceName: "Drive",
        effectiveRole: "none",
        source: "none",
        realizationStatus: "revoked",
        lastJobSummary: "Entitlement removed.",
      },
    ],
  },
};

const rawMatrix = {
  services: [
    { id: "mail", name: "Mail" },
    { id: "calendar", name: "Calendar" },
    { id: "drive", name: "Drive" },
    { id: "plane", name: "Plane (ApzProjects)" },
    { id: "zammad", name: "Zammad (ApzServices)" },
    { id: "kimai", name: "Kimai (ApzTime)" },
    { id: "kiwi", name: "Kiwi TCMS (ApzTesting)" },
    { id: "paperless", name: "Paperless-ngx (ApzDoc)" },
    { id: "n8n", name: "n8n (ApzWorkflows)" },
    { id: "reminders", name: "Reminders" },
    { id: "chat", name: "Chat" },
  ],
  cells: [
    // Mock mapping: bundle_plus_override = policy mix; direct = org default / not bundle-attributed
    {
      userId: "u-1001",
      serviceId: "mail",
      effectiveRole: "editor",
      sourceVisibility: "bundle",
      realizationStatus: "provisioned",
      activeJobId: "job-mail-1",
    },
    {
      userId: "u-1001",
      serviceId: "calendar",
      effectiveRole: "editor",
      sourceVisibility: "bundle_plus_override",
      realizationStatus: "pending",
      activeJobId: "job-cal-2",
    },
    {
      userId: "u-1001",
      serviceId: "drive",
      effectiveRole: "viewer",
      sourceVisibility: "direct",
      realizationStatus: "provisioned",
    },
    {
      userId: "u-1001",
      serviceId: "plane",
      effectiveRole: "editor",
      sourceVisibility: "direct",
      realizationStatus: "provisioned",
    },
    {
      userId: "u-1001",
      serviceId: "zammad",
      effectiveRole: "editor",
      sourceVisibility: "direct",
      realizationStatus: "provisioned",
    },
    {
      userId: "u-1001",
      serviceId: "kimai",
      effectiveRole: "editor",
      sourceVisibility: "direct",
      realizationStatus: "provisioned",
    },
    {
      userId: "u-1001",
      serviceId: "kiwi",
      effectiveRole: "editor",
      sourceVisibility: "direct",
      realizationStatus: "provisioned",
    },
    {
      userId: "u-1001",
      serviceId: "paperless",
      effectiveRole: "editor",
      sourceVisibility: "direct",
      realizationStatus: "provisioned",
    },
    {
      userId: "u-1001",
      serviceId: "n8n",
      effectiveRole: "editor",
      sourceVisibility: "direct",
      realizationStatus: "provisioned",
    },
    {
      userId: "u-1001",
      serviceId: "reminders",
      effectiveRole: "editor",
      sourceVisibility: "bundle",
      realizationStatus: "provisioned",
    },
    {
      userId: "u-1001",
      serviceId: "chat",
      effectiveRole: "editor",
      sourceVisibility: "bundle",
      realizationStatus: "provisioned",
    },
    {
      userId: "u-1002",
      serviceId: "mail",
      effectiveRole: "viewer",
      sourceVisibility: "bundle",
      realizationStatus: "provisioned",
    },
    {
      userId: "u-1002",
      serviceId: "calendar",
      effectiveRole: "none",
      sourceVisibility: "none",
      realizationStatus: "failed",
      activeJobId: "job-cal-fail",
    },
    {
      userId: "u-1002",
      serviceId: "drive",
      effectiveRole: "none",
      sourceVisibility: "none",
      realizationStatus: "not_assigned",
    },
    {
      userId: "u-1002",
      serviceId: "plane",
      effectiveRole: "viewer",
      sourceVisibility: "bundle",
      realizationStatus: "provisioned",
    },
    {
      userId: "u-1002",
      serviceId: "paperless",
      effectiveRole: "viewer",
      sourceVisibility: "bundle",
      realizationStatus: "provisioned",
    },
    {
      userId: "u-1002",
      serviceId: "zammad",
      effectiveRole: "none",
      sourceVisibility: "none",
      realizationStatus: "not_assigned",
    },
    {
      userId: "u-1002",
      serviceId: "kimai",
      effectiveRole: "none",
      sourceVisibility: "none",
      realizationStatus: "not_assigned",
    },
    {
      userId: "u-1002",
      serviceId: "kiwi",
      effectiveRole: "none",
      sourceVisibility: "none",
      realizationStatus: "not_assigned",
    },
    {
      userId: "u-1002",
      serviceId: "n8n",
      effectiveRole: "none",
      sourceVisibility: "none",
      realizationStatus: "not_assigned",
    },
    {
      userId: "u-1002",
      serviceId: "reminders",
      effectiveRole: "viewer",
      sourceVisibility: "bundle",
      realizationStatus: "provisioned",
    },
    {
      userId: "u-1002",
      serviceId: "chat",
      effectiveRole: "viewer",
      sourceVisibility: "bundle",
      realizationStatus: "provisioned",
    },
    {
      userId: "u-1003",
      serviceId: "mail",
      effectiveRole: "none",
      sourceVisibility: "none",
      realizationStatus: "manual_action",
      activeJobId: "job-manual-1",
    },
    {
      userId: "u-1003",
      serviceId: "calendar",
      effectiveRole: "none",
      sourceVisibility: "none",
      realizationStatus: "suspended",
    },
    {
      userId: "u-1003",
      serviceId: "drive",
      effectiveRole: "none",
      sourceVisibility: "none",
      realizationStatus: "revoked",
    },
  ],
};

const rawBundles = {
  bundles: [
    { id: "b-admin", name: "Administrators", description: "Full administrative access patterns." },
    { id: "b-core", name: "Core collaboration", description: "Mail, calendar, chat defaults." },
    { id: "b-std", name: "Standard employee", description: "Baseline productivity bundle." },
  ],
};

const rawBundleDetails: Record<string, AdminBundleDetail> = {
  "b-admin": adminBundleDetailSchema.parse({
    id: "b-admin",
    name: "Administrators",
    description: "Full administrative access patterns.",
    metadata: { owner: "platform", tier: "internal" },
    serviceRoles: [
      { serviceId: "mail", roleId: "r-mail-admin", roleLabel: "Mail admin" },
      { serviceId: "calendar", roleId: "r-cal-admin", roleLabel: "Calendar admin" },
      { serviceId: "reminders", roleId: "r-reminders-user", roleLabel: "Reminders user" },
      { serviceId: "chat", roleId: "r-chat-user", roleLabel: "Chat user" },
    ],
    previewLines: ["Admins receive editor on mail and calendar by default."],
    affectedUserCount: 12,
    affectedUserSample: ["Alex Rivera", "Ops Bot"],
    impact: {
      servicesAffectedCount: 2,
      usersAffectedCount: 12,
      overridesPresentCount: 1,
      conflictsCount: 0,
    },
  }),
  "b-core": adminBundleDetailSchema.parse({
    id: "b-core",
    name: "Core collaboration",
    description: "Mail, calendar, chat defaults.",
    serviceRoles: [
      { serviceId: "mail", roleId: "r-mail-std", roleLabel: "Mail standard" },
      { serviceId: "drive", roleId: "r-drive-view", roleLabel: "Drive viewer" },
    ],
    previewLines: ["Editors on mail; viewer on drive unless overridden."],
    affectedUserCount: 420,
    affectedUserSample: ["Alex Rivera", "Jordan Lee"],
    impact: {
      servicesAffectedCount: 2,
      usersAffectedCount: 420,
      overridesPresentCount: 8,
      conflictsCount: 0,
    },
  }),
  "b-std": adminBundleDetailSchema.parse({
    id: "b-std",
    name: "Standard employee",
    description: "Baseline productivity bundle.",
    serviceRoles: [{ serviceId: "mail", roleId: "r-mail-view", roleLabel: "Mail viewer" }],
    previewLines: ["Read-only mail unless escalated."],
    affectedUserCount: 1800,
    affectedUserSample: ["Jordan Lee"],
    impact: {
      servicesAffectedCount: 1,
      usersAffectedCount: 1800,
      overridesPresentCount: 0,
      conflictsCount: 0,
    },
  }),
};

const rawServices = {
  services: [
    {
      id: "mail",
      name: "Google Mail",
      internalExternal: "external" as const,
      authType: "OAuth2",
      provisioningType: "Directory sync",
      healthStatus: "ok" as const,
      healthDetail: "Token refresh within SLO",
    },
    {
      id: "calendar",
      name: "Google Calendar",
      internalExternal: "external" as const,
      authType: "OAuth2",
      provisioningType: "Directory sync",
      healthStatus: "degraded" as const,
      healthDetail: "Elevated latency on free-busy",
    },
    {
      id: "drive",
      name: "Google Drive",
      internalExternal: "external" as const,
      authType: "OAuth2",
      provisioningType: "SCIM",
      healthStatus: "ok" as const,
      healthDetail: "Stable",
    },
    {
      id: "plane",
      name: "Plane (ApzProjects)",
      internalExternal: "internal" as const,
      authType: "OIDC",
      provisioningType: "Legacy import",
      healthStatus: "ok" as const,
      healthDetail: "Vendor stack",
    },
    {
      id: "zammad",
      name: "Zammad (ApzServices)",
      internalExternal: "internal" as const,
      authType: "Session",
      provisioningType: "Legacy import",
      healthStatus: "ok" as const,
      healthDetail: "Vendor stack",
    },
    {
      id: "kimai",
      name: "Kimai (ApzTime)",
      internalExternal: "internal" as const,
      authType: "Session",
      provisioningType: "Legacy import",
      healthStatus: "ok" as const,
      healthDetail: "Vendor stack",
    },
    {
      id: "kiwi",
      name: "Kiwi TCMS (ApzTesting)",
      internalExternal: "internal" as const,
      authType: "Session",
      provisioningType: "Legacy import",
      healthStatus: "ok" as const,
      healthDetail: "Vendor stack",
    },
    {
      id: "paperless",
      name: "Paperless-ngx (ApzDoc)",
      internalExternal: "internal" as const,
      authType: "Session",
      provisioningType: "Legacy import",
      healthStatus: "ok" as const,
      healthDetail: "Vendor stack",
    },
    {
      id: "n8n",
      name: "n8n (ApzWorkflows)",
      internalExternal: "internal" as const,
      authType: "Session",
      provisioningType: "Legacy import",
      healthStatus: "ok" as const,
      healthDetail: "Vendor stack",
    },
    {
      id: "reminders",
      name: "Reminders",
      internalExternal: "external" as const,
      authType: "OAuth2",
      provisioningType: "Directory sync",
      healthStatus: "ok" as const,
      healthDetail: "Tasks and notifications",
    },
    {
      id: "chat",
      name: "Chat",
      internalExternal: "external" as const,
      authType: "OAuth2",
      provisioningType: "Directory sync",
      healthStatus: "ok" as const,
      healthDetail: "Team messaging",
    },
  ],
};

const rawServiceDetails: Record<string, AdminServiceDetail> = {
  mail: adminServiceDetailSchema.parse({
    ...rawServices.services[0],
    roleMappings: [
      { roleId: "r-mail-admin", roleLabel: "Mail admin" },
      { roleId: "r-mail-std", roleLabel: "Mail standard" },
      { roleId: "r-mail-view", roleLabel: "Mail viewer" },
    ],
  }),
  calendar: adminServiceDetailSchema.parse({
    ...rawServices.services[1],
    roleMappings: [
      { roleId: "r-cal-admin", roleLabel: "Calendar admin" },
      { roleId: "r-cal-view", roleLabel: "Calendar viewer" },
    ],
  }),
  drive: adminServiceDetailSchema.parse({
    ...rawServices.services[2],
    roleMappings: [{ roleId: "r-drive-view", roleLabel: "Drive viewer" }],
  }),
  plane: adminServiceDetailSchema.parse({
    ...rawServices.services[3],
    roleMappings: [
      { roleId: "r-plane-admin", roleLabel: "Plane admin" },
      { roleId: "r-plane-member", roleLabel: "Plane member" },
    ],
  }),
  zammad: adminServiceDetailSchema.parse({
    ...rawServices.services[4],
    roleMappings: [
      { roleId: "r-zammad-admin", roleLabel: "Zammad admin" },
      { roleId: "r-zammad-agent", roleLabel: "Zammad agent" },
      { roleId: "r-zammad-customer", roleLabel: "Zammad customer" },
    ],
  }),
  kimai: adminServiceDetailSchema.parse({
    ...rawServices.services[5],
    roleMappings: [
      { roleId: "r-kimai-admin", roleLabel: "Kimai admin" },
      { roleId: "r-kimai-user", roleLabel: "Kimai user" },
    ],
  }),
  kiwi: adminServiceDetailSchema.parse({
    ...rawServices.services[6],
    roleMappings: [
      { roleId: "r-kiwi-admin", roleLabel: "Kiwi admin" },
      { roleId: "r-kiwi-user", roleLabel: "Kiwi user" },
    ],
  }),
  paperless: adminServiceDetailSchema.parse({
    ...rawServices.services[7],
    roleMappings: [
      { roleId: "r-paperless-admin", roleLabel: "Paperless admin" },
      { roleId: "r-paperless-user", roleLabel: "Paperless user" },
    ],
  }),
  n8n: adminServiceDetailSchema.parse({
    ...rawServices.services[8],
    roleMappings: [
      { roleId: "r-n8n-owner", roleLabel: "n8n owner / admin" },
      { roleId: "r-n8n-member", roleLabel: "n8n member" },
    ],
  }),
  reminders: adminServiceDetailSchema.parse({
    ...rawServices.services[9],
    roleMappings: [{ roleId: "r-reminders-user", roleLabel: "Reminders user" }],
  }),
  chat: adminServiceDetailSchema.parse({
    ...rawServices.services[10],
    roleMappings: [{ roleId: "r-chat-user", roleLabel: "Chat user" }],
  }),
};

export function getMockAccessData(): AdminAccessData {
  const directory = adminUserDirectorySchema.parse(rawDirectory);
  const userAccessByUserId: Record<string, AdminUserAccessDetail> = {};
  for (const [k, v] of Object.entries(rawUserAccess)) {
    userAccessByUserId[k] = adminUserAccessDetailSchema.parse(v);
  }
  return {
    directory,
    userAccessByUserId,
    matrix: adminMatrixModelSchema.parse(rawMatrix),
    bundles: adminBundleListSchema.parse(rawBundles),
    bundleDetailsById: rawBundleDetails,
    services: adminServiceListSchema.parse(rawServices),
    serviceDetailsById: rawServiceDetails,
  };
}
