/**
 * @apzhub/qep-evidence — Evidence Management
 * Domain: ENG-110B · Persistence abstractions: ENG-110C · Application: ENG-110D
 */
export const QEP_EVIDENCE_VERSION = "1.0.0-rc.2" as const;
export const QEP_EVIDENCE_PROGRAMME =
  "APZQEP-FREEZE-004 — POST-REM-002 PRODUCTION FREEZE CANDIDATE 1.0.0-rc.2" as const;

export { QEP_EVIDENCE_DOMAIN_STATUS } from "./domain/index";
export { QEP_EVIDENCE_APPLICATION_STATUS } from "./application/index";
export { QEP_EVIDENCE_INFRASTRUCTURE_STATUS } from "./infrastructure/index";
export { QEP_EVIDENCE_SHARED_STATUS } from "./shared/index";
export { QEP_EVIDENCE_API_STATUS, QEP_EVIDENCE_API_BASE_PATH } from "./api/index";
export {
  QEP_EVIDENCE_PRESENTATION_STATUS,
  QEP_EVIDENCE_MODULE_ID,
} from "./presentation/index";

export * from "./domain/index";
export * from "./application/index";
export * from "./infrastructure/index";
export * from "./shared/index";
export * from "./api/index";
export * from "./presentation/index";
