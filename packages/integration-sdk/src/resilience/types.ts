import type { IntegrationError } from "../errors/types";

export type CircuitBreakerState = "closed" | "open" | "half_open";

export type CircuitBreakerAvailabilityStatus = "available" | "limited" | "unavailable";

export interface CircuitBreakerDiagnostics {
  readonly state: CircuitBreakerState;
  readonly failureCount: number;
  readonly successCount: number;
  readonly consecutiveFailures: number;
  readonly lastFailureAt?: string;
  readonly lastRecoveryAt?: string;
  readonly lastStateChangeAt?: string;
  readonly availabilityStatus: CircuitBreakerAvailabilityStatus;
}

export interface CircuitBreaker {
  readonly state: CircuitBreakerState;
  allowRequest(): boolean;
  recordSuccess(): void;
  recordFailure(error: IntegrationError): void;
  getDiagnostics(): CircuitBreakerDiagnostics;
}

export interface CircuitBreakerOptions {
  readonly failureThreshold?: number;
  readonly halfOpenSuccessThreshold?: number;
  readonly openDurationMs?: number;
  readonly name?: string;
}

export interface CreateCircuitBreakerInput extends CircuitBreakerOptions {
  readonly clock?: { now(): string; nowMs(): number };
}
