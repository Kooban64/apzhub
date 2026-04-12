import { z } from "zod";

import { adminBundleDetailSchema, adminBundleListSchema } from "@/lib/admin/access/bundles";
import { adminMatrixModelSchema } from "@/lib/admin/access/matrix";
import { adminServiceDetailSchema, adminServiceListSchema } from "@/lib/admin/access/services";
import { adminUserAccessDetailSchema } from "@/lib/admin/access/user-access-inspector";
import { adminUserDirectorySchema } from "@/lib/admin/access/user-directory";

/** Full access bundle for admin + workspace posture (Step 13 file-backed adapter). */
export const adminAccessDataSchema = z.object({
  directory: adminUserDirectorySchema,
  userAccessByUserId: z.record(z.string(), adminUserAccessDetailSchema),
  matrix: adminMatrixModelSchema,
  bundles: adminBundleListSchema,
  bundleDetailsById: z.record(z.string(), adminBundleDetailSchema),
  services: adminServiceListSchema,
  serviceDetailsById: z.record(z.string(), adminServiceDetailSchema),
});

export type AdminAccessDataFromSchema = z.infer<typeof adminAccessDataSchema>;
