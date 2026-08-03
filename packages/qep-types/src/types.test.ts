import { describe, expect, it } from "vitest";
import {
  QEP_MODULE_IDS,
  QEP_MODULES,
  QEP_PRODUCT_ID,
  QEP_PRODUCT_NAME,
  QEP_TYPES_VERSION,
} from "./index";

describe("@apzhub/qep-types", () => {
  it("exports foundation version and product identity", () => {
    expect(QEP_TYPES_VERSION).toBe("0.1.0");
    expect(QEP_PRODUCT_ID).toBe("apzqep");
    expect(QEP_PRODUCT_NAME).toBe("APZ QEP");
  });

  it("registers all 22 product modules with catalogue statuses", () => {
    expect(QEP_MODULE_IDS).toHaveLength(22);
    expect(QEP_MODULES).toHaveLength(22);
    const automation = QEP_MODULES.find((m) => m.id === "M07");
    expect(automation?.status).toBe("enabled");
    expect(automation?.title).toBe("Enterprise Automation");
    const scm = QEP_MODULES.find((m) => m.id === "M19");
    expect(scm?.status).toBe("enabled");
    expect(scm?.title).toBe("Enterprise Source Control");
    expect(
      QEP_MODULES.every((m) =>
        m.id === "M07" || m.id === "M19" ? m.status === "enabled" : m.status === "stub",
      ),
    ).toBe(true);
  });
});
