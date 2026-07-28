import { QepInvariantViolation } from "../../shared/errors";
import {
  createRequirementId,
  type RequirementId,
} from "../value-objects/requirement-id";
import {
  createRequirementContentVersionId,
  type RequirementContentVersionId,
} from "../content-version/requirement-content-version-id";
import { RELATIONSHIP_ENDPOINT_MODES } from "./constants";

export type RelationshipEndpointMode = (typeof RELATIONSHIP_ENDPOINT_MODES)[number];

/**
 * Endpoint identity: Requirement-level (living) or Content-Version-pinned.
 * Baseline projection is a query concern, not an endpoint mode (ARCH-005 §5.1).
 */
export type RelationshipEndpoint = {
  readonly mode: RelationshipEndpointMode;
  readonly requirementId: RequirementId;
  readonly contentVersionId?: RequirementContentVersionId;
  readonly tenantId: string;
};

export function createRelationshipEndpoint(input: {
  readonly mode: string;
  readonly requirementId: string;
  readonly contentVersionId?: string;
  readonly tenantId: string;
}): RelationshipEndpoint {
  const mode = input.mode.trim() as RelationshipEndpointMode;
  if (!(RELATIONSHIP_ENDPOINT_MODES as readonly string[]).includes(mode)) {
    throw new QepInvariantViolation(
      `Relationship endpoint mode must be one of: ${RELATIONSHIP_ENDPOINT_MODES.join(", ")}`,
    );
  }
  const tenantId = input.tenantId.trim();
  if (!tenantId) {
    throw new QepInvariantViolation("Relationship endpoint requires tenantId");
  }
  const requirementId = createRequirementId(input.requirementId);

  if (mode === "requirement") {
    if (input.contentVersionId !== undefined && input.contentVersionId.trim() !== "") {
      throw new QepInvariantViolation(
        "Requirement-level endpoint must not include a content version pin",
      );
    }
    return { mode, requirementId, tenantId };
  }

  const contentVersionIdRaw = input.contentVersionId?.trim();
  if (!contentVersionIdRaw) {
    throw new QepInvariantViolation(
      "Content-Version-pinned endpoint requires contentVersionId",
    );
  }
  return {
    mode,
    requirementId,
    contentVersionId: createRequirementContentVersionId(contentVersionIdRaw),
    tenantId,
  };
}

export function assertDistinctEndpoints(
  source: RelationshipEndpoint,
  target: RelationshipEndpoint,
): void {
  if (source.tenantId !== target.tenantId) {
    throw new QepInvariantViolation(
      "Relationship endpoints must share the same tenant",
    );
  }
  if (
    source.requirementId === target.requirementId &&
    (source.contentVersionId ?? "") === (target.contentVersionId ?? "")
  ) {
    throw new QepInvariantViolation("Relationship must not be self-referential");
  }
}
