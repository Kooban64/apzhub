export const QEP_QI_BASE_PATH = "/workspace/qep/quality-intelligence" as const;

export const QEP_QI_ROUTES = {
  home: QEP_QI_BASE_PATH,
  recommendations: `${QEP_QI_BASE_PATH}/recommendations`,
  recommendation: (id: string) => `${QEP_QI_BASE_PATH}/recommendations/${id}`,
  signals: `${QEP_QI_BASE_PATH}/signals`,
  observations: `${QEP_QI_BASE_PATH}/observations`,
  scores: `${QEP_QI_BASE_PATH}/scores`,
  providers: `${QEP_QI_BASE_PATH}/providers`,
  history: `${QEP_QI_BASE_PATH}/history`,
  confidence: `${QEP_QI_BASE_PATH}/confidence`,
  explainability: (explanationId: string) =>
    `${QEP_QI_BASE_PATH}/explanations/${explanationId}`,
} as const;

export function isQepQiRoute(pathname: string): boolean {
  return pathname === QEP_QI_BASE_PATH || pathname.startsWith(`${QEP_QI_BASE_PATH}/`);
}

export function parseQepQiRecommendationId(pathname: string): string | undefined {
  const match = pathname.match(
    /\/workspace\/qep\/quality-intelligence\/recommendations\/([^/]+)/,
  );
  return match?.[1];
}
