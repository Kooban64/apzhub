import {
  computeQepTestSpecificationAvailableActions,
  type QepTestSpecificationAction,
} from "@apzhub/qep-contracts";

import type { StoredTestSpecification } from "../domain/test-specification/specification-repository";

/**
 * Computes Test Specification commands a caller may perform, delegating to
 * canonical `@apzhub/qep-contracts` rules.
 */
export function computeSpecificationAvailableActions(
  specification: Pick<StoredTestSpecification, "record">,
  permissions?: readonly string[],
): readonly QepTestSpecificationAction[] {
  return computeQepTestSpecificationAvailableActions(
    specification.record.status,
    permissions,
  );
}

export { type QepTestSpecificationAction };
