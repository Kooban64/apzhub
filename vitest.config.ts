import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

const componentCoverageInclude = ["packages/ui/src/components/**/*.{ts,tsx}"];
const unitCoverageInclude = [
  "packages/**/src/**/*.{ts,tsx}",
  "integrations/**/src/**/*.{ts,tsx}",
  "packages/platform-runtime/src/**/*.ts",
  "packages/legal-business-core/src/**/*.ts",
];

const coverageExclude = [
  "**/*.test.{ts,tsx}",
  "**/*.stories.tsx",
  "**/index.ts",
  "packages/auth/src/server.ts",
  "packages/auth/src/session.ts",
  "packages/config/src/db/**",
  "packages/auth/src/client.ts",
  "packages/auth/src/provider.tsx",
  "packages/shared/src/redis.ts",
  "packages/platform-runtime/src/**/index.ts",
  "packages/platform-runtime/src/**/types.ts",
  "packages/workbench-framework/src/**/index.ts",
  "packages/command-framework/src/**/index.ts",
  "packages/knowledge-discovery-framework/src/**/index.ts",
  "packages/event-notification-framework/src/**/index.ts",
  "packages/platform-runtime/src/bootstrap-engine/**",
];

const packageAliases = {
  "@": path.resolve(__dirname, "apps/web"),
  "@apzhub/ui": path.resolve(__dirname, "packages/ui/src/index.ts"),
  "@apzhub/types": path.resolve(__dirname, "packages/types/src/index.ts"),
  "@apzhub/config/db": path.resolve(__dirname, "packages/config/src/db/index.ts"),
  "@apzhub/config/governance": path.resolve(
    __dirname,
    "packages/config/src/governance/index.ts",
  ),
  "@apzhub/config": path.resolve(__dirname, "packages/config/src/index.ts"),
  "@apzhub/theme": path.resolve(__dirname, "packages/theme/src/index.ts"),
  "@apzhub/auth/server": path.resolve(__dirname, "packages/auth/src/server.ts"),
  "@apzhub/auth/session-policy": path.resolve(
    __dirname,
    "packages/auth/src/session-policy.ts",
  ),
  "@apzhub/auth/session-diagnostics": path.resolve(
    __dirname,
    "packages/auth/src/session-diagnostics.ts",
  ),
  "@apzhub/auth/middleware-session": path.resolve(
    __dirname,
    "packages/auth/src/middleware-session.ts",
  ),
  "@apzhub/auth": path.resolve(__dirname, "packages/auth/src/index.ts"),
  "@apzhub/sdk": path.resolve(__dirname, "packages/sdk/src/index.ts"),
  "@apzhub/workspace": path.resolve(__dirname, "packages/workspace/src/index.ts"),
  "@apzhub/shared": path.resolve(__dirname, "packages/shared/src/index.ts"),
  "@apzhub/platform-runtime/manifest-engine": path.resolve(
    __dirname,
    "packages/platform-runtime/src/manifest-engine/index.ts",
  ),
  "@apzhub/platform-runtime/version-manager": path.resolve(
    __dirname,
    "packages/platform-runtime/src/version-manager/index.ts",
  ),
  "@apzhub/platform-runtime/capability": path.resolve(
    __dirname,
    "packages/platform-runtime/src/capability/index.ts",
  ),
  "@apzhub/platform-runtime/discovery-engine": path.resolve(
    __dirname,
    "packages/platform-runtime/src/discovery-engine/index.ts",
  ),
  "@apzhub/platform-runtime/capability-registry": path.resolve(
    __dirname,
    "packages/platform-runtime/src/capability-registry/index.ts",
  ),
  "@apzhub/platform-runtime/lifecycle-manager": path.resolve(
    __dirname,
    "packages/platform-runtime/src/lifecycle-manager/index.ts",
  ),
  "@apzhub/platform-runtime/dependency-graph": path.resolve(
    __dirname,
    "packages/platform-runtime/src/dependency-graph/index.ts",
  ),
  "@apzhub/platform-runtime/server": path.resolve(
    __dirname,
    "packages/platform-runtime/src/server.ts",
  ),
  "@apzhub/platform-runtime/configuration-manager": path.resolve(
    __dirname,
    "packages/platform-runtime/src/configuration-manager/index.ts",
  ),
  "@apzhub/platform-runtime/health-manager": path.resolve(
    __dirname,
    "packages/platform-runtime/src/health-manager/index.ts",
  ),
  "@apzhub/platform-runtime": path.resolve(
    __dirname,
    "packages/platform-runtime/src/index.ts",
  ),
  "@apzhub/workbench-framework/server": path.resolve(
    __dirname,
    "packages/workbench-framework/src/server.ts",
  ),
  "@apzhub/workbench-framework/react": path.resolve(
    __dirname,
    "packages/workbench-framework/src/react/index.ts",
  ),
  "@apzhub/workbench-framework": path.resolve(
    __dirname,
    "packages/workbench-framework/src/index.ts",
  ),
  "@apzhub/command-framework/server": path.resolve(
    __dirname,
    "packages/command-framework/src/server.ts",
  ),
  "@apzhub/command-framework/react": path.resolve(
    __dirname,
    "packages/command-framework/src/react/index.ts",
  ),
  "@apzhub/command-framework": path.resolve(
    __dirname,
    "packages/command-framework/src/index.ts",
  ),
  "@apzhub/knowledge-discovery-framework/server": path.resolve(
    __dirname,
    "packages/knowledge-discovery-framework/src/server.ts",
  ),
  "@apzhub/knowledge-discovery-framework/react": path.resolve(
    __dirname,
    "packages/knowledge-discovery-framework/src/react/index.ts",
  ),
  "@apzhub/knowledge-discovery-framework": path.resolve(
    __dirname,
    "packages/knowledge-discovery-framework/src/index.ts",
  ),
  "@apzhub/activity-timeline-framework/server": path.resolve(
    __dirname,
    "packages/activity-timeline-framework/src/server.ts",
  ),
  "@apzhub/activity-timeline-framework/react": path.resolve(
    __dirname,
    "packages/activity-timeline-framework/src/react/index.ts",
  ),
  "@apzhub/activity-timeline-framework": path.resolve(
    __dirname,
    "packages/activity-timeline-framework/src/index.ts",
  ),
  "@apzhub/event-notification-framework/server/notification": path.resolve(
    __dirname,
    "packages/event-notification-framework/src/server/notification/index.ts",
  ),
  "@apzhub/event-notification-framework/server/event": path.resolve(
    __dirname,
    "packages/event-notification-framework/src/server/event/index.ts",
  ),
  "@apzhub/event-notification-framework/server": path.resolve(
    __dirname,
    "packages/event-notification-framework/src/server.ts",
  ),
  "@apzhub/event-notification-framework/react": path.resolve(
    __dirname,
    "packages/event-notification-framework/src/react/index.ts",
  ),
  "@apzhub/event-notification-framework": path.resolve(
    __dirname,
    "packages/event-notification-framework/src/index.ts",
  ),
  "@apzhub/legal-business-core": path.resolve(
    __dirname,
    "packages/legal-business-core/src/index.ts",
  ),
  "@apzhub/platform-identity/server": path.resolve(
    __dirname,
    "packages/platform-identity/src/server.ts",
  ),
  "@apzhub/platform-identity/postgres": path.resolve(
    __dirname,
    "packages/platform-identity/src/postgres.ts",
  ),
  "@apzhub/platform-identity": path.resolve(
    __dirname,
    "packages/platform-identity/src/index.ts",
  ),
  "@apzhub/platform-authorization/server": path.resolve(
    __dirname,
    "packages/platform-authorization/src/server.ts",
  ),
  "@apzhub/platform-authorization/postgres": path.resolve(
    __dirname,
    "packages/platform-authorization/src/postgres.ts",
  ),
  "@apzhub/platform-authorization": path.resolve(
    __dirname,
    "packages/platform-authorization/src/index.ts",
  ),
  "@apzhub/platform-personalisation/server": path.resolve(
    __dirname,
    "packages/platform-personalisation/src/server.ts",
  ),
  "@apzhub/platform-personalisation/postgres": path.resolve(
    __dirname,
    "packages/platform-personalisation/src/postgres.ts",
  ),
  "@apzhub/platform-personalisation": path.resolve(
    __dirname,
    "packages/platform-personalisation/src/index.ts",
  ),
  "@apzhub/platform-governance/server": path.resolve(
    __dirname,
    "packages/platform-governance/src/server.ts",
  ),
  "@apzhub/platform-governance/postgres": path.resolve(
    __dirname,
    "packages/platform-governance/src/postgres.ts",
  ),
  "@apzhub/platform-governance": path.resolve(
    __dirname,
    "packages/platform-governance/src/index.ts",
  ),
  "@apzhub/platform-security/server": path.resolve(
    __dirname,
    "packages/platform-security/src/server.ts",
  ),
  "@apzhub/platform-security/headers": path.resolve(
    __dirname,
    "packages/platform-security/src/security-headers-service.ts",
  ),
  "@apzhub/platform-security/traffic": path.resolve(
    __dirname,
    "packages/platform-security/src/traffic-governance/index.ts",
  ),
  "@apzhub/platform-security/traffic-edge": path.resolve(
    __dirname,
    "packages/platform-security/src/traffic-governance/edge.ts",
  ),
  "@apzhub/platform-security": path.resolve(
    __dirname,
    "packages/platform-security/src/index.ts",
  ),
  "@apzhub/platform-bootstrap/server": path.resolve(
    __dirname,
    "packages/platform-bootstrap/src/server.ts",
  ),
  "@apzhub/platform-bootstrap/diagnostics": path.resolve(
    __dirname,
    "packages/platform-bootstrap/src/diagnostics.ts",
  ),
  "@apzhub/platform-bootstrap": path.resolve(
    __dirname,
    "packages/platform-bootstrap/src/index.ts",
  ),
  "@apzhub/platform-lifecycle/server": path.resolve(
    __dirname,
    "packages/platform-lifecycle/src/server.ts",
  ),
  "@apzhub/platform-lifecycle": path.resolve(
    __dirname,
    "packages/platform-lifecycle/src/index.ts",
  ),
  "@apzhub/platform-operations/server": path.resolve(
    __dirname,
    "packages/platform-operations/src/server.ts",
  ),
  "@apzhub/platform-operations": path.resolve(
    __dirname,
    "packages/platform-operations/src/index.ts",
  ),
  "@apzhub/integration-sdk/client": path.resolve(
    __dirname,
    "packages/integration-sdk/src/client/index.ts",
  ),
  "@apzhub/integration-sdk/adapter": path.resolve(
    __dirname,
    "packages/integration-sdk/src/adapter/index.ts",
  ),
  "@apzhub/integration-sdk/diagnostics": path.resolve(
    __dirname,
    "packages/integration-sdk/src/diagnostics/index.ts",
  ),
  "@apzhub/integration-sdk/lifecycle": path.resolve(
    __dirname,
    "packages/integration-sdk/src/lifecycle/index.ts",
  ),
  "@apzhub/integration-sdk/errors": path.resolve(
    __dirname,
    "packages/integration-sdk/src/errors/index.ts",
  ),
  "@apzhub/integration-sdk/auth": path.resolve(
    __dirname,
    "packages/integration-sdk/src/auth/index.ts",
  ),
  "@apzhub/integration-sdk/connection": path.resolve(
    __dirname,
    "packages/integration-sdk/src/connection/index.ts",
  ),
  "@apzhub/integration-sdk/health": path.resolve(
    __dirname,
    "packages/integration-sdk/src/health/index.ts",
  ),
  "@apzhub/integration-sdk/version": path.resolve(
    __dirname,
    "packages/integration-sdk/src/version/index.ts",
  ),
  "@apzhub/integration-sdk/resilience": path.resolve(
    __dirname,
    "packages/integration-sdk/src/resilience/index.ts",
  ),
  "@apzhub/integration-sdk/observability": path.resolve(
    __dirname,
    "packages/integration-sdk/src/observability/index.ts",
  ),
  "@apzhub/integration-sdk/transport": path.resolve(
    __dirname,
    "packages/integration-sdk/src/transport/index.ts",
  ),
  "@apzhub/integration-sdk/mapping": path.resolve(
    __dirname,
    "packages/integration-sdk/src/mapping/index.ts",
  ),
  "@apzhub/integration-sdk/events": path.resolve(
    __dirname,
    "packages/integration-sdk/src/events/index.ts",
  ),
  "@apzhub/integration-sdk/harness": path.resolve(
    __dirname,
    "packages/integration-sdk/src/harness/index.ts",
  ),
  "@apzhub/integration-sdk$": path.resolve(
    __dirname,
    "packages/integration-sdk/src/index.ts",
  ),
  "@apzhub/integration-sdk": path.resolve(
    __dirname,
    "packages/integration-sdk/src/index.ts",
  ),
  "@apzhub/law-platform/api": path.resolve(
    __dirname,
    "apps/law-platform/lib/api/index.ts",
  ),
  "@apzhub/integration-plane": path.resolve(
    __dirname,
    "integrations/plane/src/index.ts",
  ),
  "@apzhub/integration-zammad": path.resolve(
    __dirname,
    "integrations/zammad/src/index.ts",
  ),
  "@apzhub/integration-github-actions": path.resolve(
    __dirname,
    "integrations/github-actions/src/index.ts",
  ),
  "@apzhub/integration-meilisearch": path.resolve(
    __dirname,
    "integrations/meilisearch/src/index.ts",
  ),
  "@apzhub/platform-service-contracts": path.resolve(
    __dirname,
    "packages/platform-service-contracts/src/index.ts",
  ),
  "@apzhub/platform-services": path.resolve(
    __dirname,
    "packages/platform-services/src/index.ts",
  ),
  "@apzhub/platform-services/testing": path.resolve(
    __dirname,
    "packages/platform-services/src/testing/index.ts",
  ),
  "@apzhub/testing-contracts": path.resolve(
    __dirname,
    "packages/testing-contracts/src/index.ts",
  ),
  "@apzhub/testing-foundation": path.resolve(
    __dirname,
    "packages/testing-foundation/src/index.ts",
  ),
  "@apzhub/testing-persistence": path.resolve(
    __dirname,
    "packages/testing-persistence/src/index.ts",
  ),
  "@apzhub/testing-services": path.resolve(
    __dirname,
    "packages/testing-services/src/index.ts",
  ),
  "@apzhub/reporting-contracts": path.resolve(
    __dirname,
    "packages/reporting-contracts/src/index.ts",
  ),
  "@apzhub/reporting-core": path.resolve(
    __dirname,
    "packages/reporting-core/src/index.ts",
  ),
  "@apzhub/document-contracts": path.resolve(
    __dirname,
    "packages/document-contracts/src/index.ts",
  ),
  "@apzhub/document-core": path.resolve(
    __dirname,
    "packages/document-core/src/index.ts",
  ),
  "@apzhub/document-persistence": path.resolve(
    __dirname,
    "packages/document-persistence/src/index.ts",
  ),
  "@apzhub/document-storage": path.resolve(
    __dirname,
    "packages/document-storage/src/index.ts",
  ),
  "@apzhub/search-contracts": path.resolve(
    __dirname,
    "packages/search-contracts/src/index.ts",
  ),
  "@apzhub/search-persistence": path.resolve(
    __dirname,
    "packages/search-persistence/src/index.ts",
  ),
  "@apzhub/integration-search-sdk/adapter": path.resolve(
    __dirname,
    "packages/integration-search-sdk/src/adapter/index.ts",
  ),
  "@apzhub/integration-search-sdk/capabilities": path.resolve(
    __dirname,
    "packages/integration-search-sdk/src/capabilities/index.ts",
  ),
  "@apzhub/integration-search-sdk/errors": path.resolve(
    __dirname,
    "packages/integration-search-sdk/src/errors/index.ts",
  ),
  "@apzhub/integration-search-sdk/health": path.resolve(
    __dirname,
    "packages/integration-search-sdk/src/health/index.ts",
  ),
  "@apzhub/integration-search-sdk/diagnostics": path.resolve(
    __dirname,
    "packages/integration-search-sdk/src/diagnostics/index.ts",
  ),
  "@apzhub/integration-search-sdk/testing": path.resolve(
    __dirname,
    "packages/integration-search-sdk/src/testing/index.ts",
  ),
  "@apzhub/integration-search-sdk$": path.resolve(
    __dirname,
    "packages/integration-search-sdk/src/index.ts",
  ),
  "@apzhub/integration-search-sdk": path.resolve(
    __dirname,
    "packages/integration-search-sdk/src/index.ts",
  ),
  // Allow testing/ root tests (e.g. testing/support-vertical/) to import next/server
  // without being inside apps/web where Next.js is installed.
  "next/server": path.resolve(__dirname, "apps/web/node_modules/next/server.js"),
  next: path.resolve(__dirname, "apps/web/node_modules/next"),
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
    alias: packageAliases,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./testing/fixtures/vitest.setup.ts"],
    include: [
      "packages/**/*.test.{ts,tsx}",
      "apps/**/*.test.{ts,tsx}",
      "integrations/**/*.test.{ts,tsx}",
      "testing/wave1/**/*.test.{ts,tsx}",
      "testing/wave2/**/*.test.{ts,tsx}",
      "testing/support-vertical/**/*.test.{ts,tsx}",
      "testing/sdk-v1/**/*.test.{ts,tsx}",
      "testing/reporting-vertical/**/*.test.{ts,tsx}",
      "testing/document-foundation/**/*.test.{ts,tsx}",
      "testing/document-vertical/**/*.test.{ts,tsx}",
      "testing/search-foundation/**/*.test.{ts,tsx}",
      "testing/search-vertical/**/*.test.{ts,tsx}",
      "packages/platform-runtime/src/**/*.test.ts",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: unitCoverageInclude,
      exclude: coverageExclude,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
        "packages/platform-runtime/src/dependency-graph/**": {
          lines: 100,
          functions: 100,
          branches: 85,
          statements: 100,
        },
        "packages/platform-runtime/src/capability/**": {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
        "packages/platform-runtime/src/discovery-engine/**": {
          lines: 88,
          functions: 90,
          branches: 83,
          statements: 88,
        },
        "packages/platform-runtime/src/capability-registry/**": {
          lines: 94,
          functions: 94,
          branches: 88,
          statements: 94,
        },
        "packages/platform-runtime/src/lifecycle-manager/**": {
          lines: 100,
          functions: 100,
          branches: 95,
          statements: 100,
        },
        "packages/platform-runtime/src/runtime-orchestrator/**": {
          lines: 85,
          functions: 95,
          branches: 85,
          statements: 85,
        },
        "packages/platform-runtime/src/configuration-manager/**": {
          lines: 99,
          functions: 100,
          branches: 93,
          statements: 99,
        },
        "packages/platform-runtime/src/health-manager/**": {
          lines: 100,
          functions: 100,
          branches: 95,
          statements: 100,
        },
        "packages/workbench-framework/src/**": {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
        "packages/command-framework/src/registry/**": {
          lines: 85,
          functions: 85,
          branches: 85,
          statements: 85,
        },
        "packages/command-framework/src/**": {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
        "packages/knowledge-discovery-framework/src/registry/**": {
          lines: 85,
          functions: 85,
          branches: 85,
          statements: 85,
        },
        "packages/knowledge-discovery-framework/src/**": {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
        "packages/event-notification-framework/src/**": {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
        "packages/activity-timeline-framework/src/**": {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
        "apps/web/lib/api/v1/handlers/search.ts": {
          lines: 90,
          functions: 90,
          branches: 80,
          statements: 90,
        },
        "apps/web/lib/search/**": {
          lines: 85,
          functions: 85,
          branches: 60,
          statements: 85,
        },
        "apps/web/components/search/**": {
          lines: 75,
          functions: 85,
          branches: 65,
          statements: 75,
        },
      },
    },
  },
});

export { componentCoverageInclude, coverageExclude };
