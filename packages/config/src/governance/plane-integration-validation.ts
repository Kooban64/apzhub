import type { PlatformEnv } from "./schema";
import type { ConfigValidationIssue } from "./types";

export function validatePlaneIntegrationConfig(
  env: Pick<
    PlatformEnv,
    | "PLANE_INTEGRATION_ENABLED"
    | "PLANE_BASE_URL"
    | "PLANE_API_BASE_URL"
    | "PLANE_API_TOKEN"
    | "PLANE_WORKSPACE_ID"
    | "PLANE_WEBHOOK_SECRET"
  >,
): ConfigValidationIssue[] {
  if (!env.PLANE_INTEGRATION_ENABLED) {
    return [
      {
        key: "PLANE_INTEGRATION_ENABLED",
        severity: "pass",
        message: "Plane integration disabled",
        code: "plane_integration_disabled",
      },
    ];
  }

  const issues: ConfigValidationIssue[] = [
    {
      key: "PLANE_INTEGRATION_ENABLED",
      severity: "pass",
      message: "Plane integration enabled",
      code: "plane_integration_enabled",
    },
  ];

  const requireField = (
    key: keyof PlatformEnv,
    present: boolean,
    message: string,
  ): void => {
    issues.push({
      key: String(key),
      severity: present ? "pass" : "fail",
      message,
      code: present ? "plane_config_ok" : "plane_config_missing",
    });
  };

  requireField(
    "PLANE_BASE_URL",
    Boolean(env.PLANE_BASE_URL),
    env.PLANE_BASE_URL ? "Plane base URL configured" : "PLANE_BASE_URL required when integration enabled",
  );
  requireField(
    "PLANE_API_BASE_URL",
    Boolean(env.PLANE_API_BASE_URL),
    env.PLANE_API_BASE_URL
      ? "Plane API base URL configured"
      : "PLANE_API_BASE_URL required when integration enabled",
  );
  requireField(
    "PLANE_API_TOKEN",
    Boolean(env.PLANE_API_TOKEN),
    env.PLANE_API_TOKEN ? "Plane API token present" : "PLANE_API_TOKEN required when integration enabled",
  );

  if (env.PLANE_API_TOKEN && env.PLANE_API_TOKEN.length < 16) {
    issues.push({
      key: "PLANE_API_TOKEN",
      severity: "fail",
      message: "Plane API token below minimum length (16)",
      code: "plane_token_weak",
    });
  }

  return issues;
}
