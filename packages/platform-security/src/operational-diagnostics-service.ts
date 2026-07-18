import { EnvironmentValidationService } from "./environment-validation-service";
import { OperationalResilienceService } from "./operational-resilience-service";
import { RateLimitService } from "./rate-limit-service";
import { CspPolicyService } from "./csp-policy-service";
import {
  getSharedCspViolationService,
  type CspViolationService,
} from "./csp-violation-service";
import { getSharedTrafficGovernanceService } from "./traffic-governance/traffic-governance-service";
import { SecurityHeadersService } from "./security-headers-service";
import { getSessionSecurityPosture } from "./platform-api-guard";
import type {
  ConsolidatedOperationalDiagnostics,
  SecurityDiagnostics,
} from "./security-types";
import type { CspAppProfile } from "./csp-types";

export class SecurityDiagnosticsService {
  private readonly headers = new SecurityHeadersService();
  private readonly environment = new EnvironmentValidationService();
  private readonly rateLimit = new RateLimitService();
  private readonly trafficGovernance = getSharedTrafficGovernanceService();
  private readonly cspPolicy = new CspPolicyService();

  constructor(
    private readonly cspViolations: CspViolationService,
    private readonly cspApp: CspAppProfile = "web",
  ) {}

  getSecurityDiagnostics(): SecurityDiagnostics {
    const isProduction = process.env.NODE_ENV === "production";
    const reportUri = "/api/platform/v1/security/csp-report";
    const policy = this.cspPolicy.buildPolicy({
      app: this.cspApp,
      isProduction,
      reportUri,
    });
    const violationDiagnostics = this.cspViolations.getDiagnostics(
      reportUri,
      policy.mode,
    );

    return {
      ...this.headers.buildSecurityDiagnosticsPartial(this.cspApp),
      session: getSessionSecurityPosture(),
      environment: this.environment.validateEnvironment(),
      rateLimit: this.rateLimit.getStatus(),
      trafficGovernance: this.buildTrafficDiagnosticsSummary(),
      apiGuard: {
        sessionRequired: true,
        permissionEnforcement: true,
      },
      csp: {
        mode: policy.mode,
        reportUri,
        violationCount: violationDiagnostics.totalReports,
        violationsByDirective: violationDiagnostics.byDirective,
      },
    };
  }

  private buildTrafficDiagnosticsSummary() {
    const diagnostics = this.trafficGovernance.getDiagnostics();
    return {
      status: {
        enabled: diagnostics.status.enabled,
        backend: diagnostics.status.backend,
        environment: diagnostics.status.environment,
        profileMultiplier: diagnostics.status.profileMultiplier,
      },
      activePolicy: diagnostics.activePolicy
        ? {
            id: diagnostics.activePolicy.id,
            service: diagnostics.activePolicy.service,
            source: diagnostics.activePolicy.source,
          }
        : null,
      rateLimit: diagnostics.rateLimit,
      throttle: diagnostics.throttle,
      policySource: diagnostics.policySource,
      environment: diagnostics.environment,
      recommendations: diagnostics.recommendations,
    };
  }
}

export interface ConsolidatedDiagnosticsInput {
  readonly runtimeReady?: boolean;
  readonly runtimeDiagnostics?: Record<string, unknown>;
  readonly identityDiagnostics?: Record<string, unknown>;
  readonly authorizationDiagnostics?: Record<string, unknown>;
  readonly operationsDiagnostics?: Record<string, unknown>;
  readonly personalisationDiagnostics?: Record<string, unknown>;
  readonly governanceDiagnostics?: Record<string, unknown>;
  readonly apiDiagnostics?: Record<string, unknown>;
  readonly workbenchDiagnostics?: Record<string, unknown>;
  readonly lawPlatformDiagnostics?: Record<string, unknown>;
  readonly trustAccountingDiagnostics?: Record<string, unknown>;
  readonly persistenceDiagnostics?: Record<string, unknown>;
}

export class OperationalDiagnosticsService {
  private readonly securityDiagnostics: SecurityDiagnosticsService;
  private readonly resilience = new OperationalResilienceService();

  constructor(cspApp: CspAppProfile = "web") {
    const violations = getSharedCspViolationService();
    this.securityDiagnostics = new SecurityDiagnosticsService(violations, cspApp);
  }

  async getConsolidatedDiagnostics(
    input: ConsolidatedDiagnosticsInput = {},
  ): Promise<ConsolidatedOperationalDiagnostics> {
    const security = this.securityDiagnostics.getSecurityDiagnostics();
    const resilience = await this.resilience.getResilienceSnapshot({
      runtimeReady: input.runtimeReady,
    });

    return {
      generatedAt: new Date().toISOString(),
      runtime: input.runtimeDiagnostics,
      identity: input.identityDiagnostics,
      authorization: input.authorizationDiagnostics,
      operations: input.operationsDiagnostics,
      personalisation: input.personalisationDiagnostics,
      governance: input.governanceDiagnostics,
      api: input.apiDiagnostics,
      workbench: input.workbenchDiagnostics,
      lawPlatform: input.lawPlatformDiagnostics,
      trustAccounting: input.trustAccountingDiagnostics,
      security,
      resilience,
      persistence: input.persistenceDiagnostics,
    };
  }
}
