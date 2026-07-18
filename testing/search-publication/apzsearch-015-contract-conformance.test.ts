/**
 * APZSEARCH-015 — Publication contract conformance across all product adapters.
 */
import { describe, expect, it } from "vitest";

import { createProjectsSearchAdapter } from "@apzhub/search-projects";
import { createSupportSearchAdapter } from "@apzhub/search-support";
import { createDocumentsSearchAdapterForTest } from "@apzhub/search-documents";
import { createTestingSearchAdapterForTest } from "@apzhub/search-testing";
import { createReportingSearchAdapterForTest } from "@apzhub/search-reporting";

const OPERATIONS = [
  "publish",
  "update",
  "remove",
  "validate",
  "preview",
  "diagnostics",
  "lifecycle",
  "statistics",
] as const;

describe("APZSEARCH-015 publication contract conformance", () => {
  it.each([
    ["projects", () => createProjectsSearchAdapter().publisher],
    ["support", () => createSupportSearchAdapter().publisher],
    ["documents", () => createDocumentsSearchAdapterForTest().publisher],
    ["testing", () => createTestingSearchAdapterForTest().publisher],
    ["reporting", () => createReportingSearchAdapterForTest().publisher],
  ] as const)(
    "%s publisher exposes all 8 publication operations",
    (_product, factory) => {
      const publisher = factory();
      for (const op of OPERATIONS) {
        expect(typeof publisher[op], op).toBe("function");
        expect(
          op in publisher ||
            typeof (publisher as Record<string, unknown>)[op] === "function",
          `${op} on instance`,
        ).toBe(true);
      }
      const proto = Object.getPrototypeOf(publisher) as Record<string, unknown>;
      for (const op of OPERATIONS) {
        expect(
          typeof proto[op] === "function" || typeof publisher[op] === "function",
          `proto.${op}`,
        ).toBe(true);
      }
    },
  );
});
