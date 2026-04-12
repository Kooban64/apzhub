/** Shared health vocabulary for all domain adapters (surfaced on admin health strip). */

export type AdapterSignal = "healthy" | "degraded" | "misconfigured";

export type AdapterHealthResult = {
  domain: string;
  signal: AdapterSignal;
  detail: string;
  /** When set, admin health strip uses this as the subsystem name instead of `${domain} adapter`. */
  label?: string;
};
