import { shouldTripCircuitBreaker } from "../errors/translation/default-mapping";
import type { IntegrationError } from "../errors/types";
import type {
  CircuitBreaker,
  CircuitBreakerAvailabilityStatus,
  CircuitBreakerDiagnostics,
  CircuitBreakerOptions,
  CircuitBreakerState,
  CreateCircuitBreakerInput,
} from "./types";

const DEFAULT_FAILURE_THRESHOLD = 5;
const DEFAULT_HALF_OPEN_SUCCESS_THRESHOLD = 2;
const DEFAULT_OPEN_DURATION_MS = 30_000;

interface CircuitBreakerClock {
  now(): string;
  nowMs(): number;
}

const defaultClock: CircuitBreakerClock = {
  now: () => new Date().toISOString(),
  nowMs: () => Date.now(),
};

function resolveAvailabilityStatus(
  state: CircuitBreakerState,
): CircuitBreakerAvailabilityStatus {
  switch (state) {
    case "closed":
      return "available";
    case "half_open":
      return "limited";
    case "open":
      return "unavailable";
  }
}

export class DefaultCircuitBreaker implements CircuitBreaker {
  private currentState: CircuitBreakerState = "closed";
  private failureCount = 0;
  private successCount = 0;
  private consecutiveFailures = 0;
  private halfOpenSuccesses = 0;
  private lastFailureAt?: string;
  private lastRecoveryAt?: string;
  private lastStateChangeAt?: string;
  private openedAtMs?: number;

  private readonly failureThreshold: number;
  private readonly halfOpenSuccessThreshold: number;
  private readonly openDurationMs: number;
  private readonly clock: CircuitBreakerClock;

  constructor(options: CircuitBreakerOptions & { readonly clock?: CircuitBreakerClock } = {}) {
    this.failureThreshold = options.failureThreshold ?? DEFAULT_FAILURE_THRESHOLD;
    this.halfOpenSuccessThreshold =
      options.halfOpenSuccessThreshold ?? DEFAULT_HALF_OPEN_SUCCESS_THRESHOLD;
    this.openDurationMs = options.openDurationMs ?? DEFAULT_OPEN_DURATION_MS;
    this.clock = options.clock ?? defaultClock;
    this.lastStateChangeAt = this.clock.now();
  }

  get state(): CircuitBreakerState {
    this.maybeTransitionFromOpen();
    return this.currentState;
  }

  allowRequest(): boolean {
    this.maybeTransitionFromOpen();

    if (this.currentState === "open") {
      return false;
    }

    return true;
  }

  recordSuccess(): void {
    this.maybeTransitionFromOpen();
    this.successCount += 1;

    if (this.currentState === "half_open") {
      this.halfOpenSuccesses += 1;
      if (this.halfOpenSuccesses >= this.halfOpenSuccessThreshold) {
        this.transitionTo("closed");
        this.lastRecoveryAt = this.clock.now();
      }
      return;
    }

    if (this.currentState === "closed") {
      this.consecutiveFailures = 0;
    }
  }

  recordFailure(error: IntegrationError): void {
    this.maybeTransitionFromOpen();

    if (!shouldTripCircuitBreaker(error.category)) {
      return;
    }

    this.failureCount += 1;
    this.consecutiveFailures += 1;
    this.lastFailureAt = this.clock.now();

    if (this.currentState === "half_open") {
      this.transitionTo("open");
      return;
    }

    if (this.currentState === "closed" && this.consecutiveFailures >= this.failureThreshold) {
      this.transitionTo("open");
    }
  }

  getDiagnostics(): CircuitBreakerDiagnostics {
    this.maybeTransitionFromOpen();

    return {
      state: this.currentState,
      failureCount: this.failureCount,
      successCount: this.successCount,
      consecutiveFailures: this.consecutiveFailures,
      lastFailureAt: this.lastFailureAt,
      lastRecoveryAt: this.lastRecoveryAt,
      lastStateChangeAt: this.lastStateChangeAt,
      availabilityStatus: resolveAvailabilityStatus(this.currentState),
    };
  }

  private maybeTransitionFromOpen(): void {
    if (this.currentState !== "open" || this.openedAtMs === undefined) {
      return;
    }

    if (this.clock.nowMs() - this.openedAtMs >= this.openDurationMs) {
      this.transitionTo("half_open");
    }
  }

  private transitionTo(next: CircuitBreakerState): void {
    this.currentState = next;
    this.lastStateChangeAt = this.clock.now();

    if (next === "open") {
      this.openedAtMs = this.clock.nowMs();
      this.halfOpenSuccesses = 0;
      return;
    }

    if (next === "closed") {
      this.consecutiveFailures = 0;
      this.halfOpenSuccesses = 0;
      this.openedAtMs = undefined;
      return;
    }

    if (next === "half_open") {
      this.halfOpenSuccesses = 0;
    }
  }
}

export function createDefaultCircuitBreaker(
  input: CreateCircuitBreakerInput = {},
): CircuitBreaker {
  return new DefaultCircuitBreaker(input);
}

export function buildCircuitBreakerHealthMessage(
  diagnostics: CircuitBreakerDiagnostics,
): { readonly status: "pass" | "warn" | "fail"; readonly message: string } {
  switch (diagnostics.state) {
    case "closed":
      return {
        status: "pass",
        message: `Circuit breaker closed (${diagnostics.successCount} successes recorded)`,
      };
    case "half_open":
      return {
        status: "warn",
        message: "Circuit breaker half-open — limited availability while recovering",
      };
    case "open":
      return {
        status: "fail",
        message: `Circuit breaker open after ${diagnostics.consecutiveFailures} consecutive failures`,
      };
  }
}
