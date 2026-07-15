import type {
  CspAppProfile,
  CspDirectiveName,
  CspPolicyBuildInput,
  CspPolicyResult,
} from "./csp-types";

export type { CspAppProfile, CspPolicyBuildInput, CspPolicyResult } from "./csp-types";

/** Directives enforced in production after progressive validation (PRH-002 phase 4). */
export const STABLE_ENFORCED_DIRECTIVES: readonly CspDirectiveName[] = [
  "default-src",
  "script-src",
  "style-src",
  "img-src",
  "font-src",
  "connect-src",
  "object-src",
  "base-uri",
  "form-action",
  "frame-ancestors",
  "worker-src",
] as const;

function developmentConnectSrc(app: CspAppProfile): string {
  const base = "'self' ws: wss: http://localhost:* http://127.0.0.1:*";
  if (app === "web") {
    return base;
  }
  return base;
}

function productionConnectSrc(): string {
  return "'self'";
}

export class CspPolicyService {
  buildPolicy(input: CspPolicyBuildInput): CspPolicyResult {
    const connectSrc = input.isProduction
      ? productionConnectSrc()
      : developmentConnectSrc(input.app);

    const directives: Record<CspDirectiveName, string> = {
      "default-src": "'self'",
      "script-src": "'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src": "'self' 'unsafe-inline'",
      "img-src": "'self' data: blob:",
      "font-src": "'self' data:",
      "connect-src": connectSrc,
      "object-src": "'none'",
      "base-uri": "'self'",
      "form-action": "'self'",
      "frame-ancestors": "'none'",
      "worker-src": "'self' blob:",
    };

    const policyParts = [
      ...STABLE_ENFORCED_DIRECTIVES.map((name) => `${name} ${directives[name]}`),
      `report-uri ${input.reportUri}`,
    ];

    const policy = policyParts.join("; ");
    const mode = input.isProduction ? "enforced" : "report-only";
    const headerKey =
      mode === "enforced"
        ? "Content-Security-Policy"
        : "Content-Security-Policy-Report-Only";

    return {
      mode,
      headerKey,
      policy,
      directives,
    };
  }

  getAppProfileFromPort(port: number | undefined): CspAppProfile {
    return port === 3301 ? "law-platform" : "web";
  }
}
