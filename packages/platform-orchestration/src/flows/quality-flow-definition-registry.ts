/**
 * Immutable Quality Flow Definition registry (QO-004).
 * Definitions are never mutated — versioning creates a new immutable record.
 */

import { OrchestrationError } from "../contracts/errors";
import { QUALITY_FLOW_STAGES } from "../contracts/capability-catalogue";
import type {
  QualityFlowDefinition,
  QualityFlowDefinitionInput,
} from "../contracts/quality-flow";

function key(flowId: string, version: string): string {
  return `${flowId}@${version}`;
}

export class QualityFlowDefinitionRegistry {
  private readonly definitions = new Map<string, QualityFlowDefinition>();

  register(input: QualityFlowDefinitionInput): QualityFlowDefinition {
    const flowId = input.flowId.trim();
    const version = input.version.trim();
    const name = input.name.trim();
    const owner = input.owner.trim();
    const documentationRef = input.documentationRef.trim();

    if (!flowId || !version || !name || !owner || !documentationRef) {
      throw new OrchestrationError(
        "validation",
        "INVALID_FLOW_DEFINITION",
        "flowId, version, name, owner, and documentationRef are required",
      );
    }

    const k = key(flowId, version);
    if (this.definitions.has(k)) {
      throw new OrchestrationError(
        "validation",
        "FLOW_DEFINITION_EXISTS",
        `Quality Flow definition already registered: ${k}`,
        { flowId, version },
      );
    }

    const stages = [...(input.supportedCapabilityStages ?? [])];
    for (const stage of stages) {
      if (!(QUALITY_FLOW_STAGES as readonly string[]).includes(stage)) {
        throw new OrchestrationError(
          "validation",
          "INVALID_FLOW_STAGE",
          `Unsupported capability stage in flow definition: ${stage}`,
          { stage },
        );
      }
    }

    const definition: QualityFlowDefinition = Object.freeze({
      flowId,
      name,
      version,
      description: (input.description ?? "").trim(),
      owner,
      supportedTriggerTypes: Object.freeze([...(input.supportedTriggerTypes ?? [])]),
      supportedCapabilityStages: Object.freeze(stages),
      supportedPolicies: Object.freeze([...(input.supportedPolicies ?? [])]),
      supportedGates: Object.freeze([...(input.supportedGates ?? [])]),
      lifecycleVersion: (input.lifecycleVersion ?? "1").trim() || "1",
      documentationRef,
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      createdAt: new Date().toISOString(),
      status: input.status ?? "active",
    });

    this.definitions.set(k, definition);
    return definition;
  }

  /**
   * Register a new immutable version for an existing flowId.
   * Prior versions remain unchanged.
   */
  version(
    flowId: string,
    input: Omit<QualityFlowDefinitionInput, "flowId">,
  ): QualityFlowDefinition {
    const id = flowId.trim();
    if (!this.listVersions(id).length) {
      throw new OrchestrationError(
        "validation",
        "FLOW_DEFINITION_MISSING",
        `Cannot version unknown Quality Flow: ${id}`,
        { flowId: id },
      );
    }
    return this.register({ ...input, flowId: id });
  }

  get(flowId: string, version: string): QualityFlowDefinition {
    const def = this.definitions.get(key(flowId.trim(), version.trim()));
    if (!def) {
      throw new OrchestrationError(
        "validation",
        "FLOW_DEFINITION_MISSING",
        `Quality Flow definition not found: ${flowId}@${version}`,
        { flowId, version },
      );
    }
    return def;
  }

  tryGet(flowId: string, version: string): QualityFlowDefinition | undefined {
    return this.definitions.get(key(flowId.trim(), version.trim()));
  }

  /** Latest registered version for flowId (by createdAt). */
  getLatest(flowId: string): QualityFlowDefinition {
    const versions = this.listVersions(flowId);
    if (versions.length === 0) {
      throw new OrchestrationError(
        "validation",
        "FLOW_DEFINITION_MISSING",
        `Quality Flow definition not found: ${flowId}`,
        { flowId },
      );
    }
    return versions[versions.length - 1]!;
  }

  listVersions(flowId: string): readonly QualityFlowDefinition[] {
    const id = flowId.trim();
    return [...this.definitions.values()]
      .filter((d) => d.flowId === id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  list(): readonly QualityFlowDefinition[] {
    return [...this.definitions.values()].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
  }

  count(): number {
    return this.definitions.size;
  }
}
