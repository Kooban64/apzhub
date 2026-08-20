import { config as loadEnv } from "dotenv";
import type { NextConfig } from "next";
import path from "node:path";

import { withSecurityHeaders } from "./lib/security-headers";

loadEnv({ path: path.resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = withSecurityHeaders({
  // OPS-002 A1 — enables slim production container images (no user-facing behaviour change)
  output: "standalone",
  // Public nginx hostname in front of `next dev` (ENVIRONMENT.md / bring-up).
  allowedDevOrigins: ["apzhub.apzportal.apzor.com", "127.0.0.1", "localhost"],
  transpilePackages: [
    "@apzhub/activity-timeline-framework",
    "@apzhub/auth",
    "@apzhub/command-framework",
    "@apzhub/config",
    "@apzhub/event-notification-framework",
    "@apzhub/integration-faraday",
    "@apzhub/integration-greenbone",
    "@apzhub/legal-business-core",
    "@apzhub/platform-runtime",
    "@apzhub/shared",
    "@apzhub/knowledge-discovery-framework",
    "@apzhub/theme",
    "@apzhub/types",
    "@apzhub/ui",
    "@apzhub/workbench-framework",
    "@apzhub/workspace",
    "swagger-ui-react",
  ],
  typescript: {
    ignoreBuildErrors: false,
  },
  serverExternalPackages: ["pg", "ioredis", "drizzle-orm"],
  async rewrites() {
    return [
      {
        source: "/api/docs",
        destination: "/docs",
      },
    ];
  },
});

export default nextConfig;
