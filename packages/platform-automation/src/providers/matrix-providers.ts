/**
 * F3 deepen — full provider evidence matrix (all active report-ingest / live runners).
 * No placeholder refusals. Vendor branding masked at RC face.
 */

import type { AutomationProvider } from "../contracts/provider";
import { createAccessibilityProvider } from "./accessibility";
import { createReportIngestProvider } from "./ingest/create-report-ingest-provider";
import { normalizeK6Summary } from "./ingest/normalize-k6";
import { normalizeSarifOrFindings } from "./ingest/normalize-sarif";
import { normalizeTestSuiteReport } from "./ingest/normalize-test-report";
import { createPlaywrightProvider } from "./playwright";
import { createVitestProvider } from "./vitest";

/** Empty — retained for enhance-only import compatibility; matrix has no stubs. */
export const PLACEHOLDER_IDS: readonly string[] = [];

export function createPlaceholderProviders(): readonly AutomationProvider[] {
  return [];
}

export function createMatrixProviders(options?: {
  readonly playwrightDryRun?: boolean;
}): readonly AutomationProvider[] {
  return [
    createPlaywrightProvider({
      forceDryRun: options?.playwrightDryRun ?? false,
    }),
    createVitestProvider(),
    createAccessibilityProvider(),
    createReportIngestProvider({
      providerId: "security",
      name: "Security Scan Provider",
      domain: "security",
      capabilities: ["security-ingest", "sarif", "vulnerability-summary"],
      normalize: (payload) => normalizeSarifOrFindings(payload, "Security"),
    }),
    createReportIngestProvider({
      providerId: "codequality",
      name: "Code Quality Provider",
      domain: "code_quality",
      capabilities: ["code-quality-ingest", "sarif", "eslint"],
      normalize: (payload) => normalizeSarifOrFindings(payload, "Code quality"),
    }),
    createReportIngestProvider({
      providerId: "k6",
      name: "Performance Provider",
      domain: "performance",
      capabilities: ["performance-ingest", "k6-summary"],
      normalize: normalizeK6Summary,
    }),
    createReportIngestProvider({
      providerId: "selenium",
      name: "Selenium Provider",
      domain: "automation",
      capabilities: ["ui-automation-ingest"],
      normalize: (payload) => normalizeTestSuiteReport(payload, "Selenium"),
    }),
    createReportIngestProvider({
      providerId: "cypress",
      name: "Cypress Provider",
      domain: "automation",
      capabilities: ["ui-automation-ingest"],
      normalize: (payload) => normalizeTestSuiteReport(payload, "Cypress"),
    }),
    createReportIngestProvider({
      providerId: "appium",
      name: "Appium Provider",
      domain: "automation",
      capabilities: ["mobile-automation-ingest"],
      normalize: (payload) => normalizeTestSuiteReport(payload, "Appium"),
    }),
    createReportIngestProvider({
      providerId: "rest",
      name: "REST / API Provider",
      domain: "automation",
      capabilities: ["api-automation-ingest"],
      normalize: (payload) => normalizeTestSuiteReport(payload, "API"),
    }),
    createReportIngestProvider({
      providerId: "visual",
      name: "Visual Testing Provider",
      domain: "automation",
      capabilities: ["visual-automation-ingest"],
      normalize: (payload) => normalizeTestSuiteReport(payload, "Visual"),
    }),
  ];
}
