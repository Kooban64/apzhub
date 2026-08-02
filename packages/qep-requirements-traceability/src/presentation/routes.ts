export const QEP_ENTERPRISE_REQUIREMENTS_BASE_PATH =
  "/workspace/qep/enterprise-requirements" as const;

export const QEP_ENTERPRISE_REQUIREMENT_ROUTES = {
  home: QEP_ENTERPRISE_REQUIREMENTS_BASE_PATH,
  new: `${QEP_ENTERPRISE_REQUIREMENTS_BASE_PATH}/new`,
  matrix: `${QEP_ENTERPRISE_REQUIREMENTS_BASE_PATH}/matrix`,
  coverage: `${QEP_ENTERPRISE_REQUIREMENTS_BASE_PATH}/coverage`,
  detail: (requirementId: string) =>
    `${QEP_ENTERPRISE_REQUIREMENTS_BASE_PATH}/${requirementId}`,
} as const;

export function isQepEnterpriseRequirementsRoute(pathname: string): boolean {
  return (
    pathname === QEP_ENTERPRISE_REQUIREMENTS_BASE_PATH ||
    pathname.startsWith(`${QEP_ENTERPRISE_REQUIREMENTS_BASE_PATH}/`)
  );
}

export function isQepEnterpriseRequirementsNewRoute(pathname: string): boolean {
  return pathname === QEP_ENTERPRISE_REQUIREMENT_ROUTES.new;
}

export function isQepEnterpriseRequirementsMatrixRoute(pathname: string): boolean {
  return pathname === QEP_ENTERPRISE_REQUIREMENT_ROUTES.matrix;
}

export function isQepEnterpriseRequirementsCoverageRoute(pathname: string): boolean {
  return pathname === QEP_ENTERPRISE_REQUIREMENT_ROUTES.coverage;
}

export function parseQepEnterpriseRequirementRouteId(
  pathname: string,
): string | undefined {
  const prefix = `${QEP_ENTERPRISE_REQUIREMENTS_BASE_PATH}/`;
  if (!pathname.startsWith(prefix)) return undefined;
  const rest = pathname.slice(prefix.length);
  if (!rest || rest === "new" || rest === "matrix" || rest === "coverage") {
    return undefined;
  }
  const id = rest.split("/")[0];
  return id || undefined;
}
