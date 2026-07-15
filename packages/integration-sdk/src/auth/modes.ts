import type { AuthenticationMode } from "./types";

export const AUTHENTICATION_MODES: readonly AuthenticationMode[] = [
  "api_token",
  "bearer",
  "basic",
  "api_key_header",
  "api_key_query",
  "oauth2",
  "session_cookie",
  "custom",
] as const;

/** Modes with foundation validation in OSS-100-02 (no OAuth/browser flows). */
export const IMPLEMENTED_AUTHENTICATION_MODES: readonly AuthenticationMode[] = [
  "api_token",
  "bearer",
  "basic",
  "api_key_header",
  "api_key_query",
  "custom",
] as const;

export const PLACEHOLDER_AUTHENTICATION_MODES: readonly AuthenticationMode[] = [
  "oauth2",
  "session_cookie",
] as const;

const modeSet = new Set<string>(AUTHENTICATION_MODES);
const implementedSet = new Set<string>(IMPLEMENTED_AUTHENTICATION_MODES);

export function isAuthenticationMode(value: unknown): value is AuthenticationMode {
  return typeof value === "string" && modeSet.has(value);
}

export function isImplementedAuthenticationMode(
  mode: AuthenticationMode,
): boolean {
  return implementedSet.has(mode);
}
