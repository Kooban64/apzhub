import { describe, expect, it } from "vitest";
import {
  QEP_FOUNDATION_VERSION,
  getQepFoundationHealth,
  listQepModuleStubs,
} from "./index";

describe("@apzhub/qep-foundation", () => {
  it("reports foundation ready without business functionality", () => {
    expect(QEP_FOUNDATION_VERSION).toBe("0.1.0");
    const health = getQepFoundationHealth();
    expect(health.status).toBe("foundation_ready");
    expect(health.businessFunctionality).toBe(false);
    expect(health.moduleStubCount).toBe(22);
    expect(listQepModuleStubs()).toHaveLength(22);
  });
});
