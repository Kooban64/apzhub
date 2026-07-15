import type { TimeoutPolicy, TimeoutPolicyOptions } from "../types";

export class DefaultTimeoutPolicy implements TimeoutPolicy {
  readonly options: TimeoutPolicyOptions;

  constructor(options: TimeoutPolicyOptions) {
    this.options = {
      overallMs: options.overallMs,
      connectMs: options.connectMs,
      requestMs: options.requestMs,
      responseMs: options.responseMs,
    };
  }

  createController(
    overrideMs?: number,
    parent?: AbortSignal,
  ): {
    readonly controller: AbortController;
    readonly timeoutMs: number;
    dispose(): void;
  } {
    const controller = new AbortController();
    const timeoutMs = overrideMs ?? this.options.overallMs;

    const onParentAbort = (): void => {
      controller.abort(parent?.reason);
    };

    if (parent) {
      if (parent.aborted) {
        controller.abort(parent.reason);
      } else {
        parent.addEventListener("abort", onParentAbort, { once: true });
      }
    }

    const timer = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    return {
      controller,
      timeoutMs,
      dispose: () => {
        clearTimeout(timer);
        if (parent) {
          parent.removeEventListener("abort", onParentAbort);
        }
      },
    };
  }
}

export function createDefaultTimeoutPolicy(
  options: TimeoutPolicyOptions,
): DefaultTimeoutPolicy {
  return new DefaultTimeoutPolicy(options);
}
