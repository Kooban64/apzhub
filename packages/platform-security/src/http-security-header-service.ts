import { CspPolicyService } from "./csp-policy-service";
import type { CspAppProfile } from "./csp-types";
import {
  HTTP_SECURITY_HEADER_NAMES,
  type HttpHeaderComplianceReport,
  type HttpHeaderEnvironmentDifference,
  type HttpSecurityHeaderBuildInput,
  type HttpSecurityHeaderEntry,
  type HttpSecuritySurface,
} from "./http-security-header-types";

const PERMISSIONS_POLICY_VALUE = [
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "payment=()",
  "usb=()",
].join(", ");

const API_CACHE_CONTROL = "no-store, no-cache, must-revalidate, private";
const ETAG_POLICY =
  "ETag permitted on versioned Law API resource responses; platform does not emit weak ETags on health or diagnostics.";

export const PLATFORM_HTTP_ENDPOINT_SAMPLES: readonly {
  readonly path: string;
  readonly surface: HttpSecuritySurface;
  readonly app: CspAppProfile;
}[] = [
  { path: "/api/health", surface: "health", app: "web" },
  { path: "/api/platform/v1/system/health", surface: "health", app: "web" },
  { path: "/api/platform/v1/system/liveness", surface: "health", app: "web" },
  { path: "/api/platform/v1/system/readiness", surface: "health", app: "web" },
  { path: "/api/platform/v1/security/diagnostics", surface: "diagnostics", app: "web" },
  { path: "/api/platform/v1/security/csp-report", surface: "api", app: "web" },
  { path: "/api/law/v1/health", surface: "health", app: "web" },
  { path: "/api/law/v1/diagnostics", surface: "diagnostics", app: "web" },
  { path: "/api/law/v1/openapi.json", surface: "swagger", app: "web" },
  { path: "/api/law/v1/clients", surface: "api", app: "web" },
  { path: "/api/platform/v1/tenants", surface: "api", app: "web" },
  { path: "/docs", surface: "swagger", app: "web" },
  { path: "/login", surface: "page", app: "web" },
  { path: "/api/health", surface: "health", app: "law-platform" },
  { path: "/api/law/v1/matters", surface: "api", app: "law-platform" },
  { path: "/api/platform/v1/security/csp-report", surface: "api", app: "law-platform" },
  { path: "/workspace/home", surface: "page", app: "law-platform" },
];

export class HttpSecurityHeaderService {
  private readonly cspPolicy = new CspPolicyService();

  buildHeaderEntries(input: HttpSecurityHeaderBuildInput): HttpSecurityHeaderEntry[] {
    const surface = input.surface ?? "page";
    const reportUri = input.cspReportUri ?? "/api/platform/v1/security/csp-report";
    const csp = this.cspPolicy.buildPolicy({
      app: input.app,
      isProduction: input.isProduction,
      reportUri,
    });

    const headers: HttpSecurityHeaderEntry[] = [
      { key: HTTP_SECURITY_HEADER_NAMES.xFrameOptions, value: "DENY" },
      { key: HTTP_SECURITY_HEADER_NAMES.xContentTypeOptions, value: "nosniff" },
      {
        key: HTTP_SECURITY_HEADER_NAMES.referrerPolicy,
        value: "strict-origin-when-cross-origin",
      },
      { key: HTTP_SECURITY_HEADER_NAMES.permissionsPolicy, value: PERMISSIONS_POLICY_VALUE },
      {
        key: HTTP_SECURITY_HEADER_NAMES.crossOriginOpenerPolicy,
        value: "same-origin-allow-popups",
      },
      {
        key: HTTP_SECURITY_HEADER_NAMES.crossOriginResourcePolicy,
        value: "same-site",
      },
      {
        key: HTTP_SECURITY_HEADER_NAMES.crossOriginEmbedderPolicy,
        value: "unsafe-none",
      },
      { key: HTTP_SECURITY_HEADER_NAMES.originAgentCluster, value: "?1" },
      { key: csp.headerKey, value: csp.policy },
    ];

    if (input.isProduction) {
      headers.push({
        key: HTTP_SECURITY_HEADER_NAMES.strictTransportSecurity,
        value: "max-age=31536000; includeSubDomains",
      });
    }

    if (this.surfaceRequiresNoStore(surface)) {
      headers.push({
        key: HTTP_SECURITY_HEADER_NAMES.cacheControl,
        value: API_CACHE_CONTROL,
      });
    }

    return headers;
  }

