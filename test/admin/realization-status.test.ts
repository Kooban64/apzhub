import { describe, expect, it } from "vitest";

import { adminMatrixModelSchema } from "@/lib/admin/access/matrix";
import {
  REALIZATION_PILL_TONE,
  REALIZATION_STATUS_LABELS,
  accessRealizationStatusSchema,
  realizationStatusSeverity,
} from "@/lib/admin/access/realization-status";
import { adminUserAccessDetailSchema } from "@/lib/admin/access/user-access-inspector";
import { matrixCellSelectionInspectorStatus } from "@/lib/admin/admin-inspector-selection";
import { getMockAccessData } from "@/lib/admin/mock-access-data";

describe("access realization vocabulary", () => {
  it("parses every canonical value", () => {
    for (const v of accessRealizationStatusSchema.options) {
      expect(accessRealizationStatusSchema.parse(v)).toBe(v);
    }
  });

  it("exposes label and pill tone for every status (no UI drift)", () => {
    for (const v of accessRealizationStatusSchema.options) {
      expect(REALIZATION_STATUS_LABELS[v].length).toBeGreaterThan(0);
      expect(REALIZATION_PILL_TONE[v].length).toBeGreaterThan(0);
    }
  });

  it("ranks failed worse than manual_action and provisioned", () => {
    expect(realizationStatusSeverity("failed")).toBeGreaterThan(realizationStatusSeverity("manual_action"));
    expect(realizationStatusSeverity("manual_action")).toBeGreaterThan(realizationStatusSeverity("suspended"));
    expect(realizationStatusSeverity("pending")).toBeGreaterThan(realizationStatusSeverity("provisioned"));
  });

  it("matrixCellSelectionInspectorStatus treats risk realizations as blocked", () => {
    expect(matrixCellSelectionInspectorStatus("provisioned")).toBe("active");
    expect(matrixCellSelectionInspectorStatus("pending")).toBe("active");
    expect(matrixCellSelectionInspectorStatus("not_assigned")).toBe("active");
    expect(matrixCellSelectionInspectorStatus("failed")).toBe("blocked");
    expect(matrixCellSelectionInspectorStatus("manual_action")).toBe("blocked");
    expect(matrixCellSelectionInspectorStatus("suspended")).toBe("blocked");
    expect(matrixCellSelectionInspectorStatus("revoked")).toBe("blocked");
  });

  it("mock matrix and inspector lines use only canonical realization values", () => {
    const bundle = getMockAccessData();
    adminMatrixModelSchema.parse(bundle.matrix);
    for (const c of bundle.matrix.cells) {
      if (c.realizationStatus) {
        expect(accessRealizationStatusSchema.safeParse(c.realizationStatus).success).toBe(true);
      }
    }
    for (const u of bundle.directory.users) {
      const detail = bundle.userAccessByUserId[u.id];
      if (!detail) {
        continue;
      }
      const parsed = adminUserAccessDetailSchema.parse(detail);
      for (const line of parsed.serviceAccess) {
        expect(accessRealizationStatusSchema.safeParse(line.realizationStatus).success).toBe(true);
      }
    }
  });
});
