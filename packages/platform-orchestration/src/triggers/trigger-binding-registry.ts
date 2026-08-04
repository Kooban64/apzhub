import type { TriggerBinding, TriggerSourceClass } from "../contracts/trigger";
import { OrchestrationError } from "../contracts/errors";

/**
 * Registry of trigger-type → Quality Flow bindings.
 * Catalogue/routing configuration only — no provider knowledge.
 */
export class TriggerBindingRegistry {
  private readonly bindings = new Map<string, TriggerBinding>();

  register(binding: TriggerBinding): void {
    const id = binding.bindingId.trim();
    if (!id) {
      throw new OrchestrationError(
        "registry",
        "INVALID_BINDING_ID",
        "bindingId is required",
      );
    }
    if (!binding.triggerType.trim()) {
      throw new OrchestrationError(
        "validation",
        "MISSING_TRIGGER_TYPE",
        "triggerType is required",
        { bindingId: id },
      );
    }
    if (!binding.qualityFlowId.trim()) {
      throw new OrchestrationError(
        "validation",
        "MISSING_QUALITY_FLOW_ID",
        "qualityFlowId is required",
        { bindingId: id },
      );
    }
    if (this.bindings.has(id)) {
      throw new OrchestrationError(
        "registry",
        "BINDING_ALREADY_REGISTERED",
        `Trigger binding already registered: ${id}`,
        { bindingId: id },
      );
    }
    this.bindings.set(id, {
      ...binding,
      bindingId: id,
      triggerType: binding.triggerType.trim(),
      qualityFlowId: binding.qualityFlowId.trim(),
    });
  }

  get(bindingId: string): TriggerBinding | undefined {
    return this.bindings.get(bindingId);
  }

  list(): readonly TriggerBinding[] {
    return [...this.bindings.values()];
  }

  listEnabled(): readonly TriggerBinding[] {
    return this.list().filter((b) => b.enabled);
  }

  /**
   * Resolve matching bindings for a normalized trigger.
   * Highest priority first (larger number wins).
   */
  match(input: {
    readonly triggerType: string;
    readonly triggerSource: TriggerSourceClass;
    readonly tenantId: string;
    readonly projectId?: string;
  }): readonly TriggerBinding[] {
    return this.listEnabled()
      .filter((binding) => {
        if (binding.triggerType !== input.triggerType) return false;
        if (binding.triggerSource && binding.triggerSource !== input.triggerSource) {
          return false;
        }
        if (binding.tenantId && binding.tenantId !== input.tenantId) return false;
        if (binding.projectId && binding.projectId !== input.projectId) return false;
        return true;
      })
      .slice()
      .sort((a, b) => b.priority - a.priority);
  }

  count(): number {
    return this.bindings.size;
  }

  clear(): void {
    this.bindings.clear();
  }
}
