/**
 * Immutable gate definition and template registries (QO-007).
 */

import { OrchestrationError } from "../contracts/errors";
import {
  COMPOSITION_MODES,
  GATE_CATEGORY_FAMILIES,
  GATE_TEMPLATE_IDS,
  type GateComposition,
  type GateCriterion,
  type GateDefinition,
  type GateDefinitionInput,
  type GateTemplate,
  type GateTemplateInput,
} from "../contracts/governance";

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const child of Object.values(value as object)) {
      deepFreeze(child);
    }
  }
  return value;
}

function assertCriterion(criterion: GateCriterion, path = "criteria"): void {
  switch (criterion.type) {
    case "always_satisfied":
    case "always_pending":
    case "evidence_ref_present":
    case "evidence_integrity_ok":
    case "activity_selected":
    case "impact_confidence_at_least":
    case "impact_risk_at_most":
    case "selection_expected_confidence_at_least":
    case "human_approval_recorded":
      return;
    case "and":
    case "or":
      if (!criterion.criteria?.length) {
        throw new OrchestrationError(
          "validation",
          "INVALID_GATE_CRITERION",
          `${path} requires nested criteria`,
        );
      }
      for (let i = 0; i < criterion.criteria.length; i++) {
        assertCriterion(criterion.criteria[i]!, `${path}[${i}]`);
      }
      return;
    default: {
      const _exhaustive: never = criterion;
      throw new OrchestrationError(
        "validation",
        "INVALID_GATE_CRITERION",
        `Unknown criterion at ${path}`,
        { criterion: _exhaustive },
      );
    }
  }
}

function assertComposition(composition: GateComposition): void {
  if (!(COMPOSITION_MODES as readonly string[]).includes(composition.mode)) {
    throw new OrchestrationError(
      "validation",
      "INVALID_COMPOSITION",
      `Unsupported composition mode: ${(composition as GateComposition).mode}`,
    );
  }
  switch (composition.mode) {
    case "all":
    case "any":
    case "sequential":
      if (!composition.gateIds.length) {
        throw new OrchestrationError(
          "validation",
          "INVALID_COMPOSITION",
          `${composition.mode} composition requires gateIds`,
        );
      }
      return;
    case "minimum":
      if (!composition.gateIds.length || composition.count < 1) {
        throw new OrchestrationError(
          "validation",
          "INVALID_COMPOSITION",
          "minimum composition requires gateIds and count >= 1",
        );
      }
      return;
    case "weighted":
      if (!composition.items.length || composition.threshold <= 0) {
        throw new OrchestrationError(
          "validation",
          "INVALID_COMPOSITION",
          "weighted composition requires items and positive threshold",
        );
      }
      return;
    case "conditional":
      if (!composition.ifGateId.trim()) {
        throw new OrchestrationError(
          "validation",
          "INVALID_COMPOSITION",
          "conditional composition requires ifGateId",
        );
      }
      return;
    default: {
      const _exhaustive: never = composition;
      throw new OrchestrationError(
        "validation",
        "INVALID_COMPOSITION",
        `Unknown composition`,
        { composition: _exhaustive },
      );
    }
  }
}

export class GateDefinitionRegistry {
  private readonly gates = new Map<string, GateDefinition>();

