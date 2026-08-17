/**
 * Stream 6 — formal resource-scope catalogue.
 * Scopes are stored as permission keys (`prefix:resourceId`) on AuthZ grants.
 * Organisational staff functions do NOT grant scopes.
 */

export type ResourceScopeKind =
  | "projects.project"
  | "projects.portfolio"
  | "support.queue"
  | "support.team"
  | "time.team"
  | "time.approval"
  | "workflow.workflow"
  | "workflow.approval"
  | "analytics.dashboard"
  | "analytics.domain"
  | "knowledge.space"
  | "knowledge.collection"
  | "documents.collection"
  | "documents.classification"
  | "qep.application"
  | "qep.project"
  | "qep.repository"
  | "pen.application"
  | "pen.engagement"
  | "pen.repository"
  | "source.repo";

export type ResourceScopeDefinition = {
  readonly kind: ResourceScopeKind;
  readonly prefix: string;
  readonly productKey: string;
  readonly label: string;
};

export const RESOURCE_SCOPE_CATALOGUE: readonly ResourceScopeDefinition[] = [
  {
    kind: "projects.project",
    prefix: "projects.project:",
    productKey: "projects",
    label: "Project",
  },
  {
    kind: "projects.portfolio",
    prefix: "projects.portfolio:",
    productKey: "projects",
    label: "Portfolio",
  },
  {
    kind: "support.queue",
    prefix: "support.queue:",
    productKey: "support",
    label: "Support queue",
  },
  {
    kind: "support.team",
    prefix: "support.team:",
    productKey: "support",
    label: "Support team",
  },
  {
    kind: "time.team",
    prefix: "time.team:",
    productKey: "time",
    label: "Time team",
  },
  {
    kind: "time.approval",
    prefix: "time.approval:",
    productKey: "time",
    label: "Time approval scope",
  },
  {
    kind: "workflow.workflow",
    prefix: "workflow.workflow:",
    productKey: "workflow",
    label: "Workflow",
  },
  {
    kind: "workflow.approval",
    prefix: "workflow.approval:",
    productKey: "workflow",
    label: "Workflow approval",
  },
  {
    kind: "analytics.dashboard",
    prefix: "analytics.dashboard:",
    productKey: "analytics",
    label: "Analytics dashboard",
  },
  {
    kind: "analytics.domain",
    prefix: "analytics.domain:",
    productKey: "analytics",
    label: "Analytics data domain",
  },
  {
    kind: "knowledge.space",
    prefix: "knowledge.space:",
    productKey: "knowledge",
    label: "Knowledge space",
  },
  {
    kind: "knowledge.collection",
    prefix: "knowledge.collection:",
    productKey: "knowledge",
    label: "Knowledge collection",
  },
  {
    kind: "documents.collection",
    prefix: "documents.collection:",
    productKey: "documents",
    label: "Documents collection",
  },
  {
    kind: "documents.classification",
    prefix: "documents.classification:",
    productKey: "documents",
    label: "Documents classification",
  },
  {
    kind: "qep.application",
    prefix: "qep.application:",
    productKey: "qep",
    label: "QEP application",
  },
  {
    kind: "qep.project",
    prefix: "qep.project:",
    productKey: "qep",
    label: "QEP project",
  },
  {
    kind: "qep.repository",
    prefix: "qep.repository:",
    productKey: "qep",
    label: "QEP repository",
  },
  {
    kind: "pen.application",
    prefix: "pen.application:",
    productKey: "pentest",
    label: "PEN application",
  },
  {
    kind: "pen.engagement",
    prefix: "pen.engagement:",
    productKey: "pentest",
    label: "PEN engagement",
  },
  {
    kind: "pen.repository",
    prefix: "pen.repository:",
    productKey: "pentest",
    label: "PEN repository",
  },
  {
    kind: "source.repo",
    prefix: "source.repo:",
    productKey: "source",
    label: "Source repository",
  },
] as const;

export type ParsedResourceScope = {
  readonly kind: ResourceScopeKind;
  readonly prefix: string;
  readonly resourceId: string;
  readonly productKey: string;
  readonly label: string;
  readonly grantKey: string;
};

export function parseResourceScopeGrant(
  permissionKey: string,
): ParsedResourceScope | null {
  for (const def of RESOURCE_SCOPE_CATALOGUE) {
    if (permissionKey.startsWith(def.prefix)) {
      const resourceId = permissionKey.slice(def.prefix.length);
      if (!resourceId) return null;
      return {
        kind: def.kind,
        prefix: def.prefix,
        resourceId,
        productKey: def.productKey,
        label: def.label,
        grantKey: permissionKey,
      };
    }
  }
  return null;
}

export function parseResourceScopesFromPermissions(
  permissions: readonly string[],
): readonly ParsedResourceScope[] {
  const out: ParsedResourceScope[] = [];
  for (const key of permissions) {
    const parsed = parseResourceScopeGrant(key);
    if (parsed) out.push(parsed);
  }
  return out;
}

/** Allowed prefixes for provision overlays (extends Phase K set). */
export const ALLOWED_SCOPE_PREFIXES: readonly string[] = RESOURCE_SCOPE_CATALOGUE.map(
  (d) => d.prefix,
);
