import type { CspAppProfile } from "./csp-types";

export type HttpSecuritySurface =
  "page" | "api" | "health" | "diagnostics" | "swagger" | "static";

export interface HttpSecurityHeaderBuildInput {
  readonly app: CspAppProfile;
  readonly isProduction: boolean;
  readonly surface?: HttpSecuritySurface;
  readonly cspReportUri?: string;
}

export interface HttpSecurityHeaderEntry {
  readonly key: string;
  readonly value: string;
}

export interface HttpHeaderComplianceItem {
  readonly name: string;
  readonly present: boolean;
  readonly value?: string;
  readonly required: boolean;
}

export interface HttpHeaderEnvironmentDifference {
  readonly header: string;
  readonly development: string;
  readonly production: string;
}

export interface HttpHeaderComplianceReport {
  readonly compliant: boolean;
  readonly environment: string;
  readonly app: CspAppProfile;
  readonly surface: HttpSecuritySurface;
  readonly headers: readonly HttpHeaderComplianceItem[];
  readonly missing: readonly string[];
  readonly environmentDifferences: readonly HttpHeaderEnvironmentDifference[];
  readonly recommendations: readonly string[];
  readonly etagPolicy: string;
  readonly poweredBySuppressed: boolean;
}

export const HTTP_SECURITY_HEADER_NAMES = {
  strictTransportSecurity: "Strict-Transport-Security",
  referrerPolicy: "Referrer-Policy",
  permissionsPolicy: "Permissions-Policy",
  xContentTypeOptions: "X-Content-Type-Options",
  xFrameOptions: "X-Frame-Options",
  crossOriginEmbedderPolicy: "Cross-Origin-Embedder-Policy",
  crossOriginOpenerPolicy: "Cross-Origin-Opener-Policy",
  crossOriginResourcePolicy: "Cross-Origin-Resource-Policy",
  originAgentCluster: "Origin-Agent-Cluster",
  cacheControl: "Cache-Control",
  contentSecurityPolicy: "Content-Security-Policy",
  contentSecurityPolicyReportOnly: "Content-Security-Policy-Report-Only",
} as const;
