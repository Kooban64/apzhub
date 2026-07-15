import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

export interface ServiceMiddlewareContext {
  readonly context: ServiceRequestContext;
  readonly service: string;
  readonly operation: string;
  readonly args: readonly unknown[];
  readonly requestId: string;
  readonly startedAtMs: number;
}

export interface ServiceMiddlewareResult {
  readonly context: ServiceRequestContext;
  readonly args: readonly unknown[];
}

/**
 * Service middleware — runs before and optionally after operations.
 * Supports logging, metrics, validation, and policy evaluation hooks.
 */
export interface ServiceMiddleware {
  readonly id: string;
  /** Lower values run first on the before path; after path runs in reverse. */
  readonly priority?: number;
  before?(input: ServiceMiddlewareContext): Promise<ServiceMiddlewareResult | void>;
  after?(
    input: ServiceMiddlewareContext & {
      readonly result?: unknown;
      readonly error?: unknown;
      readonly durationMs: number;
    },
  ): Promise<void>;
}

export class MiddlewareRegistry {
  private readonly middlewares: ServiceMiddleware[] = [];

  register(middleware: ServiceMiddleware): void {
    this.middlewares.push(middleware);
    this.middlewares.sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
  }

  list(): readonly ServiceMiddleware[] {
    return [...this.middlewares];
  }

  async runBefore(input: ServiceMiddlewareContext): Promise<ServiceMiddlewareResult> {
    let context = input.context;
    let args = input.args;

    for (const middleware of this.middlewares) {
      if (!middleware.before) {
        continue;
      }
      const result = await middleware.before({ ...input, context, args });
      if (result) {
        context = result.context;
        args = result.args;
      }
    }

    return { context, args };
  }

  async runAfter(
    input: ServiceMiddlewareContext & {
      readonly result?: unknown;
      readonly error?: unknown;
      readonly durationMs: number;
    },
  ): Promise<void> {
    for (const middleware of [...this.middlewares].reverse()) {
      if (middleware.after) {
        await middleware.after(input);
      }
    }
  }
}
