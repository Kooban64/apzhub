import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const contentSecurityPolicyReportOnly = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

function buildSecurityHeaders(): { key: string; value: string }[] {
  const headers: { key: string; value: string }[] = [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Content-Security-Policy-Report-Only",
      value: contentSecurityPolicyReportOnly,
    },
  ];

  if (isProduction) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=31536000; includeSubDomains",
    });
  }

  return headers;
}

export function withSecurityHeaders(config: NextConfig): NextConfig {
  const existingHeaders = config.headers;

  return {
    ...config,
    async headers() {
      const securityHeaders = buildSecurityHeaders();
      const existing = existingHeaders ? await existingHeaders() : [];

      if (existing.length === 0) {
        return [{ source: "/(.*)", headers: securityHeaders }];
      }

      return existing.map((entry) => ({
        ...entry,
        headers: [...entry.headers, ...securityHeaders],
      }));
    },
  };
}

/**
 * Future security enhancements (SPR-002+):
 * - Enforce CSP (remove Report-Only) after Next.js inline script audit
 * - Add Permissions-Policy header
 * - CSP violation reporting endpoint
 * - Redis-backed rate limiting on auth routes
 */
