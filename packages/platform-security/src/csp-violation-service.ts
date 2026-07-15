import type {
  CspAppProfile,
  CspViolationDiagnostics,
  CspViolationRecord,
  CspViolationReportBody,
} from "./csp-types";

const MAX_STORED_REPORTS = 200;
const MAX_BODY_BYTES = 4096;

const SENSITIVE_KEYS = new Set([
  "username",
  "password",
  "token",
  "secret",
  "cookie",
  "authorization",
]);

export class CspViolationService {
  private readonly reports: CspViolationRecord[] = [];
  private totalReports = 0;
  private rejectedReports = 0;
  private readonly byDirective = new Map<string, number>();

  ingestReport(
    app: CspAppProfile,
    rawBody: string,
    contentLength: number | null,
  ): { accepted: boolean; reason?: string } {
    if (contentLength !== null && contentLength > MAX_BODY_BYTES) {
      this.rejectedReports += 1;
      return { accepted: false, reason: "payload_too_large" };
    }

    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      this.rejectedReports += 1;
      return { accepted: false, reason: "payload_too_large" };
    }

    let parsed: CspViolationReportBody;
    try {
      parsed = JSON.parse(rawBody) as CspViolationReportBody;
    } catch {
      this.rejectedReports += 1;
      return { accepted: false, reason: "invalid_json" };
    }

    const report = this.normalizeReport(app, parsed);
    if (!report) {
      this.rejectedReports += 1;
      return { accepted: false, reason: "missing_csp_report" };
    }

    this.totalReports += 1;
    this.reports.unshift(report);
    if (this.reports.length > MAX_STORED_REPORTS) {
      this.reports.length = MAX_STORED_REPORTS;
    }

    const directiveKey = report.effectiveDirective ?? report.violatedDirective ?? "unknown";
    this.byDirective.set(directiveKey, (this.byDirective.get(directiveKey) ?? 0) + 1);

    return { accepted: true };
  }

  getDiagnostics(
    reportEndpoint: string,
    mode: "enforced" | "report-only",
  ): CspViolationDiagnostics {
    return {
      reportEndpoint,
      mode,
      totalReports: this.totalReports,
      rejectedReports: this.rejectedReports,
      byDirective: Object.fromEntries(this.byDirective.entries()),
      recent: [...this.reports],
    };
  }

  resetForTests(): void {
    this.reports.length = 0;
    this.totalReports = 0;
    this.rejectedReports = 0;
    this.byDirective.clear();
  }

  private normalizeReport(
    app: CspAppProfile,
    body: CspViolationReportBody,
  ): CspViolationRecord | null {
    const raw =
      body["csp-report"] ??
      (typeof body.body === "object" ? body.body : undefined);

    if (!raw || typeof raw !== "object") {
      return null;
    }

    const sanitized = this.sanitizeReportObject(raw);

    return {
      id: `csp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      receivedAt: new Date().toISOString(),
      app,
      documentUri: asOptionalString(sanitized["document-uri"]),
      violatedDirective: asOptionalString(sanitized["violated-directive"]),
      effectiveDirective: asOptionalString(sanitized["effective-directive"]),
      blockedUri: asOptionalString(sanitized["blocked-uri"]),
      sourceFile: asOptionalString(sanitized["source-file"]),
      lineNumber: asOptionalNumber(sanitized["line-number"]),
      columnNumber: asOptionalNumber(sanitized["column-number"]),
      disposition: asOptionalString(sanitized.disposition),
    };
  }

  private sanitizeReportObject(
    value: Record<string, unknown>,
  ): Record<string, unknown> {
    const output: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        continue;
      }
      output[key] = entry;
    }
    return output;
  }
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asOptionalNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

let sharedCspViolationService: CspViolationService | undefined;

export function getSharedCspViolationService(): CspViolationService {
  if (!sharedCspViolationService) {
    sharedCspViolationService = new CspViolationService();
  }
  return sharedCspViolationService;
}

export function resetSharedCspViolationService(): void {
  sharedCspViolationService?.resetForTests();
  sharedCspViolationService = undefined;
}
