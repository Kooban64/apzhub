/**
 * Law + Knowledge reference catalogues for Enterprise Context.
 * Derived projections — owning products remain SoR. No engine brands.
 * APZHUB-CONTEXT-002: catalogues keyed by focus type.
 */

import type { ContextFocus, ContextFragment } from "@apzhub/platform-service-contracts";

function lawBase(focusId: string, scopeLabel: string): readonly ContextFragment[] {
  return Object.freeze([
    Object.freeze({
      id: `law:gq-01:${focusId}`,
      providerId: "law" as const,
      productLabel: "APZ Law",
      sectionHint: "approvals",
      title: "Required approvals before material change",
      summary: `Confirm governance approvals are in place before changing ${scopeLabel}.`,
      href: "/workspace/law",
      sourceEntityRef: "GQ-01",
      fragmentClass: "entity" as const,
      severity: "attention" as const,
    }),
    Object.freeze({
      id: `law:gq-02:${focusId}`,
      providerId: "law" as const,
      productLabel: "APZ Law",
      sectionHint: "obligations",
      title: "Applicable governance obligations",
      summary: `Obligations attached to this ${scopeLabel} must remain visible while work continues.`,
      href: "/workspace/law",
      sourceEntityRef: "GQ-02",
      fragmentClass: "entity" as const,
      severity: "info" as const,
    }),
    Object.freeze({
      id: `law:gq-03:${focusId}`,
      providerId: "law" as const,
      productLabel: "APZ Law",
      sectionHint: "warnings",
      title: "Policies governing this work",
      summary:
        "Surface governing policy before acting when convenience conflicts with compliance.",
      href: "/workspace/law",
      sourceEntityRef: "GQ-03",
      fragmentClass: "entity" as const,
      severity: "attention" as const,
    }),
  ]);
}

export function lawFragmentsForFocus(focus: ContextFocus): readonly ContextFragment[] {
  const scope =
    focus.type === "project"
      ? "project"
      : focus.type === "workflow"
        ? "workflow journey"
        : focus.type === "support"
          ? "support request"
          : "organisational memory";
  return lawBase(focus.id, scope);
}

/** @deprecated Prefer lawFragmentsForFocus. */
export function lawFragmentsForProject(projectId: string): readonly ContextFragment[] {
  return lawFragmentsForFocus({ type: "project", id: projectId });
}

function knowledgeBase(focus: ContextFocus): readonly ContextFragment[] {
  const focusId = focus.id;
  const common = [
    Object.freeze({
      id: `knowledge:lesson-handover:${focusId}`,
      providerId: "knowledge" as const,
      productLabel: "APZ Knowledge",
      sectionHint: "lessons",
      title: "Handover gaps cause rework after close",
      summary:
        "Structured handover prevents the next team rediscovering known constraints.",
      href: "/workspace/knowledge/lessons",
      sourceEntityRef: "lesson-handover-checklist",
      fragmentClass: "entity" as const,
      severity: "info" as const,
    }),
    Object.freeze({
      id: `knowledge:standard-evidence:${focusId}`,
      providerId: "knowledge" as const,
      productLabel: "APZ Knowledge",
      sectionHint: "standards",
      title: "Quality evidence before release",
      summary: "Product changes require an approved Decision Package before release.",
      href: "/workspace/knowledge/library",
      sourceEntityRef: "standard-change-evidence",
      fragmentClass: "entity" as const,
      severity: "attention" as const,
    }),
    Object.freeze({
      id: `knowledge:procedure-escalation:${focusId}`,
      providerId: "knowledge" as const,
      productLabel: "APZ Knowledge",
      sectionHint: "procedures",
      title: "Escalate service impact within agreed windows",
      summary: "Use the approved service procedure when impact thresholds are met.",
      href: "/workspace/knowledge/library",
      sourceEntityRef: "procedure-incident-escalation",
      fragmentClass: "entity" as const,
      severity: "info" as const,
    }),
  ];

  if (focus.type === "knowledge") {
    return Object.freeze([
      ...common,
      Object.freeze({
        id: `knowledge:decision-link:${focusId}`,
        providerId: "knowledge" as const,
        productLabel: "APZ Knowledge",
        sectionHint: "decisions",
        title: "Related operational decisions (by reference)",
        summary:
          "Decision knowledge references Analytics / board decisions — Knowledge does not own them.",
        href: "/workspace/knowledge/decision-knowledge",
        sourceEntityRef: "decision-knowledge",
        fragmentClass: "guidance" as const,
        severity: "info" as const,
      }),
      Object.freeze({
        id: `knowledge:standards-relationship:${focusId}`,
        providerId: "knowledge" as const,
        productLabel: "APZ Knowledge",
        sectionHint: "standards",
        title: "Standards relationship for this memory",
        summary:
          "Approved standards and best practices that this organisational memory relates to.",
        href: "/workspace/knowledge/library",
        sourceEntityRef: "standards-relationship",
        fragmentClass: "guidance" as const,
        severity: "info" as const,
      }),
    ]);
  }

  if (focus.type === "support") {
    return Object.freeze([
      ...common,
      Object.freeze({
        id: `knowledge:practice-governance:${focusId}`,
        providerId: "knowledge" as const,
        productLabel: "APZ Knowledge",
        sectionHint: "guidance",
        title: "Ask governance questions before convenient shortcuts",
        summary:
          "When governance and convenience conflict, follow the approved governance path.",
        href: "/workspace/knowledge",
        sourceEntityRef: "practice-governance-first",
        fragmentClass: "entity" as const,
        severity: "info" as const,
      }),
    ]);
  }

  return Object.freeze([
    ...common,
    Object.freeze({
      id: `knowledge:practice-governance:${focusId}`,
      providerId: "knowledge" as const,
      productLabel: "APZ Knowledge",
      sectionHint: "guidance",
      title: "Ask governance questions before convenient shortcuts",
      summary:
        "When governance and convenience conflict, follow the approved governance path.",
      href: "/workspace/knowledge",
      sourceEntityRef: "practice-governance-first",
      fragmentClass: "entity" as const,
      severity: "info" as const,
    }),
  ]);
}

export function knowledgeFragmentsForFocus(
  focus: ContextFocus,
): readonly ContextFragment[] {
  return knowledgeBase(focus);
}

/** @deprecated Prefer knowledgeFragmentsForFocus. */
export function knowledgeFragmentsForProject(
  projectId: string,
): readonly ContextFragment[] {
  return knowledgeFragmentsForFocus({ type: "project", id: projectId });
}
