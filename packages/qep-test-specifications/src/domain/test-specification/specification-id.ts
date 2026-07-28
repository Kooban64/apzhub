import { TestSpecificationInvariantViolation } from "../../shared/errors";

declare const specificationIdBrand: unique symbol;

export type SpecificationId = string & {
  readonly [specificationIdBrand]: "SpecificationId";
};

export function createSpecificationId(value: string): SpecificationId {
  const normalized = value.trim();
  if (!/^tsp_[A-Za-z0-9_-]+$/.test(normalized)) {
    throw new TestSpecificationInvariantViolation(
      "Specification id must match tsp_[A-Za-z0-9_-]+",
    );
  }
  return normalized as SpecificationId;
}
