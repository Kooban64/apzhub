import { describe, expect, it } from "vitest";

import {
  ACCESS_SOURCE_LABELS,
  accessSourceVisibilitySchema,
} from "@/lib/admin/access/access-source-visibility";
import { adminMatrixModelSchema } from "@/lib/admin/access/matrix";
import { adminUserAccessDetailSchema } from "@/lib/admin/access/user-access-inspector";
import { getMockAccessData } from "@/lib/admin/mock-access-data";

describe("access source visibility vocabulary", () => {
  it("parses every enum value", () => {
    for (const v of accessSourceVisibilitySchema.options) {
      expect(accessSourceVisibilitySchema.parse(v)).toBe(v);
      expect(ACCESS_SOURCE_LABELS[v]).toBeTruthy();
    }
  });

  it("matrix mock cells use only canonical source visibility", () => {
    const bundle = getMockAccessData();
    const matrix = adminMatrixModelSchema.parse(bundle.matrix);
    for (const c of matrix.cells) {
      expect(accessSourceVisibilitySchema.safeParse(c.sourceVisibility).success).toBe(true);
    }
  });

  it("inspector mock lines use the same source enum", () => {
    const bundle = getMockAccessData();
    for (const u of bundle.directory.users) {
      const detail = bundle.userAccessByUserId[u.id];
      if (!detail) {
        continue;
      }
      const parsed = adminUserAccessDetailSchema.parse(detail);
      for (const line of parsed.serviceAccess) {
        expect(accessSourceVisibilitySchema.safeParse(line.source).success).toBe(true);
      }
    }
  });
});
