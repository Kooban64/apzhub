/**
 * API contracts — APZQEP-ENG-110F.
 * Live Route Handlers live under apps/web/app/api/v1/qep/evidence/.
 */
export const QEP_EVIDENCE_API_STATUS = "implemented-eng-110f" as const;
export const QEP_EVIDENCE_API_BASE_PATH = "/api/v1/qep/evidence" as const;

export * from "./models/index";
