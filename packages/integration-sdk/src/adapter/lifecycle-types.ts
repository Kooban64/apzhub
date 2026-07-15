export interface AdapterLifecycleResult {
  readonly ok: boolean;
  readonly message: string;
  readonly warnings?: readonly string[];
}

export interface AdapterConfigurationValidationResult extends AdapterLifecycleResult {
  readonly issues?: readonly string[];
}

export type AdapterDisposeReason = "shutdown" | "replace" | "error";

export interface AdapterDisposeResult extends AdapterLifecycleResult {
  readonly reason?: AdapterDisposeReason;
}
