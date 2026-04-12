import { z } from "zod";

export const adminServiceRoleMappingSchema = z.object({
  roleId: z.string(),
  roleLabel: z.string(),
});

export type AdminServiceRoleMapping = z.infer<typeof adminServiceRoleMappingSchema>;

export const adminServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  internalExternal: z.enum(["internal", "external"]),
  authType: z.string(),
  provisioningType: z.string(),
  healthStatus: z.enum(["ok", "degraded", "down"]),
  healthDetail: z.string(),
});

export type AdminService = z.infer<typeof adminServiceSchema>;

export const adminServiceDetailSchema = adminServiceSchema.extend({
  roleMappings: z.array(adminServiceRoleMappingSchema),
});

export type AdminServiceDetail = z.infer<typeof adminServiceDetailSchema>;

export const adminServiceListSchema = z.object({
  services: z.array(adminServiceSchema),
});

export type AdminServiceList = z.infer<typeof adminServiceListSchema>;
