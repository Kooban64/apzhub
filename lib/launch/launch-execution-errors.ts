/**
 * Stable codes for **execution** failures (mint, redirect, misconfiguration).
 * Distinct from `LaunchReasonCode` (policy / readiness gate).
 */
export const LAUNCH_EXECUTION_ERROR_CODES = {
  SESSION_REQUIRED: "SESSION_REQUIRED",
  JWT_SIGNING_MISCONFIGURED: "JWT_SIGNING_MISCONFIGURED",
  LAUNCH_NOT_REAL_MODE: "LAUNCH_NOT_REAL_MODE",
  OIDC_TEMPLATE_INVALID: "OIDC_TEMPLATE_INVALID",
  SERVICE_INVALID: "SERVICE_INVALID",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  /** Internal JWT landing: missing cookie or signing secret on server. */
  JWT_LANDING_NO_SESSION: "JWT_LANDING_NO_SESSION",
  /** Internal JWT landing: signature/exp/iss/aud verification failed. */
  JWT_LANDING_VERIFY_FAILED: "JWT_LANDING_VERIFY_FAILED",
  JWT_LANDING_SERVICE_MISMATCH: "JWT_LANDING_SERVICE_MISMATCH",
  JWT_LANDING_SESSION_REQUIRED: "JWT_LANDING_SESSION_REQUIRED",
  JWT_LANDING_USER_MISMATCH: "JWT_LANDING_USER_MISMATCH",
  JWT_LANDING_SESSION_ROTATED: "JWT_LANDING_SESSION_ROTATED",
  JWT_LANDING_JTI_REUSED: "JWT_LANDING_JTI_REUSED",
} as const;

export type LaunchExecutionErrorCode = (typeof LAUNCH_EXECUTION_ERROR_CODES)[keyof typeof LAUNCH_EXECUTION_ERROR_CODES];

export function launchExecutionUserMessage(code: LaunchExecutionErrorCode): string {
  switch (code) {
    case "SESSION_REQUIRED":
      return "Sign in again to launch this app.";
    case "JWT_SIGNING_MISCONFIGURED":
      return "Launch is temporarily unavailable. Try again later.";
    case "LAUNCH_NOT_REAL_MODE":
      return "This launch path is not enabled in this environment.";
    case "OIDC_TEMPLATE_INVALID":
      return "Single sign-on is not configured correctly yet.";
    case "SERVICE_INVALID":
      return "This service cannot be launched.";
    case "JWT_LANDING_NO_SESSION":
      return "Missing launch session. Start again from the workspace launcher.";
    case "JWT_LANDING_VERIFY_FAILED":
      return "Launch token is invalid or expired. Start again from the launcher.";
    case "JWT_LANDING_SERVICE_MISMATCH":
      return "Service mismatch — do not tamper with launch URLs.";
    case "JWT_LANDING_SESSION_REQUIRED":
      return "Sign in again to confirm this launch.";
    case "JWT_LANDING_USER_MISMATCH":
      return "This launch belongs to a different signed-in user.";
    case "JWT_LANDING_SESSION_ROTATED":
      return "Your session was rotated after this token was minted. Start the launch again.";
    case "JWT_LANDING_JTI_REUSED":
      return "This launch link was already used. Start again from the launcher.";
    default:
      return "Something went wrong starting the app.";
  }
}

export function launchExecutionOperatorMessage(code: LaunchExecutionErrorCode): string {
  switch (code) {
    case "SESSION_REQUIRED":
      return "Active session required for launch mint/start.";
    case "JWT_SIGNING_MISCONFIGURED":
      return "Set APZHUB_LAUNCH_JWT_SIGNING_SECRET when APZHUB_LAUNCH_SOURCE=real for internal JWT.";
    case "LAUNCH_NOT_REAL_MODE":
      return "APZHUB_LAUNCH_SOURCE must be `real` to use the internal JWT mint route.";
    case "OIDC_TEMPLATE_INVALID":
      return "Check APZHUB_LAUNCH_OIDC_URL_TEMPLATE placeholders: {service}, {query}, optional {state}.";
    case "SERVICE_INVALID":
      return "Workspace service id failed validation.";
    case "JWT_LANDING_NO_SESSION":
      return "Landing page: no HttpOnly launch cookie or APZHUB_LAUNCH_JWT_SIGNING_SECRET unset.";
    case "JWT_LANDING_VERIFY_FAILED":
      return "JWT verify failed (sig, exp, iss, aud, or skew).";
    case "JWT_LANDING_SERVICE_MISMATCH":
      return "URL service param does not match token svc claim.";
    case "JWT_LANDING_SESSION_REQUIRED":
      return "Active session required to confirm landing.";
    case "JWT_LANDING_USER_MISMATCH":
      return "Token sub does not match signed-in user id.";
    case "JWT_LANDING_SESSION_ROTATED":
      return "Token sid does not match current authSessionId.";
    case "JWT_LANDING_JTI_REUSED":
      return "Single-use jti replay or duplicate consumption.";
    default:
      return "Unhandled launch execution error.";
  }
}

export function httpStatusForLaunchExecution(code: LaunchExecutionErrorCode): number {
  switch (code) {
    case "SESSION_REQUIRED":
      return 401;
    case "LAUNCH_NOT_REAL_MODE":
      return 400;
    case "SERVICE_INVALID":
    case "JWT_LANDING_NO_SESSION":
    case "JWT_LANDING_VERIFY_FAILED":
    case "JWT_LANDING_SERVICE_MISMATCH":
    case "JWT_LANDING_SESSION_REQUIRED":
    case "JWT_LANDING_USER_MISMATCH":
    case "JWT_LANDING_SESSION_ROTATED":
    case "JWT_LANDING_JTI_REUSED":
      return 400;
    case "JWT_SIGNING_MISCONFIGURED":
    case "OIDC_TEMPLATE_INVALID":
      return 503;
    default:
      return 500;
  }
}
