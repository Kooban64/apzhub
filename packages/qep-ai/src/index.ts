export * from "./domain/index";
export {
  createQepAiService,
  type QepAiService,
  type CreateProposalInput,
} from "./application/ai-service";
export type { AiProposalRepository } from "./application/repository";
export { createInMemoryAiProposalRepository } from "./application/in-memory-repository";
export { createQepAiRegistry, type QepAiRegistry } from "./compose";
export { createAiProposalPersistence } from "./infrastructure/persistence";
export {
  QEP_AI_ANALYSIS_BASE_PATH,
  QEP_AI_COMPANION_BASE_PATH,
  QEP_AI_GENERATE_BASE_PATH,
  QEP_AI_REVIEW_BASE_PATH,
  isQepAiAnalysisRoute,
  isQepAiCompanionRoute,
  isQepAiGenerateRoute,
  isQepAiPhase7Route,
  isQepAiReviewRoute,
  parseQepAiReviewRouteId,
} from "./presentation/index";
