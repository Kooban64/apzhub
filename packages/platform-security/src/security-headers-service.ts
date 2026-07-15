import { HttpSecurityHeaderService } from "./http-security-header-service";
import {
  PLATFORM_SECURITY_HEADERS,
  type SecurityDiagnostics,
  type SecurityHeaderPosture,
} from "./security-types";

export { CspPolicyService, STABLE_ENFORCED_DIRECTIVES } from "./csp-policy-service";
export type { CspAppProfile, CspPolicyBuildInput, CspPolicyResult } from "./csp-types";

export {
  HttpSecurityHeaderService,
  PLATFORM_HTTP_ENDPOINT_SAMPLES,
  withPlatformSecurityHeaders,
} from "./http-security-header-service";

export type {
  HttpHeaderComplianceReport,
  HttpHeaderComplianceItem,
  HttpHeaderEnvironmentDifference,
  HttpSecurityHeaderBuildInput,
  HttpSecurityHeaderEntry,
  HttpSecuritySurface,
} from "./http-security-header-types";

export {
  HTTP_SECURITY_HEADER_NAMES,
} from "./http-security-header-types";

export class SecurityHeadersService {
  private readonly http = new HttpSecurityHeaderService();

  getHeaderPosture(): SecurityHeaderPosture {
    return { ...PLATFORM_SECURITY_HEADERS };
  }

  getPermissionsPolicyValue(): string {
    const record = this.http.buildHeadersRecord({
      app: "web",
      isProduction: process.env.NODE_ENV === "production",
      surface: "page",
    });
    return record["Permissions-Policy"] ?? "";
  }

  buildSecurityDiagnosticsPartial(
    app: "web" | "law-platform" = "web",
  ): Pick<SecurityDiagnostics, "headers" | "httpHeaders"> {
    const isProduction = process.env.NODE_ENV === "production";
    const compliance = this.http.buildComplianceReport({
      app,
      isProduction,
      surface: "page",
    });

    return {
      headers: this.getHeaderPosture(),
      httpHeaders: {
        compliant: compliance.compliant,
        environment: compliance.environment,
        missing: compliance.missing,
        recommendations: compliance.recommendations,
        environmentDifferences: compliance.environmentDifferences,
        etagPolicy: compliance.etagPolicy,
        poweredBySuppressed: compliance.poweredBySuppressed,
      },
    };
  }
}
