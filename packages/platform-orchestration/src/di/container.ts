import { OrchestrationError } from "../contracts/errors";

/**
 * Minimal dependency injection container for kernel wiring.
 * Not a general IoC framework — slice-local resolution only.
 */
export class OrchestrationContainer {
  private readonly services = new Map<string, unknown>();

  register<T>(token: string, value: T): void {
    const key = token.trim();
    if (!key) {
      throw new OrchestrationError(
        "validation",
        "INVALID_DI_TOKEN",
        "DI token is required",
      );
    }
    if (this.services.has(key)) {
      throw new OrchestrationError(
        "validation",
        "DI_TOKEN_EXISTS",
        `DI token already registered: ${key}`,
        { token: key },
      );
    }
    this.services.set(key, value);
  }

  resolve<T>(token: string): T {
    if (!this.services.has(token)) {
      throw new OrchestrationError(
        "validation",
        "DI_TOKEN_MISSING",
        `DI token not registered: ${token}`,
        { token },
      );
    }
    return this.services.get(token) as T;
  }

  has(token: string): boolean {
    return this.services.has(token);
  }

  listTokens(): readonly string[] {
    return [...this.services.keys()];
  }
}

export const ORCHESTRATION_DI_TOKENS = {
  kernel: "orchestration.kernel",
  capabilityRegistry: "orchestration.registry.capability",
  contractRegistry: "orchestration.registry.contract",
  lifecycleRegistry: "orchestration.registry.lifecycle",
  triggerEngine: "orchestration.trigger.engine",
  triggerBindings: "orchestration.trigger.bindings",
  qualityFlowEngine: "orchestration.quality_flow.engine",
  qualityFlowDefinitions: "orchestration.quality_flow.definitions",
  impactCorrelation: "orchestration.impact_correlation.engine",
  impactKnowledge: "orchestration.impact_correlation.knowledge",
  policySelection: "orchestration.policy_selection.engine",
  governance: "orchestration.governance.engine",
  approval: "orchestration.approval.engine",
  decision: "orchestration.decision.engine",
  eventBackbone: "orchestration.event.backbone",
  automationCoordination: "orchestration.automation.coordination",
  sourceChange: "orchestration.source.change",
  enrichment: "orchestration.enrichment.engine",
  evidenceIntegration: "orchestration.evidence_integration.engine",
  logger: "orchestration.logger",
  config: "orchestration.config",
} as const;
