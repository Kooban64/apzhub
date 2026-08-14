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

    const enabledIds = new Set(
      QEP_MODULES.filter((m) => m.status === "enabled").map((m) => m.id),
    );
    expect(enabledIds).toEqual(
      new Set([
        "M01",
        "M02",
        "M03",
        "M04",
        "M06",
        "M07",
        "M08",
        "M09",
        "M10",
        "M12",
        "M13",
        "M14",
        "M15",
        "M19",
      ]),
    );
    expect(
      QEP_MODULES.every(
        (m) => m.status === "enabled" || m.status === "stub" || m.status === "planned",
      ),
    ).toBe(true);
  });
});
