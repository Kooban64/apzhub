import type {
  CapabilityDiagnostics,
  GovernanceEnablement,
  SessionGovernanceSnapshot,
  UpsertEnablementInput,
} from "./governance-types";
import type { GovernanceRepository } from "./repositories/repository-interfaces";

export class GovernancePolicyService {
  constructor(private readonly repository: GovernanceRepository) {}

  async listEnablements(filter?: {
    scopeType?: string;
    scopeKey?: string;
    targetType?: string;
  }): Promise<readonly GovernanceEnablement[]> {
    return this.repository.listEnablements(filter);
  }

  async setEnablement(input: UpsertEnablementInput): Promise<GovernanceEnablement> {
    return this.repository.upsertEnablement(input);
  }

  async isTargetEnabled(input: {
    readonly scopeType: UpsertEnablementInput["scopeType"];
    readonly scopeKey?: string;
    readonly targetType: UpsertEnablementInput["targetType"];
    readonly targetKey: string;
    readonly fallback?: boolean;
  }): Promise<boolean> {
    const records = await this.repository.listEnablements({
      scopeType: input.scopeType,
      scopeKey: input.scopeKey ?? "",
      targetType: input.targetType,
    });
    const match = records.find((record) => record.targetKey === input.targetKey);
    if (match) {
      return match.enabled;
    }
    return input.fallback ?? true;
  }

  async resolveSessionSnapshot(input: {
    readonly tenantId?: string;
    readonly productKey?: string;
    readonly userId?: string;
  }): Promise<SessionGovernanceSnapshot> {
    const enablements = await this.repository.listEnablements();
    const isEnabled = (targetType: string, targetKey: string): boolean => {
      const candidates = enablements.filter(
        (item) => item.targetType === targetType && item.targetKey === targetKey,
      );
      const scoped = [
        input.userId
          ? candidates.find(
              (item) => item.scopeType === "user" && item.scopeKey === input.userId,
            )
          : undefined,
        input.productKey
          ? candidates.find(
              (item) =>
                item.scopeType === "product" && item.scopeKey === input.productKey,
            )
          : undefined,
        input.tenantId
          ? candidates.find(
              (item) => item.scopeType === "tenant" && item.scopeKey === input.tenantId,
            )
          : undefined,
        candidates.find(
          (item) => item.scopeType === "platform" && item.scopeKey === "",
        ),
      ].find(Boolean);
      return scoped?.enabled ?? true;
    };

    const products = [
      ...new Set(
        enablements.filter((e) => e.targetType === "product").map((e) => e.targetKey),
      ),
    ].filter((key) => isEnabled("product", key));
    const modules = [
      ...new Set(
        enablements.filter((e) => e.targetType === "module").map((e) => e.targetKey),
      ),
    ].filter((key) => isEnabled("module", key));
    const capabilities = [
      ...new Set(
        enablements
          .filter((e) => e.targetType === "capability")
          .map((e) => e.targetKey),
      ),
    ].filter((key) => isEnabled("capability", key));

    return {
      enabledProducts: products,
      enabledModules: modules,
      enabledCapabilities: capabilities,
      featureFlags: {},
    };
  }
}

export class GovernanceEnablementService {
  private readonly policy: GovernancePolicyService;

  constructor(repository: GovernanceRepository) {
    this.policy = new GovernancePolicyService(repository);
  }

  listEnablements(filter?: {
    scopeType?: string;
    scopeKey?: string;
    targetType?: string;
  }) {
    return this.policy.listEnablements(filter);
  }

  setEnablement(input: UpsertEnablementInput) {
    return this.policy.setEnablement(input);
  }

  isTargetEnabled(input: {
    readonly scopeType: UpsertEnablementInput["scopeType"];
    readonly scopeKey?: string;
    readonly targetType: UpsertEnablementInput["targetType"];
    readonly targetKey: string;
    readonly fallback?: boolean;
  }) {
    return this.policy.isTargetEnabled(input);
  }

  resolveSessionSnapshot(input: {
    readonly tenantId?: string;
    readonly productKey?: string;
    readonly userId?: string;
  }) {
    return this.policy.resolveSessionSnapshot(input);
  }

  async getCapabilityDiagnostics(
    repository: GovernanceRepository,
  ): Promise<CapabilityDiagnostics> {
    const capabilities = await repository.listCapabilities();
    const dependencies = (
      await Promise.all(
        capabilities.map((cap) => repository.listDependencies(cap.capabilityId)),
      )
    ).flat();
    const enablements = await repository.listEnablements();

    return {
      capabilities,
      dependencies,
      enablements,
      consumedCapabilities: capabilities.map((cap) => cap.capabilityKey),
    };
  }
}
