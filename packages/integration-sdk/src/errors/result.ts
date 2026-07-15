import type { IntegrationError } from "./types";

export type SdkResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: IntegrationError };

export function sdkOk<T>(value: T): SdkResult<T> {
  return { ok: true, value };
}

export function sdkErr<T>(error: IntegrationError): SdkResult<T> {
  return { ok: false, error };
}
