export const QEP_REQUIREMENTS_BASE_PATH = "/workspace/qep/requirements";
export const QEP_WORKSPACE_BASE_PATH = "/workspace/qep";
export const QEP_BASELINES_BASE_PATH = `${QEP_REQUIREMENTS_BASE_PATH}/baselines`;
export const QEP_RELATIONSHIPS_BASE_PATH = `${QEP_REQUIREMENTS_BASE_PATH}/relationships`;

export const QEP_REQUIREMENTS_ROUTES = {
  list: QEP_REQUIREMENTS_BASE_PATH,
  new: `${QEP_REQUIREMENTS_BASE_PATH}/new`,
  detail: (id: string) => `${QEP_REQUIREMENTS_BASE_PATH}/${encodeURIComponent(id)}`,
  edit: (id: string) =>
    `${QEP_REQUIREMENTS_BASE_PATH}/${encodeURIComponent(id)}/edit`,
  baselines: {
    list: QEP_BASELINES_BASE_PATH,
    new: `${QEP_BASELINES_BASE_PATH}/new`,
    compare: `${QEP_BASELINES_BASE_PATH}/compare`,
    detail: (id: string) => `${QEP_BASELINES_BASE_PATH}/${encodeURIComponent(id)}`,
  },
  relationships: {
    list: QEP_RELATIONSHIPS_BASE_PATH,
    new: `${QEP_RELATIONSHIPS_BASE_PATH}/new`,
    supersede: `${QEP_RELATIONSHIPS_BASE_PATH}/supersede`,
    detail: (id: string) => `${QEP_RELATIONSHIPS_BASE_PATH}/${encodeURIComponent(id)}`,
    forRequirement: (requirementId: string) =>
      `${QEP_REQUIREMENTS_BASE_PATH}/${encodeURIComponent(requirementId)}/relationships`,
  },
} as const;

export function isQepRequirementsRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === QEP_REQUIREMENTS_BASE_PATH ||
    normalized.startsWith(`${QEP_REQUIREMENTS_BASE_PATH}/`)
  );
}

export function isQepRequirementsNewRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_REQUIREMENTS_ROUTES.new;
}

export function isQepRequirementsEditRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return /\/edit$/.test(normalized) && isQepRequirementsRoute(normalized);
}

/**
 * Requirement Baselines (APZQEP-ENG-020E) live under the requirements base
 * path but are a distinct configuration-management resource — `baselines`
 * must never be parsed as a requirement id.
 */
export function isQepBaselinesRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === QEP_BASELINES_BASE_PATH ||
    normalized.startsWith(`${QEP_BASELINES_BASE_PATH}/`)
  );
}

/**
 * Requirements Relationships (APZQEP-ENG-020F) live under the requirements base
 * path but are a distinct governed resource — `relationships` must never be
 * parsed as a requirement id.
 */
export function isQepRelationshipsRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === QEP_RELATIONSHIPS_BASE_PATH ||
    normalized.startsWith(`${QEP_RELATIONSHIPS_BASE_PATH}/`)
  );
}

export function isQepBaselinesNewRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_REQUIREMENTS_ROUTES.baselines.new;
}

export function isQepBaselinesCompareRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_REQUIREMENTS_ROUTES.baselines.compare;
}

export function isQepRelationshipsNewRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_REQUIREMENTS_ROUTES.relationships.new;
}

export function isQepRelationshipsSupersedeRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return normalized === QEP_REQUIREMENTS_ROUTES.relationships.supersede;
}

export function parseQepRelationshipRouteId(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (
    !isQepRelationshipsRoute(normalized) ||
    normalized === QEP_RELATIONSHIPS_BASE_PATH
  ) {
    return null;
  }
  if (isQepRelationshipsNewRoute(normalized) || isQepRelationshipsSupersedeRoute(normalized)) {
    return null;
  }
  const prefix = `${QEP_RELATIONSHIPS_BASE_PATH}/`;
  const remainder = normalized.slice(prefix.length);
  if (!remainder || remainder === "new" || remainder === "supersede") {
    return null;
  }
  const segments = remainder.split("/");
  const id = decodeURIComponent(segments[0] ?? "");
  return id || null;
}

export function parseQepBaselineRouteId(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (!isQepBaselinesRoute(normalized) || normalized === QEP_BASELINES_BASE_PATH) {
    return null;
  }
  if (isQepBaselinesNewRoute(normalized) || isQepBaselinesCompareRoute(normalized)) {
    return null;
  }
  const prefix = `${QEP_BASELINES_BASE_PATH}/`;
  const remainder = normalized.slice(prefix.length);
  if (!remainder || remainder === "new" || remainder === "compare") {
    return null;
  }
  const segments = remainder.split("/");
  const id = decodeURIComponent(segments[0] ?? "");
  return id || null;
}

export function parseQepRequirementRouteId(pathname: string): string | null {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  if (isQepBaselinesRoute(normalized) || isQepRelationshipsRoute(normalized)) {
    return null;
  }
  if (!isQepRequirementsRoute(normalized) || normalized === QEP_REQUIREMENTS_BASE_PATH) {
    return null;
  }
  if (isQepRequirementsNewRoute(normalized)) {
    return null;
  }
  const prefix = `${QEP_REQUIREMENTS_BASE_PATH}/`;
  const remainder = normalized.slice(prefix.length);
  if (!remainder || remainder === "new") {
    return null;
  }
  const segments = remainder.split("/");
  const id = decodeURIComponent(segments[0] ?? "");
  return id || null;
}

export function isQepWorkspaceRoute(pathname: string): boolean {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  return (
    normalized === QEP_WORKSPACE_BASE_PATH ||
    normalized.startsWith(`${QEP_WORKSPACE_BASE_PATH}/`)
  );
}
