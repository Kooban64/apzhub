import { TestSpecificationInvariantViolation } from "../../shared/errors";
import {
  SPECIFICATION_COMPLEXITIES,
  SPECIFICATION_NUMBER_MAX,
  SPECIFICATION_PRIORITIES,
  SPECIFICATION_REFERENCE_KINDS,
  SPECIFICATION_TAG_MAX,
  SPECIFICATION_TEXT_MAX,
  SPECIFICATION_TITLE_MAX,
  SPECIFICATION_TYPES,
} from "./constants";
import type { SpecificationId } from "./specification-id";

function requireNonEmpty(label: string, value: string, max: number): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new TestSpecificationInvariantViolation(`${label} is required`);
  }
  if (normalized.length > max) {
    throw new TestSpecificationInvariantViolation(
      `${label} must be at most ${max} characters`,
    );
  }
  return normalized;
}

function optionalText(label: string, value: string | undefined, max: number): string | undefined {
  if (value === undefined) return undefined;
  const normalized = value.trim();
  if (!normalized) return undefined;
  if (normalized.length > max) {
    throw new TestSpecificationInvariantViolation(
      `${label} must be at most ${max} characters`,
    );
  }
  return normalized;
}

export type SpecificationNumber = string & { readonly __brand: "SpecificationNumber" };
export type SpecificationTitle = string & { readonly __brand: "SpecificationTitle" };
export type SpecificationDescription = string & { readonly __brand: "SpecificationDescription" };
export type SpecificationObjective = string & { readonly __brand: "SpecificationObjective" };
export type SpecificationScope = string & { readonly __brand: "SpecificationScope" };
export type SpecificationClassification = string & {
  readonly __brand: "SpecificationClassification";
};
export type SpecificationOwner = string & { readonly __brand: "SpecificationOwner" };
export type SpecificationReviewer = string & { readonly __brand: "SpecificationReviewer" };
export type SpecificationAuthor = string & { readonly __brand: "SpecificationAuthor" };
export type SpecificationTag = string & { readonly __brand: "SpecificationTag" };
export type SpecificationTimestamp = string & { readonly __brand: "SpecificationTimestamp" };

export type SpecificationType = (typeof SPECIFICATION_TYPES)[number];
export type SpecificationPriority = (typeof SPECIFICATION_PRIORITIES)[number];
export type SpecificationComplexity = (typeof SPECIFICATION_COMPLEXITIES)[number];
export type SpecificationReferenceKind = (typeof SPECIFICATION_REFERENCE_KINDS)[number];

export type SpecificationVersion = {
  readonly __brand: "SpecificationVersion";
  readonly major: number;
  readonly minor: number;
  readonly label: string;
};

export type SpecificationPreconditions = {
  readonly items: readonly string[];
};

export type SpecificationPostconditions = {
  readonly items: readonly string[];
};

export type SpecificationAcceptanceCriteria = {
  readonly items: readonly string[];
};

export type SpecificationRisk = {
  readonly id: string;
  readonly summary: string;
  readonly severity?: SpecificationPriority;
};

export type SpecificationDependency = {
  readonly id: string;
  readonly summary: string;
  readonly referenceKind?: SpecificationReferenceKind;
  readonly referenceId?: string;
};

export type SpecificationReference = {
  readonly kind: SpecificationReferenceKind;
  readonly artefactId: string;
  readonly owningDomain?: string;
  readonly label?: string;
};

export function createSpecificationNumber(value: string): SpecificationNumber {
  return requireNonEmpty(
    "Specification number",
    value,
    SPECIFICATION_NUMBER_MAX,
  ) as SpecificationNumber;
}

export function createSpecificationTitle(value: string): SpecificationTitle {
  return requireNonEmpty("Specification title", value, SPECIFICATION_TITLE_MAX) as SpecificationTitle;
}

export function createSpecificationDescription(value: string): SpecificationDescription {
  return requireNonEmpty(
    "Specification description",
    value,
    SPECIFICATION_TEXT_MAX,
  ) as SpecificationDescription;
}

export function createSpecificationObjective(value: string): SpecificationObjective {
  return requireNonEmpty(
    "Specification objective",
    value,
    SPECIFICATION_TEXT_MAX,
  ) as SpecificationObjective;
}

export function createSpecificationScope(value: string): SpecificationScope {
  return requireNonEmpty("Specification scope", value, SPECIFICATION_TEXT_MAX) as SpecificationScope;
}

export function createSpecificationClassification(value: string): SpecificationClassification {
  return requireNonEmpty(
    "Specification classification",
    value,
    SPECIFICATION_TITLE_MAX,
  ) as SpecificationClassification;
}

export function createSpecificationOwner(value: string): SpecificationOwner {
  return requireNonEmpty("Specification owner", value, SPECIFICATION_TITLE_MAX) as SpecificationOwner;
}

export function createSpecificationReviewer(value: string): SpecificationReviewer {
  return requireNonEmpty(
    "Specification reviewer",
    value,
    SPECIFICATION_TITLE_MAX,
  ) as SpecificationReviewer;
}

export function createSpecificationAuthor(value: string): SpecificationAuthor {
  return requireNonEmpty(
    "Specification author",
    value,
    SPECIFICATION_TITLE_MAX,
  ) as SpecificationAuthor;
}

