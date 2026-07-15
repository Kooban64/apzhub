import type {
  FeatureFlagDefinition,
  FeatureFlagEvaluation,
  FeatureFlagEvaluationContext,
  FeatureFlagOverride,
  RegisterFeatureFlagInput,
  SetFeatureFlagOverrideInput,
} from "./governance-types";
import type { FeatureFlagRepository } from "./repositories/repository-interfaces";

const EVALUATION_ORDER = ["user", "module", "product", "tenant", "global"] as const;

export class FeatureFlagService {
  constructor(private readonly repository: FeatureFlagRepository) {}

  async listFlags(): Promise<readonly FeatureFlagDefinition[]> {
    return this.repository.listFlags();
  }

  async registerFlag(input: RegisterFeatureFlagInput): Promise<FeatureFlagDefinition> {
    return this.repository.registerFlag(input);
  }

  async listOverrides(flagKey?: string): Promise<readonly FeatureFlagOverride[]> {
    return this.repository.listOverrides(flagKey);
  }

  async setOverride(input: SetFeatureFlagOverrideInput): Promise<FeatureFlagOverride> {
    return this.repository.setOverride(input);
  }

  async removeOverride(overrideId: string): Promise<boolean> {
    return this.repository.removeOverride(overrideId);
  }

  async evaluateFlag(
    flagKey: string,
    context: FeatureFlagEvaluationContext = {},
  ): Promise<FeatureFlagEvaluation> {
    const flag = await this.repository.getFlag(flagKey);
    if (!flag) {
      return { flagKey, enabled: false, source: "default" };
    }

    const overrides = await this.repository.listOverrides(flagKey);
    for (const scopeType of EVALUATION_ORDER) {
      const scopeKey = resolveScopeKey(scopeType, context);
      const override = overrides.find(
        (item) => item.scopeType === scopeType && item.scopeKey === scopeKey,
      );
      if (override) {
        return { flagKey, enabled: override.enabled, source: scopeType };
      }
    }

    return { flagKey, enabled: flag.defaultEnabled, source: "default" };
  }

  async evaluateAll(
    context: FeatureFlagEvaluationContext = {},
  ): Promise<Readonly<Record<string, boolean>>> {
    const flags = await this.repository.listFlags();
    const entries = await Promise.all(
      flags.map(async (flag) => {
        const evaluation = await this.evaluateFlag(flag.flagKey, context);
        return [flag.flagKey, evaluation.enabled] as const;
      }),
    );
    return Object.fromEntries(entries);
  }
}

function resolveScopeKey(
  scopeType: (typeof EVALUATION_ORDER)[number],
  context: FeatureFlagEvaluationContext,
): string {
  switch (scopeType) {
    case "user":
      return context.userId ?? "";
    case "module":
      return context.moduleId ?? "";
    case "product":
      return context.productKey ?? "";
    case "tenant":
      return context.tenantId ?? "";
    case "global":
      return "";
    default:
      return "";
  }
}
