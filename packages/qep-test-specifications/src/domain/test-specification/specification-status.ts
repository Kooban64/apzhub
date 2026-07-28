import { TestSpecificationInvariantViolation } from "../../shared/errors";
import { SPECIFICATION_STATUSES } from "./constants";

export type SpecificationStatus = (typeof SPECIFICATION_STATUSES)[number];

export function createSpecificationStatus(value: string): SpecificationStatus {
  const normalized = value.trim().toLowerCase();
  if (!(SPECIFICATION_STATUSES as readonly string[]).includes(normalized)) {
    throw new TestSpecificationInvariantViolation(
      `Unknown Specification status: ${value}`,
    );
  }
  return normalized as SpecificationStatus;
}

export function isImmutableSpecificationStatus(status: SpecificationStatus): boolean {
  return (
    status === "approved" ||
    status === "superseded" ||
    status === "retired" ||
    status === "withdrawn" ||
    status === "cancelled"
  );
}

export function isEditableSpecificationStatus(status: SpecificationStatus): boolean {
  return status === "draft";
}
