/** Source domain for a quality observation. */
export type ObservationSource =
  | "automation"
  | "scm"
  | "evidence"
  | "execution"
  | "requirements"
  | "defects"
  | "reporting"
  | "notifications"
  | "operational";

/**
 * Immutable quality observation captured from platform domains.
 * Once recorded, observations cannot be mutated.
 */
export interface QualityObservation {
  readonly observationId: string;
  readonly tenantId: string;
  readonly source: ObservationSource;
  readonly kind: string;
  readonly summary: string;
  readonly recordedAt: string;
  readonly correlationId: string;
  readonly evidenceRefs?: readonly string[];
  readonly metadata?: Readonly<Record<string, string | number | boolean>>;
  readonly severity?: "info" | "warning" | "critical";
}

export interface RecordObservationRequest {
  readonly tenantId: string;
  readonly source: ObservationSource;
  readonly kind: string;
  readonly summary: string;
  readonly correlationId: string;
  readonly evidenceRefs?: readonly string[];
  readonly metadata?: Readonly<Record<string, string | number | boolean>>;
  readonly severity?: QualityObservation["severity"];
}
