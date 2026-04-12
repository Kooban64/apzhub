import { describe, expect, it } from "vitest";

import { adminBundleDetailSchema, adminBundleListSchema } from "@/lib/admin/access/bundles";
import { adminMatrixModelSchema } from "@/lib/admin/access/matrix";
import { adminServiceDetailSchema, adminServiceListSchema } from "@/lib/admin/access/services";
import { adminUserAccessDetailSchema } from "@/lib/admin/access/user-access-inspector";
import { adminUserDirectorySchema } from "@/lib/admin/access/user-directory";
import { getMockAccessData } from "@/lib/admin/mock-access-data";

describe("access control contracts", () => {
  it("parses mock access bundle", () => {
    const bundle = getMockAccessData();
    expect(adminUserDirectorySchema.parse(bundle.directory)).toEqual(bundle.directory);
    expect(adminMatrixModelSchema.parse(bundle.matrix)).toEqual(bundle.matrix);
    expect(adminBundleListSchema.parse(bundle.bundles)).toEqual(bundle.bundles);
    expect(adminServiceListSchema.parse(bundle.services)).toEqual(bundle.services);
    for (const u of bundle.directory.users) {
      expect(adminUserAccessDetailSchema.parse(bundle.userAccessByUserId[u.id])).toEqual(
        bundle.userAccessByUserId[u.id],
      );
    }
    for (const b of bundle.bundles.bundles) {
      expect(adminBundleDetailSchema.parse(bundle.bundleDetailsById[b.id])).toEqual(bundle.bundleDetailsById[b.id]);
    }
    for (const s of bundle.services.services) {
      expect(adminServiceDetailSchema.parse(bundle.serviceDetailsById[s.id])).toEqual(
        bundle.serviceDetailsById[s.id],
      );
    }
  });
});