export function createSpecificationTag(value: string): SpecificationTag {
  return requireNonEmpty("Specification tag", value, SPECIFICATION_TAG_MAX) as SpecificationTag;
}

export function createSpecificationTimestamp(value: string): SpecificationTimestamp {
  const normalized = value.trim();
  if (!normalized || Number.isNaN(Date.parse(normalized))) {
    throw new TestSpecificationInvariantViolation("Specification timestamp must be a valid ISO date");
  }
  return normalized as SpecificationTimestamp;
}

export function createSpecificationType(value: string): SpecificationType {
  const normalized = value.trim().toLowerCase();
  if (!(SPECIFICATION_TYPES as readonly string[]).includes(normalized)) {
    throw new TestSpecificationInvariantViolation(`Unknown Specification type: ${value}`);
  }
  return normalized as SpecificationType;
}

export function createSpecificationPriority(value: string): SpecificationPriority {
  const normalized = value.trim().toLowerCase();
  if (!(SPECIFICATION_PRIORITIES as readonly string[]).includes(normalized)) {
    throw new TestSpecificationInvariantViolation(`Unknown Specification priority: ${value}`);
  }
  return normalized as SpecificationPriority;
}

export function createSpecificationComplexity(value: string): SpecificationComplexity {
  const normalized = value.trim().toLowerCase();
  if (!(SPECIFICATION_COMPLEXITIES as readonly string[]).includes(normalized)) {
    throw new TestSpecificationInvariantViolation(`Unknown Specification complexity: ${value}`);
  }
  return normalized as SpecificationComplexity;
}

export function createSpecificationVersion(major: number, minor: number): SpecificationVersion {
  if (!Number.isInteger(major) || major < 0) {
    throw new TestSpecificationInvariantViolation("Major version must be a non-negative integer");
  }
  if (!Number.isInteger(minor) || minor < 0) {
    throw new TestSpecificationInvariantViolation("Minor version must be a non-negative integer");
  }
  return {
    __brand: "SpecificationVersion",
    major,
    minor,
    label: `${major}.${minor}`,
  };
}

export function createSpecificationPreconditions(
  items: readonly string[],
): SpecificationPreconditions {
  return {
    items: items.map((item, index) =>
      requireNonEmpty(`Precondition ${index + 1}`, item, SPECIFICATION_TEXT_MAX),
    ),
  };
}

export function createSpecificationPostconditions(
  items: readonly string[],
): SpecificationPostconditions {
  return {
    items: items.map((item, index) =>
      requireNonEmpty(`Postcondition ${index + 1}`, item, SPECIFICATION_TEXT_MAX),
    ),
  };
}

export function createSpecificationAcceptanceCriteria(
  items: readonly string[],
): SpecificationAcceptanceCriteria {
  return {
    items: items.map((item, index) =>
      requireNonEmpty(`Acceptance criterion ${index + 1}`, item, SPECIFICATION_TEXT_MAX),
    ),
  };
}

export function createSpecificationRisk(input: {
  readonly id: string;
  readonly summary: string;
  readonly severity?: string;
}): SpecificationRisk {
  return {
    id: requireNonEmpty("Risk id", input.id, SPECIFICATION_TITLE_MAX),
    summary: requireNonEmpty("Risk summary", input.summary, SPECIFICATION_TEXT_MAX),
    ...(input.severity
      ? { severity: createSpecificationPriority(input.severity) }
      : {}),
  };
}

export function createSpecificationDependency(input: {
  readonly id: string;
  readonly summary: string;
  readonly referenceKind?: string;
  readonly referenceId?: string;
}): SpecificationDependency {
  return {
    id: requireNonEmpty("Dependency id", input.id, SPECIFICATION_TITLE_MAX),
    summary: requireNonEmpty("Dependency summary", input.summary, SPECIFICATION_TEXT_MAX),
    ...(input.referenceKind
      ? { referenceKind: createSpecificationReferenceKind(input.referenceKind) }
      : {}),
    ...(input.referenceId
      ? { referenceId: requireNonEmpty("Dependency reference id", input.referenceId, 240) }
      : {}),
  };
}

export function createSpecificationReferenceKind(value: string): SpecificationReferenceKind {
  const normalized = value.trim().toLowerCase();
  if (!(SPECIFICATION_REFERENCE_KINDS as readonly string[]).includes(normalized)) {
    throw new TestSpecificationInvariantViolation(
      `Unknown Specification reference kind: ${value}`,
    );
  }
  return normalized as SpecificationReferenceKind;
}

export function createSpecificationReference(input: {
  readonly kind: string;
  readonly artefactId: string;
  readonly owningDomain?: string;
  readonly label?: string;
}): SpecificationReference {
  return {
    kind: createSpecificationReferenceKind(input.kind),
    artefactId: requireNonEmpty("Reference artefact id", input.artefactId, 240),
    ...(input.owningDomain
      ? { owningDomain: optionalText("Owning domain", input.owningDomain, 120) }
      : {}),
    ...(input.label ? { label: optionalText("Reference label", input.label, 240) } : {}),
  };
}

export function assertNotSelfReference(
  specificationId: SpecificationId,
  reference: SpecificationReference,
): void {
  if (reference.artefactId === specificationId) {
    throw new TestSpecificationInvariantViolation(
      "Specification relationships cannot reference self",
    );
  }
}

export function versionKey(version: SpecificationVersion): string {
  return version.label;
}
