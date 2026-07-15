export type CspAppProfile = "web" | "law-platform";

export type CspDeliveryMode = "report-only" | "enforced";

export type CspDirectiveName =
  | "default-src"
  | "script-src"
  | "style-src"
  | "img-src"
  | "font-src"
  | "connect-src"
  | "object-src"
  | "base-uri"
  | "form-action"
  | "frame-ancestors"
  | "worker-src";

export interface CspPolicyBuildInput {
  readonly app: CspAppProfile;
  readonly isProduction: boolean;
  readonly reportUri: string;
}

export interface CspPolicyResult {
  readonly mode: CspDeliveryMode;
  readonly headerKey: "Content-Security-Policy" | "Content-Security-Policy-Report-Only";
  readonly policy: string;
  readonly directives: Readonly<Record<CspDirectiveName, string>>;
}

export interface CspViolationReportBody {
  readonly "csp-report"?: Record<string, unknown>;
  readonly type?: string;
  readonly body?: Record<string, unknown>;
}

export interface CspViolationRecord {
  readonly id: string;
  readonly receivedAt: string;
  readonly app: CspAppProfile;
  readonly documentUri?: string;
  readonly violatedDirective?: string;
  readonly effectiveDirective?: string;
  readonly blockedUri?: string;
  readonly sourceFile?: string;
  readonly lineNumber?: number;
  readonly columnNumber?: number;
  readonly disposition?: string;
}

export interface CspViolationDiagnostics {
  readonly reportEndpoint: string;
  readonly mode: CspDeliveryMode;
  readonly totalReports: number;
  readonly rejectedReports: number;
  readonly byDirective: Readonly<Record<string, number>>;
  readonly recent: readonly CspViolationRecord[];
}

export interface CspSecurityDiagnostics {
  readonly mode: CspDeliveryMode;
  readonly appProfile: CspAppProfile;
  readonly reportUri: string;
  readonly enforcedDirectives: readonly CspDirectiveName[];
  readonly violations: CspViolationDiagnostics;
}
