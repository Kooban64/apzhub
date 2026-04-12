import { logStructured } from "@/lib/observability/log";

let devMailTokenBannerLogged = false;

function devMailTokenLoggingEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.APZHUB_AUTH_DEV_LOG_EMAIL_TOKENS === "1";
}

/**
 * Logs a raw email token only in non-production when APZHUB_AUTH_DEV_LOG_EMAIL_TOKENS=1.
 * Emits a one-time loud warning the first time this path is used.
 */
export function logDevEmailTokenIfEnabled(
  kind: "password_reset" | "email_verify",
  fields: { correlationId: string; rawToken: string },
): void {
  if (!devMailTokenLoggingEnabled()) {
    return;
  }
  if (!devMailTokenBannerLogged) {
    devMailTokenBannerLogged = true;
    logStructured(
      "warn",
      "identity",
      "APZHUB_AUTH_DEV_LOG_EMAIL_TOKENS is ACTIVE — raw email tokens will be logged to stdout; NEVER enable in production",
      {},
    );
  }
  logStructured("warn", "identity", `dev ${kind} token (dev-only)`, {
    correlationId: fields.correlationId,
    rawToken: fields.rawToken,
  });
}