  register(input: GateDefinitionInput): GateDefinition {
    const gateId = input.gateId.trim();
    const version = input.version.trim();
    const key = `${gateId}@${version}`;
    if (!gateId || !version || !input.name.trim() || !input.documentationRef.trim()) {
      throw new OrchestrationError(
        "validation",
        "INVALID_GATE_DEFINITION",
        "gateId, version, name, and documentationRef are required",
      );
    }
    if (this.gates.has(key)) {
      throw new OrchestrationError(
        "validation",
        "GATE_EXISTS",
        `Gate already registered: ${key}`,
        { gateId, version },
      );
    }
    if (
      !(GATE_CATEGORY_FAMILIES as readonly string[]).includes(input.category.family)
    ) {
      throw new OrchestrationError(
        "validation",
        "INVALID_GATE_CATEGORY",
        `Unsupported category family: ${input.category.family}`,
      );
    }
    if (!input.category.label.trim()) {
      throw new OrchestrationError(
        "validation",
        "INVALID_GATE_CATEGORY",
        "category.label is required (builtin or custom)",
      );
    }
    assertCriterion(input.criteria);

    const def: GateDefinition = Object.freeze({
      gateId,
      name: input.name.trim(),
      version,
      category: Object.freeze({
        family: input.category.family,
        label: input.category.label.trim(),
      }),
      description: (input.description ?? "").trim(),
      criteria: deepFreeze(input.criteria),
      dependencies: Object.freeze([...(input.dependencies ?? [])]),
      lifecycleState: input.lifecycleState ?? "active",
      documentationRef: input.documentationRef.trim(),
      governingPolicyId: input.governingPolicyId?.trim() || undefined,
      governingRuleId: input.governingRuleId?.trim() || undefined,
      overrideEligible: Boolean(input.overrideEligible),
      requiredApprovers: Object.freeze([...(input.requiredApprovers ?? [])]),
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      createdAt: new Date().toISOString(),
    });
    this.gates.set(key, def);
    return def;
  }

  get(gateId: string, version?: string): GateDefinition {
    if (version) {
      const g = this.gates.get(`${gateId.trim()}@${version.trim()}`);
      if (!g) {
        throw new OrchestrationError(
          "validation",
          "GATE_MISSING",
          `Gate not found: ${gateId}@${version}`,
          { gateId, version },
        );
      }
      return g;
    }
    const versions = this.listVersions(gateId);
    if (!versions.length) {
      throw new OrchestrationError(
        "validation",
        "GATE_MISSING",
        `Gate not found: ${gateId}`,
        { gateId },
      );
    }
    return versions[versions.length - 1]!;
  }

  listVersions(gateId: string): readonly GateDefinition[] {
    const id = gateId.trim();
    return [...this.gates.values()]
      .filter((g) => g.gateId === id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  list(): readonly GateDefinition[] {
    return [...this.gates.values()].sort((a, b) => a.gateId.localeCompare(b.gateId));
  }

  count(): number {
    return this.gates.size;
  }
}

export class GateTemplateRegistry {
  private readonly templates = new Map<string, GateTemplate>();

  register(input: GateTemplateInput): GateTemplate {
    if (!(GATE_TEMPLATE_IDS as readonly string[]).includes(input.templateId)) {
      throw new OrchestrationError(
        "validation",
        "INVALID_TEMPLATE",
        `Unsupported template id: ${input.templateId}`,
      );
    }
    if (this.templates.has(input.templateId)) {
      throw new OrchestrationError(
        "validation",
        "TEMPLATE_EXISTS",
        `Template already registered: ${input.templateId}`,
      );
    }
    assertComposition(input.composition);

    const template: GateTemplate = Object.freeze({
      templateId: input.templateId,
      name: input.name.trim(),
      description: (input.description ?? "").trim(),
      policyProfileId: input.policyProfileId,
      composition: deepFreeze(input.composition),
      documentationRef: input.documentationRef.trim(),
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      createdAt: new Date().toISOString(),
    });
    this.templates.set(input.templateId, template);
    return template;
  }

  get(templateId: string): GateTemplate {
    const t = this.templates.get(templateId);
    if (!t) {
      throw new OrchestrationError(
        "validation",
        "TEMPLATE_MISSING",
        `Template not found: ${templateId}`,
        { templateId },
      );
    }
    return t;
  }

  list(): readonly GateTemplate[] {
    return [...this.templates.values()].sort((a, b) =>
      a.templateId.localeCompare(b.templateId),
    );
  }

  count(): number {
    return this.templates.size;
  }
}
