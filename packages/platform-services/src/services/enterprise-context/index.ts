export { composeEnterpriseContext } from "./compose-enterprise-context";
export {
  composeEnterpriseContextFromGateway,
  createEnterpriseContextCompositionService,
  type EnterpriseContextGatewaySlice,
} from "./create-enterprise-context-service";
export {
  collectWorkflowSlice,
  collectSupportSlice,
  collectDocumentsSlice,
  collectLawSlice,
  collectKnowledgeSlice,
  type EnterpriseContextProviderDeps,
} from "./providers";
export { matchesProjectFocus, projectTagCandidates } from "./relevance";
