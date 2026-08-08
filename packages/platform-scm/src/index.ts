export { PLATFORM_SCM_VERSION, PLATFORM_SCM_PROGRAMME } from "./version";
export * from "./contracts/index";
export { ScmProviderRegistry } from "./registry/provider-registry";
export { ScmEngine } from "./engine/scm-engine";
export {
  InMemoryRepositoryStore,
  type RepositoryStore,
} from "./engine/repository-store";
export {
  createPlaceholderScmProviders,
  PLACEHOLDER_IDS,
} from "./providers/placeholders";
export { createGitHubProvider, GitHubScmProvider } from "./providers/github";
export {
  createPlatformScm,
  type CreatePlatformScmOptions,
  type PlatformScm,
} from "./sdk/create-scm";
