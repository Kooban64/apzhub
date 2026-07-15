import { describe, expect, it } from "vitest";

import {
  PLATFORM_REPORT_PERMISSIONS,
  REPORT_OUTPUT_FORMATS,
  REPORTING_CONTRACTS_VERSION,
} from "./index";

describe("@apzhub/reporting-contracts", () => {
  it("exports platform contracts version and formats", () => {
    expect(REPORTING_CONTRACTS_VERSION).toBe("0.1.0");
    expect(REPORT_OUTPUT_FORMATS).toContain("html");
    expect(REPORT_OUTPUT_FORMATS).toHaveLength(6);
    expect(PLATFORM_REPORT_PERMISSIONS).toContain("report.generate");
  });
});
