/**
 * Safe product lifecycle hook wrappers (APZSEARCH-016).
 * Never throws into product transactions when orchestration is disabled.
 */

import type { PublicationDispatcher } from "../dispatcher";
import type {
  EnqueuePublicationInput,
  PublicationOperation,
  PublicationProductId,
} from "../types";

export type ProductPublicationHookContext = {
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly correlationId: string;
  readonly actorUserId?: string;
};

export type OrchestratedPublicationCall = {
  readonly entityId: string;
  readonly entityType: string;
  readonly productId: PublicationProductId;
  readonly operation: PublicationOperation;
  readonly payload: unknown;
};

/**
 * Enqueue a publication without affecting the product transaction.
 * Disabled orchestration → no-op success.
 */
export async function enqueueProductPublicationSafely(
  dispatcher: PublicationDispatcher,
  context: ProductPublicationHookContext,
  call: OrchestratedPublicationCall,
): Promise<{ readonly accepted: boolean; readonly deduplicated?: boolean }> {
  const input: EnqueuePublicationInput = {
    tenantId: context.tenantId,
    organisationId: context.organisationId,
    entityId: call.entityId,
    entityType: call.entityType,
    productId: call.productId,
    operation: call.operation,
    payload: call.payload,
    correlationId: context.correlationId,
    actorUserId: context.actorUserId,
  };

  try {
    const result = await dispatcher.enqueue(input);
    if (!result.ok) {
      return { accepted: false };
    }
    return { accepted: true, deduplicated: result.deduplicated };
  } catch {
    // Product transactions must not fail because of publication orchestration.
    return { accepted: false };
  }
}

/**
 * Wraps a sync product service method to fire a post-success publication enqueue.
 * Composition helper — does not modify platform product service sources.
 */
export function afterSuccessEnqueue<TArgs extends unknown[], TResult>(
  method: (...args: TArgs) => Promise<TResult>,
  resolve: (
    args: TArgs,
    result: TResult,
  ) => {
    readonly context: ProductPublicationHookContext;
    readonly call: OrchestratedPublicationCall;
  } | null,
  dispatcher: PublicationDispatcher,
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs) => {
    const result = await method(...args);
    const resolved = resolve(args, result);
    if (resolved) {
      void enqueueProductPublicationSafely(dispatcher, resolved.context, resolved.call);
    }
    return result;
  };
}
