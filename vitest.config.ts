import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vitest/config";

const componentCoverageInclude = ["packages/ui/src/components/**/*.{ts,tsx}"];
const unitCoverageInclude = [
  "packages/**/src/**/*.{ts,tsx}",
  "packages/platform-runtime/src/**/*.ts",
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
  "packages/platform-runtime/src/bootstrap-engine/**",
];

const packageAliases = {
  "@": path.resolve(__dirname, "apps/web"),
  "@apzhub/ui": path.resolve(__dirname, "packages/ui/src/index.ts"),
  "@apzhub/types": path.resolve(__dirname, "packages/types/src/index.ts"),
  "@apzhub/config": path.resolve(__dirname, "packages/config/src/index.ts"),
  "@apzhub/theme": path.resolve(__dirname, "packages/theme/src/index.ts"),
  "@apzhub/auth": path.resolve(__dirname, "packages/auth/src/index.ts"),
  "@apzhub/auth/server": path.resolve(__dirname, "packages/auth/src/server.ts"),
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
          lines: 95,
          functions: 95,
          branches: 88,
          statements: 95,
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
      },
    },
  },
});

export { componentCoverageInclude, coverageExclude };
