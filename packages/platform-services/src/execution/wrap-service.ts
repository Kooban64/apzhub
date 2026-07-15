import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { RequestPipeline } from "./request-pipeline";

/**
 * Wraps a service object so every method executes through the request pipeline.
 * Public contract shapes remain unchanged.
 */
export function wrapServiceWithPipeline<T extends object>(
  service: T,
  pipeline: RequestPipeline,
  serviceName: string,
): T {
  return new Proxy(service, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);

      if (typeof property === "symbol" || typeof value !== "function") {
        return value;
      }

      const operation = property;

      return async (...args: unknown[]) => {
        const context = (args[0] ?? {}) as ServiceRequestContext;

        return pipeline.execute({
          service: serviceName,
          operation,
          context,
          args,
          invoke: (_enrichedContext, invokeArgs) =>
            (value as (...fnArgs: unknown[]) => Promise<unknown>).apply(
              target,
              invokeArgs as unknown[],
            ),
        });
      };
    },
  });
}
