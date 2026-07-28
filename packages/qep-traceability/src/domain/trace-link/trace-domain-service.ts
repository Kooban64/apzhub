import { TraceInvariantViolation } from "../../shared/errors";
import type { TraceEndpointReference } from "./trace-endpoint";
import type { TraceOrigin } from "./trace-origin";
import type { TraceRationale } from "./trace-rationale";
import type { TraceScope } from "./trace-scope";
import type { TraceStrength } from "./trace-strength";
import type { TraceType } from "./trace-type";
import {
  assertCircularTracePolicy,
  assertCrossDomainOwnership,
  assertDuplicateTrace,
  assertEndpointExistence,
  assertEndpointPair,
  assertOriginForProjection,
  assertRationalePolicy,
  assertScope,
  type EndpointExistenceFact,
  type TraceEdgeFact,
} from "./trace-policy";
import { getTraceTaxonomyDefinition } from "./trace-taxonomy";

/**
 * Pure domain service — no repositories, databases, HTTP, or Platform services.
 * Callers supply in-memory facts for existence / duplicate / cycle checks.
 */
export type TraceValidationContext = {
  readonly tenantId: string;
  readonly type: TraceType;
  readonly source: TraceEndpointReference;
  readonly target: TraceEndpointReference;
  readonly scope: TraceScope;
  readonly origin: TraceOrigin;
  readonly rationale?: TraceRationale;
  readonly existingEdges?: readonly TraceEdgeFact[];
  readonly endpointFacts?: readonly EndpointExistenceFact[];
  readonly excludeTraceId?: string;
};

export function defaultStrengthForTraceType(type: TraceType): TraceStrength {
  return getTraceTaxonomyDefinition(type).defaultStrength;
}

/**
 * Validates structural, ownership, duplicate, and cycle rules for create / validate.
 */
export function validateTraceLinkStructure(context: TraceValidationContext): void {
  assertOriginForProjection(context.type, context.origin);
  assertEndpointPair(context.source, context.target, context.tenantId, context.type);
  assertCrossDomainOwnership(context.source, context.target, context.type);
  assertScope(context.scope);
  assertRationalePolicy(context.type, context.rationale);
  if (context.endpointFacts) {
    assertEndpointExistence(context.source, context.target, context.endpointFacts);
  }
  if (context.existingEdges) {
    assertDuplicateTrace(
      {
        type: context.type,
        source: context.source,
        target: context.target,
        scope: context.scope,
      },
      context.existingEdges,
      context.excludeTraceId,
    );
    assertCircularTracePolicy(
      context.type,
      context.source,
      context.target,
      context.existingEdges,
    );
  }
}

/**
 * Additional checks before moving draft → validated.
 */
export function validateTraceLinkForValidation(
  context: TraceValidationContext,
): void {
  validateTraceLinkStructure(context);
  if (!context.endpointFacts || context.endpointFacts.length === 0) {
    throw new TraceInvariantViolation(
      "Trace validation requires endpoint existence facts",
    );
  }
  assertEndpointExistence(context.source, context.target, context.endpointFacts);
}
