export const QEP_AI_COMPANION_BASE_PATH = "/workspace/qep/ai-companion" as const;
export const QEP_AI_GENERATE_BASE_PATH = "/workspace/qep/ai-generate" as const;
export const QEP_AI_REVIEW_BASE_PATH = "/workspace/qep/ai-review" as const;
export const QEP_AI_ANALYSIS_BASE_PATH = "/workspace/qep/ai-analysis" as const;

function isBase(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function isQepAiCompanionRoute(pathname: string): boolean {
  return (
    isBase(pathname, QEP_AI_COMPANION_BASE_PATH) ||
    isBase(pathname, "/workspace/qep/ai-workspace")
  );
}

export function isQepAiGenerateRoute(pathname: string): boolean {
  return isBase(pathname, QEP_AI_GENERATE_BASE_PATH);
}

export function isQepAiReviewRoute(pathname: string): boolean {
  return isBase(pathname, QEP_AI_REVIEW_BASE_PATH);
}

export function isQepAiAnalysisRoute(pathname: string): boolean {
  return isBase(pathname, QEP_AI_ANALYSIS_BASE_PATH);
}

export function isQepAiPhase7Route(pathname: string): boolean {
  return (
    isQepAiCompanionRoute(pathname) ||
    isQepAiGenerateRoute(pathname) ||
    isQepAiReviewRoute(pathname) ||
    isQepAiAnalysisRoute(pathname)
  );
}

export function parseQepAiReviewRouteId(pathname: string): string | undefined {
  if (!pathname.startsWith(`${QEP_AI_REVIEW_BASE_PATH}/`)) return undefined;
  const id = pathname.slice(`${QEP_AI_REVIEW_BASE_PATH}/`.length).split("/")[0]?.trim();
  return id || undefined;
}
