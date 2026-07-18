import {
  OperationalDiagnosticsService,
  SecurityDiagnosticsService,
} from "./operational-diagnostics-service";
import { OperationalResilienceService } from "./operational-resilience-service";
import { RateLimitService } from "./rate-limit-service";
import {
  getSharedTrafficGovernanceService,
  TrafficGovernanceService,
} from "./traffic-governance/traffic-governance-service";
import { CspPolicyService } from "./csp-policy-service";
import { getSharedCspViolationService } from "./csp-violation-service";

export class PlatformSecurityService {
  readonly securityDiagnostics: SecurityDiagnosticsService;
  readonly operationalDiagnostics: OperationalDiagnosticsService;
  readonly resilience: OperationalResilienceService;
  readonly rateLimit: RateLimitService;
  readonly trafficGovernance: TrafficGovernanceService;
  readonly cspPolicy: CspPolicyService;
  readonly cspViolations = getSharedCspViolationService();

  constructor(cspApp: "web" | "law-platform" = "web") {
    this.cspPolicy = new CspPolicyService();
    this.securityDiagnostics = new SecurityDiagnosticsService(
      this.cspViolations,
      cspApp,
    );
    this.operationalDiagnostics = new OperationalDiagnosticsService(cspApp);
    this.resilience = new OperationalResilienceService();
    this.rateLimit = new RateLimitService();
    this.trafficGovernance = getSharedTrafficGovernanceService();
  }

  async getPlatformSummary(input: {
    readonly runtimeReady?: boolean;
    readonly consolidatedInput?: Parameters<
      OperationalDiagnosticsService["getConsolidatedDiagnostics"]
    >[0];
  }) {
    const security = this.securityDiagnostics.getSecurityDiagnostics();
    const resilience = await this.resilience.getResilienceSnapshot({
      runtimeReady: input.runtimeReady,
    });

    return {
      status: resilience.health.status,
      security,
      resilience,
      consolidated: await this.operationalDiagnostics.getConsolidatedDiagnostics({
        ...input.consolidatedInput,
        runtimeReady: input.runtimeReady,
      }),
    };
  }
}

/** Alias for spec naming. */
export const SecurityService = PlatformSecurityService;
