import { PlatformSecurityService } from "./platform-security-service";
import { resetSharedCspViolationService } from "./csp-violation-service";

let sharedPlatformSecurityService: PlatformSecurityService | undefined;

export function getSharedPlatformSecurityService(): PlatformSecurityService {
  if (!sharedPlatformSecurityService) {
    sharedPlatformSecurityService = new PlatformSecurityService();
  }
  return sharedPlatformSecurityService;
}

export function resetSharedPlatformSecurityService(): void {
  sharedPlatformSecurityService = undefined;
  resetSharedCspViolationService();
}

export {
  PlatformSecurityService,
  SecurityService,
} from "./platform-security-service";

export { EnvironmentValidationService } from "./environment-validation-service";
export { SecurityHeadersService } from "./security-headers-service";
export {
  HttpSecurityHeaderService,
  PLATFORM_HTTP_ENDPOINT_SAMPLES,
  withPlatformSecurityHeaders,
} from "./http-security-header-service";
export { securePlatformResponse, jsonPlatformResponse } from "./http-security-response";
export { RateLimitService } from "./rate-limit-service";
export {
  TrafficGovernanceService,
  getSharedTrafficGovernanceService,
  resetSharedTrafficGovernanceService,
  CANONICAL_TRAFFIC_POLICIES,
  PLATFORM_API_ENDPOINT_SAMPLES,
  LAW_API_ENDPOINT_SAMPLES,
  enforceTrafficGovernanceForHandler,
  shouldApplyTrafficGovernance,
  shouldApplyLawTrafficGovernance,
} from "./traffic-governance";
export type {
  TrafficGovernanceDecision,
  TrafficGovernanceDiagnostics,
  TrafficRequestContext,
} from "./traffic-governance";
export { OperationalResilienceService } from "./operational-resilience-service";
export { buildRecoveryGuidance } from "./recovery-guidance";
export {
  OperationalDiagnosticsService,
  SecurityDiagnosticsService,
} from "./operational-diagnostics-service";

export {
  requirePlatformSession,
  requirePlatformSessionWithTenant,
  requirePlatformPermission,
  guardFailureResponse,
  getSessionSecurityPosture,
} from "./platform-api-guard";

export type {
  PlatformApiGuardSession,
  PlatformApiGuardFailure,
  PlatformApiGuardOutcome,
} from "./platform-api-guard";

export { CspPolicyService, STABLE_ENFORCED_DIRECTIVES } from "./csp-policy-service";
export { CspViolationService, getSharedCspViolationService, resetSharedCspViolationService } from "./csp-violation-service";

export {
  DEFAULT_RATE_LIMIT_PER_MINUTE,
  PLATFORM_SECURITY_HEADERS,
} from "./security-types";

export type {
  ConsolidatedOperationalDiagnostics,
  DependencyHealthSignal,
  EnvironmentValidationSummary,
  ConfigurationDiagnosticsSummary,
  HealthSignalStatus,
  OperationalResilienceSnapshot,
  PlatformSecuritySummary,
  RecoveryGuidanceItem,
  SecurityDiagnostics,
  SecurityHeaderPosture,
  HttpHeaderComplianceSummary,
  TrafficGovernanceDiagnosticsSummary,
  SessionSecurityPosture,
  SessionDiagnosticsSummary,
  SystemProbeResult,
} from "./security-types";
