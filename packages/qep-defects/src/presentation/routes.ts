export const QEP_DEFECTS_BASE_PATH = "/workspace/qep/defects" as const;

export const QEP_DEFECT_ROUTES = {
  home: QEP_DEFECTS_BASE_PATH,
  new: `${QEP_DEFECTS_BASE_PATH}/new`,
  detail: (defectId: string) => `${QEP_DEFECTS_BASE_PATH}/${defectId}`,
} as const;

export function isQepDefectsRoute(pathname: string): boolean {
  return (
    pathname === QEP_DEFECTS_BASE_PATH ||
    pathname.startsWith(`${QEP_DEFECTS_BASE_PATH}/`)
  );
}

export function isQepDefectsNewRoute(pathname: string): boolean {
  return pathname === QEP_DEFECT_ROUTES.new;
}

export function parseQepDefectRouteId(pathname: string): string | undefined {
  const prefix = `${QEP_DEFECTS_BASE_PATH}/`;
  if (!pathname.startsWith(prefix)) return undefined;
  const rest = pathname.slice(prefix.length);
  if (!rest || rest === "new") return undefined;
  const id = rest.split("/")[0];
  return id || undefined;
}
