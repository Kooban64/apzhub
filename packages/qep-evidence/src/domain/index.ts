/**
 * Domain layer — APZQEP-ENG-110B Core Domain + ENG-110C repository ports.
 */
export const QEP_EVIDENCE_DOMAIN_STATUS = "implemented-eng-110b" as const;

export * from "./evidence";
export * from "./ports/index";

/** Scaffold identity catalogues retained for discoverability (ENG-110A). */
export {
  EVIDENCE_REPOSITORY_IDS,
  type EvidenceRepositoryId,
  type EvidenceRepositoryScaffold,
} from "./repositories/index";
export {
  EVIDENCE_SPECIFICATION_IDS,
  type EvidenceSpecificationId,
  type EvidenceSpecificationScaffold,
} from "./specifications/index";
export {
  EVIDENCE_FACTORY_IDS,
  type EvidenceFactoryId,
  type EvidenceFactoryScaffold,
} from "./factories/index";
