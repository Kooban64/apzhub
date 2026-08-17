/**
 * Organisation Admin surface permission intents.
 * Shell gate remains identity.manage; nav/API use more specific keys where catalogue allows.
 *
 * PERMISSION GAPS (recorded, not papered over):
 * - No distinct `provisioning.*` — Provisioning uses `admin.operate`.
 * - No distinct “product assignment write” for tenant admin — `entitlement.manage`
 *   exists in catalogue but is not on org-admin persona; reads use entitlement.read.
 * - Team write vs People write not independently expressible beyond `team.*` vs `identity.*`.
 */

export const ORG_ADMIN_SURFACE_PERMISSIONS = {
  people: ["identity.read", "identity.manage", "user.*"] as const,
  teams: ["team.*"] as const,
  rolesAccess: ["identity.read", "identity.manage"] as const,
  products: ["entitlement.read", "catalogue.read"] as const,
  provisioning: ["admin.operate"] as const,
  workspaceSettings: ["admin.operate", "identity.manage"] as const,
  integrations: ["admin.operate"] as const,
  security: ["identity.manage", "admin.read"] as const,
  audit: ["identity.read", "admin.read"] as const,
  settings: ["admin.operate", "identity.manage"] as const,
  help: [] as const,
} as const;

export const ORG_ADMIN_PERMISSION_GAPS = [
  "No provisioning.* permission — Provisioning gated on admin.operate only",
  "entitlement.manage exists in catalogue but org-admin persona lacks it; product assignment writes not independently authorised for tenant admin",
  "team.* is coarse — no team.create / team.member.manage / team.role.bind split in catalogue",
  "People administration and role assignment both hang on identity.read/manage",
] as const;
