/**
 * Application layer — ENG-110D orchestration + ENG-110E security enforcement.
 * Business rules remain in Domain. Transport remains absent.
 * APZQEP-120-S10 — Business Processor Integration.
 */
export const QEP_EVIDENCE_APPLICATION_STATUS = "business-processors-s10" as const;

export * from "./ports/index";
export * from "./context";
export * from "./commands/index";
export * from "./queries/index";
export * from "./dto/evidence-dto";
export * from "./dto/mapper";
export * from "./available-actions";
export * from "./orchestration";
export * from "./services/index";
export * from "./testing/in-memory-ports";
export * from "./security/index";
export * from "./policy/index";
export * from "./query/index";
export * from "./integrity/index";
export * from "./catalogue/index";
export * from "./lifecycle/index";
export * from "./events/index";
export * from "./processors/index";
