import { config as loadEnv } from "dotenv";
import type { NextConfig } from "next";
import path from "node:path";

import { withSecurityHeaders } from "./lib/security-headers";

loadEnv({ path: path.resolve(__dirname, "../../.env") });

const nextConfig: NextConfig = withSecurityHeaders({
  transpilePackages: [
    "@apzhub/activity-timeline-framework",
    "@apzhub/auth",
    "@apzhub/command-framework",
    "@apzhub/config",
    "@apzhub/event-notification-framework",
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
  serverExternalPackages: ["pg", "ioredis"],
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
