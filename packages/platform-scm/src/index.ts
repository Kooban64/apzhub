export { PLATFORM_SCM_VERSION, PLATFORM_SCM_PROGRAMME } from "./version";
export * from "./contracts/index";
export { ScmProviderRegistry } from "./registry/provider-registry";
export {
  ScmEngine,
  type ScmChangeEventsPersistedHook,
  type ScmEngineOptions,
} from "./engine/scm-engine";
export {
  InMemoryRepositoryStore,
  type RepositoryStore,
} from "./engine/repository-store";
export { createGitHubProvider, GitHubScmProvider } from "./providers/github";
export { createGitLabProvider, GitLabScmProvider } from "./providers/gitlab";
export {
  createPlaceholderScmProviders,
  PLACEHOLDER_IDS,
} from "./providers/placeholders";
export {
  createPlatformScm,
  type CreatePlatformScmOptions,
  type PlatformScm,
} from "./sdk/create-scm";
export {
  inferPlatformRefsFromText,
  matchSuitesToChangedPaths,
  impactedPathRoots,
  type InferredPlatformRef,
  type SuitePathMatch,
  type SuitePathMatchInput,
} from "./impact/infer-edges";
