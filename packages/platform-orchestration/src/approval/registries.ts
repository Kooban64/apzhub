/**
 * Immutable approval template and authority registries (QO-008).
 */

import { OrchestrationError } from "../contracts/errors";
import type {
  ApprovalDecisionRule,
  ApprovalTemplate,
  ApprovalTemplateInput,
  AuthorityInput,
  AuthorityRecord,
  SodRule,
} from "../contracts/approval";

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const child of Object.values(value as object)) {
      deepFreeze(child);
    }
  }
  return value;
}

function assertDecisionRule(rule: ApprovalDecisionRule): void {
  if (rule.type === "minimum" && rule.count < 1) {
    throw new OrchestrationError(
      "validation",
      "INVALID_DECISION_RULE",
      "minimum decision rule requires count >= 1",
    );
  }
  if (rule.type === "emergency_override" && !rule.authorityId.trim()) {
    throw new OrchestrationError(
      "validation",
      "INVALID_DECISION_RULE",
      "emergency_override requires authorityId",
    );
  }
}

function assertSodRules(rules: readonly SodRule[]): void {
  for (const rule of rules) {
    if (
      (rule.type === "mandatory_authority" || rule.type === "emergency_authority") &&
      !rule.authorityId.trim()
    ) {
      throw new OrchestrationError(
        "validation",
        "INVALID_SOD_RULE",
        `${rule.type} requires authorityId`,
      );
    }
    if (rule.type === "time_limited_delegation" && rule.maxHours < 1) {
      throw new OrchestrationError(
        "validation",
        "INVALID_SOD_RULE",
        "time_limited_delegation requires maxHours >= 1",
      );
    }
  }
}

export class AuthorityRegistry {
  private readonly authorities = new Map<string, AuthorityRecord>();

  register(input: AuthorityInput): AuthorityRecord {
    const authorityId = input.authorityId.trim();
    const name = input.name.trim();
    const scope = input.scope.trim();
    if (!authorityId || !name || !scope) {
      throw new OrchestrationError(
        "validation",
        "INVALID_AUTHORITY",
        "authorityId, name, and scope are required",
      );
    }
    if (this.authorities.has(authorityId)) {
      throw new OrchestrationError(
        "validation",
        "AUTHORITY_EXISTS",
        `Authority already registered: ${authorityId}`,
        { authorityId },
      );
    }
    const record: AuthorityRecord = Object.freeze({
      authorityId,
      name,
      scope,
      delegationSupported: Boolean(input.delegationSupported),
      escalationSupported: Boolean(input.escalationSupported),
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      createdAt: new Date().toISOString(),
    });
    this.authorities.set(authorityId, record);
    return record;
  }

  get(authorityId: string): AuthorityRecord {
    const record = this.authorities.get(authorityId.trim());
    if (!record) {
      throw new OrchestrationError(
        "validation",
        "AUTHORITY_MISSING",
        `Authority not found: ${authorityId}`,
        { authorityId },
      );
    }
    return record;
  }

  tryGet(authorityId: string): AuthorityRecord | undefined {
    return this.authorities.get(authorityId.trim());
  }

  list(): readonly AuthorityRecord[] {
    return [...this.authorities.values()].sort((a, b) =>
      a.authorityId.localeCompare(b.authorityId),
    );
  }

  count(): number {
    return this.authorities.size;
  }
}

export class ApprovalTemplateRegistry {
  private readonly templates = new Map<string, ApprovalTemplate>();

  register(input: ApprovalTemplateInput): ApprovalTemplate {
    const templateId = input.templateId.trim();
    const version = input.version.trim();
    const key = `${templateId}@${version}`;
    if (
      !templateId ||
      !version ||
      !input.name.trim() ||
      !input.documentationRef.trim()
    ) {
      throw new OrchestrationError(
        "validation",
        "INVALID_APPROVAL_TEMPLATE",
        "templateId, version, name, and documentationRef are required",
      );
    }
    if (this.templates.has(key)) {
      throw new OrchestrationError(
        "validation",
        "TEMPLATE_EXISTS",
        `Approval template already registered: ${key}`,
        { templateId, version },
      );
    }
    if (!input.requiredAuthorities.length) {
      throw new OrchestrationError(
        "validation",
        "INVALID_APPROVAL_TEMPLATE",
        "requiredAuthorities must not be empty",
      );
    }

    const decisionRule = input.decisionRule ?? { type: "all_required" };
    const sodRules = input.sodRules ?? [];
    assertDecisionRule(decisionRule);
    assertSodRules(sodRules);

    const template: ApprovalTemplate = Object.freeze({
      templateId,
      name: input.name.trim(),
      version,
      requiredAuthorities: Object.freeze([
        ...new Set(input.requiredAuthorities.map((a) => a.trim())),
      ]),
      decisionRule: deepFreeze(decisionRule),
      sodRules: deepFreeze([...sodRules]),
      escalationRules: Object.freeze(
        [...(input.escalationRules ?? [])].map(deepFreeze),
      ),
      lifecycleState: input.lifecycleState ?? "active",
      documentationRef: input.documentationRef.trim(),
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      createdAt: new Date().toISOString(),
    });
    this.templates.set(key, template);
    return template;
  }

  get(templateId: string, version?: string): ApprovalTemplate {
    if (version) {
      const t = this.templates.get(`${templateId.trim()}@${version.trim()}`);
      if (!t) {
        throw new OrchestrationError(
          "validation",
          "TEMPLATE_MISSING",
          `Approval template not found: ${templateId}@${version}`,
          { templateId, version },
        );
      }
      return t;
    }
    const versions = this.listVersions(templateId);
    if (!versions.length) {
      throw new OrchestrationError(
        "validation",
        "TEMPLATE_MISSING",
        `Approval template not found: ${templateId}`,
        { templateId },
      );
    }
    return versions[versions.length - 1]!;
  }

  listVersions(templateId: string): readonly ApprovalTemplate[] {
    const id = templateId.trim();
    return [...this.templates.values()]
      .filter((t) => t.templateId === id)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  list(): readonly ApprovalTemplate[] {
    return [...this.templates.values()].sort((a, b) =>
      a.templateId.localeCompare(b.templateId),
    );
  }

  count(): number {
    return this.templates.size;
  }
}
