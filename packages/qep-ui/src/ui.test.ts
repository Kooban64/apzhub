import { describe, expect, it } from "vitest";
import { QEP_UI_VERSION, getQepProductLabel } from "./index";

describe("@apzhub/qep-ui", () => {
  it("exports stub UI helpers only", () => {
    expect(QEP_UI_VERSION).toBe("0.1.0");
    expect(getQepProductLabel()).toBe("APZ QEP");
  });
});
