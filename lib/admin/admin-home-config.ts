import { z } from "zod";

export const adminModuleIdSchema = z.enum([
  "platform_health",
  "action_required",
  "provisioning_queue",
  "quick_actions",
  "audit_recent",
]);

export type AdminModuleId = z.infer<typeof adminModuleIdSchema>;

export const adminHomeConfigSchema = z.object({
  enabledModules: z.array(adminModuleIdSchema),
});

export type AdminHomeConfig = z.infer<typeof adminHomeConfigSchema>;

export const defaultAdminHomeConfig: AdminHomeConfig = adminHomeConfigSchema.parse({
  enabledModules: [
    "platform_health",
    "action_required",
    "provisioning_queue",
    "quick_actions",
    "audit_recent",
  ],
});

export function isAdminModuleEnabled(config: AdminHomeConfig, id: AdminModuleId): boolean {
  return config.enabledModules.includes(id);
}
