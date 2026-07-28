import { TestSpecificationInvariantViolation } from "../../shared/errors";
import { createSpecificationId, type SpecificationId } from "./specification-id";
import {
  assertNotSelfReference,
  createSpecificationReference,
  type SpecificationReference,
} from "./value-objects";

declare const relationshipIdBrand: unique symbol;

export type SpecificationRelationshipId = string & {
  readonly [relationshipIdBrand]: "SpecificationRelationshipId";
};

export type SpecificationRelationship = {
  readonly id: SpecificationRelationshipId;
  readonly specificationId: SpecificationId;
  readonly reference: SpecificationReference;
  readonly createdAt: string;
  readonly createdBy: string;
};

export function createSpecificationRelationshipId(
  value: string,
): SpecificationRelationshipId {
  const normalized = value.trim();
  if (!/^tsr_[A-Za-z0-9_-]+$/.test(normalized)) {
    throw new TestSpecificationInvariantViolation(
      "Specification relationship id must match tsr_[A-Za-z0-9_-]+",
    );
  }
  return normalized as SpecificationRelationshipId;
}

export function createSpecificationRelationship(input: {
  readonly id: string;
  readonly specificationId: SpecificationId;
  readonly kind: string;
  readonly artefactId: string;
  readonly owningDomain?: string;
  readonly label?: string;
  readonly createdAt: string;
  readonly createdBy: string;
}): SpecificationRelationship {
  const createdBy = input.createdBy.trim();
  if (!createdBy) {
    throw new TestSpecificationInvariantViolation(
      "Specification relationship requires createdBy",
    );
  }
  const reference = createSpecificationReference({
    kind: input.kind,
    artefactId: input.artefactId,
    owningDomain: input.owningDomain,
    label: input.label,
  });
  assertNotSelfReference(input.specificationId, reference);

  return {
    id: createSpecificationRelationshipId(input.id),
    specificationId: input.specificationId,
    reference,
    createdAt: input.createdAt,
    createdBy,
  };
}

export function findRelationshipById(
  relationships: readonly SpecificationRelationship[],
  relationshipId: string,
): SpecificationRelationship | undefined {
  const id = createSpecificationRelationshipId(relationshipId);
  return relationships.find((r) => r.id === id);
}

export function assertRelationshipBelongsTo(
  relationship: SpecificationRelationship,
  specificationId: SpecificationId,
): void {
  if (relationship.specificationId !== specificationId) {
    throw new TestSpecificationInvariantViolation(
      "Specification relationship does not belong to this aggregate",
    );
  }
}

export function assertUniqueRelationship(
  relationships: readonly SpecificationRelationship[],
  reference: SpecificationReference,
): void {
  const duplicate = relationships.some(
    (r) =>
      r.reference.kind === reference.kind &&
      r.reference.artefactId === reference.artefactId,
  );
  if (duplicate) {
    throw new TestSpecificationInvariantViolation(
      "Specification relationship already exists for this reference",
    );
  }
}

export function createSpecificationIdSafe(value: string): SpecificationId {
  return createSpecificationId(value);
}
