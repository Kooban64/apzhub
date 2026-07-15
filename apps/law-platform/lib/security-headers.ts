import type { NextConfig } from "next";

import { withPlatformSecurityHeaders } from "@apzhub/platform-security/headers";

export function withSecurityHeaders(config: NextConfig): NextConfig {
  return withPlatformSecurityHeaders(config, { app: "law-platform" }) as NextConfig;
}

/**
 * HTTP security headers — @apzhub/platform-security (PRH-003).
 * Products must not define their own security headers.
 */
