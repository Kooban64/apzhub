export type {
  AuthCredentialReference,
  AuthenticateInput,
  AuthenticationProvider,
  AuthenticationResult,
  AuthenticationMode,
  CredentialSourceType,
  ResolvedCredential,
} from "./types";

export {
  AUTHENTICATION_MODES,
  IMPLEMENTED_AUTHENTICATION_MODES,
  PLACEHOLDER_AUTHENTICATION_MODES,
  isAuthenticationMode,
  isImplementedAuthenticationMode,
} from "./modes";

export {
  containsLikelySecret,
  maskCredentialRef,
  maskSecretValue,
  sanitizeDiagnosticRecord,
} from "./masking";

export type {
  InMemorySecretProviderOptions,
  SecretLookupInput,
  SecretMaterial,
  SecretProvider,
} from "./secret-provider";
export {
  InMemorySecretProvider,
  PlaceholderVaultSecretProvider,
} from "./secret-provider";

export type {
  CredentialResolveInput,
  CredentialResolver,
  DefaultCredentialResolverOptions,
} from "./credential-resolver";
export {
  DefaultCredentialResolver,
  createResolvedCredentialPreview,
} from "./credential-resolver";

export type {
  Clock,
  DefaultAuthenticationProviderOptions,
} from "./authentication-provider";
export { DefaultAuthenticationProvider, systemClock } from "./authentication-provider";

export type {
  AuthenticationDiagnostics,
  BuildAuthenticationDiagnosticsInput,
} from "./auth-diagnostics";
export { buildAuthenticationDiagnostics } from "./auth-diagnostics";