  buildHeadersRecord(input: HttpSecurityHeaderBuildInput): Record<string, string> {
    return Object.fromEntries(
      this.buildHeaderEntries(input).map((entry) => [entry.key, entry.value]),
    );
  }

  applyToHeaders(
    headers: Headers,
    input: HttpSecurityHeaderBuildInput,
  ): Headers {
    for (const entry of this.buildHeaderEntries(input)) {
      headers.set(entry.key, entry.value);
    }
    return headers;
  }

  applyToResponse(response: Response, input: HttpSecurityHeaderBuildInput): Response {
    const headers = new Headers(response.headers);
    this.applyToHeaders(headers, input);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  getApiResponseHeaders(app: CspAppProfile = "web"): Record<string, string> {
    return this.buildHeadersRecord({
      app,
      isProduction: process.env.NODE_ENV === "production",
      surface: "api",
    });
  }

  buildComplianceReport(input: HttpSecurityHeaderBuildInput): HttpHeaderComplianceReport {
    const entries = this.buildHeaderEntries(input);
    const entryMap = new Map(entries.map((entry) => [entry.key.toLowerCase(), entry.value]));
    const surface = input.surface ?? "page";

    const requiredNames = this.getRequiredHeaderNames(input.isProduction);
    const headers = requiredNames.map((name) => {
      const value = entryMap.get(name.toLowerCase());
      return {
        name,
        present: value !== undefined,
        value,
        required: true,
      };
    });

    const cspKey = input.isProduction
      ? HTTP_SECURITY_HEADER_NAMES.contentSecurityPolicy
      : HTTP_SECURITY_HEADER_NAMES.contentSecurityPolicyReportOnly;
    if (!headers.some((item) => item.name === cspKey)) {
      headers.push({
        name: cspKey,
        present: entryMap.has(cspKey.toLowerCase()),
        value: entryMap.get(cspKey.toLowerCase()),
        required: true,
      });
    }

    if (this.surfaceRequiresNoStore(surface)) {
      headers.push({
        name: HTTP_SECURITY_HEADER_NAMES.cacheControl,
        present: entryMap.has(HTTP_SECURITY_HEADER_NAMES.cacheControl.toLowerCase()),
        value: entryMap.get(HTTP_SECURITY_HEADER_NAMES.cacheControl.toLowerCase()),
        required: true,
      });
    }

    const missing = headers.filter((item) => item.required && !item.present).map((item) => item.name);

    return {
      compliant: missing.length === 0,
      environment: input.isProduction ? "production" : "development",
      app: input.app,
      surface,
      headers,
      missing,
      environmentDifferences: this.getEnvironmentDifferences(input.app),
      recommendations: this.getRecommendations(input),
      etagPolicy: ETAG_POLICY,
      poweredBySuppressed: true,
    };
  }

  validateEndpointSamples(app: CspAppProfile): {
    readonly compliant: boolean;
    readonly results: readonly HttpHeaderComplianceReport[];
  } {
    const isProduction = process.env.NODE_ENV === "production";
    const samples = PLATFORM_HTTP_ENDPOINT_SAMPLES.filter((sample) => sample.app === app);
    const results = samples.map((sample) =>
      this.buildComplianceReport({
        app: sample.app,
        isProduction,
        surface: sample.surface,
      }),
    );

    return {
      compliant: results.every((result) => result.compliant),
      results,
    };
  }

  private surfaceRequiresNoStore(surface: HttpSecuritySurface): boolean {
    return surface === "api" || surface === "health" || surface === "diagnostics";
  }

  private getRequiredHeaderNames(isProduction: boolean): string[] {
    const names: string[] = [
      HTTP_SECURITY_HEADER_NAMES.xFrameOptions,
      HTTP_SECURITY_HEADER_NAMES.xContentTypeOptions,
      HTTP_SECURITY_HEADER_NAMES.referrerPolicy,
      HTTP_SECURITY_HEADER_NAMES.permissionsPolicy,
      HTTP_SECURITY_HEADER_NAMES.crossOriginOpenerPolicy,
      HTTP_SECURITY_HEADER_NAMES.crossOriginResourcePolicy,
      HTTP_SECURITY_HEADER_NAMES.crossOriginEmbedderPolicy,
      HTTP_SECURITY_HEADER_NAMES.originAgentCluster,
    ];

    if (isProduction) {
      names.push(HTTP_SECURITY_HEADER_NAMES.strictTransportSecurity);
    }

    return names;
  }

  private getEnvironmentDifferences(app: CspAppProfile): HttpHeaderEnvironmentDifference[] {
    const dev = this.buildHeaderEntries({ app, isProduction: false, surface: "page" });
    const prod = this.buildHeaderEntries({ app, isProduction: true, surface: "page" });
    const devMap = new Map(dev.map((entry) => [entry.key, entry.value]));
    const prodMap = new Map(prod.map((entry) => [entry.key, entry.value]));
    const keys = new Set([...devMap.keys(), ...prodMap.keys()]);

    const differences: HttpHeaderEnvironmentDifference[] = [];
    for (const key of keys) {
      const development = devMap.get(key) ?? "(absent)";
      const production = prodMap.get(key) ?? "(absent)";
      if (development !== production) {
        differences.push({ header: key, development, production });
      }
    }

    return differences;
  }

  private getRecommendations(input: HttpSecurityHeaderBuildInput): string[] {
    const recommendations: string[] = [];

    if (input.surface === "swagger") {
      recommendations.push(
        "Swagger UI requires script/style relaxations inherited from global CSP policy.",
      );
    }

    recommendations.push(
      "Cross-Origin-Embedder-Policy remains unsafe-none for Next.js and Swagger compatibility.",
    );

    if (!input.isProduction) {
      recommendations.push(
        "Development uses CSP Report-Only; production enforces Content-Security-Policy.",
      );
    }

    recommendations.push("Suppress X-Powered-By via Next.js poweredByHeader: false.");

    return recommendations;
  }
}

export interface PlatformNextHeaderRule {
  readonly source: string;
  readonly headers: readonly HttpSecurityHeaderEntry[];
}

export interface PlatformNextHeadersConfig {
  readonly headers?: () => PlatformNextHeaderRule[] | Promise<PlatformNextHeaderRule[]>;
  readonly poweredByHeader?: boolean;
}

export function withPlatformSecurityHeaders<T extends PlatformNextHeadersConfig>(
  config: T,
  options: { readonly app: CspAppProfile },
): T & {
  readonly poweredByHeader: false;
  readonly headers: () => Promise<PlatformNextHeaderRule[]>;
} {
  const service = new HttpSecurityHeaderService();
  const existingHeaders = config.headers;
  const isProduction = process.env.NODE_ENV === "production";

  return {
    ...config,
    poweredByHeader: false,
    async headers() {
      const pageHeaders = service.buildHeaderEntries({
        app: options.app,
        isProduction,
        surface: "page",
      });
      const apiHeaders = service.buildHeaderEntries({
        app: options.app,
        isProduction,
        surface: "api",
      });
      const apiCacheOnly = apiHeaders.filter(
        (entry) => entry.key === HTTP_SECURITY_HEADER_NAMES.cacheControl,
      );

      const existing = existingHeaders ? await existingHeaders() : [];
      const apiRule = {
        source: "/api/:path*",
        headers: [...pageHeaders, ...apiCacheOnly],
      };
      const pageRule = { source: "/(.*)", headers: pageHeaders };

      if (existing.length === 0) {
        return [apiRule, pageRule];
      }

      const merged = existing.map((entry) => ({
        ...entry,
        headers: [...entry.headers, ...pageHeaders],
      }));

      const hasApiRule = merged.some((entry) => entry.source.includes("/api"));
      if (!hasApiRule) {
        merged.unshift(apiRule);
      }

      return merged;
    },
  };
}
