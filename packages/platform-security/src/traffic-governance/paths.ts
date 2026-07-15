export function shouldApplyTrafficGovernance(pathname: string): boolean {
  return (
    pathname.startsWith("/api/platform/") ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/v1/") ||
    pathname === "/api/health"
  );
}

export function shouldApplyLawTrafficGovernance(pathname: string): boolean {
  return pathname.startsWith("/api/law/");
}
