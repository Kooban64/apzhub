import { z } from "zod";

import {
  adminModuleIdSchema,
  isAdminModuleEnabled,
  type AdminHomeConfig,
  type AdminModuleId,
} from "@/lib/admin/admin-home-config";

export { adminModuleIdSchema };
export type { AdminModuleId };

export const adminModuleKindSchema = z.enum([
  "health_strip",
  "alert_list",
  "provisioning_queue",
  "quick_actions",
  "audit_snippet",
]);

export type AdminModuleKind = z.infer<typeof adminModuleKindSchema>;

export const adminModuleDataStateSchema = z.enum(["empty", "loading", "ready", "error"]);

export type AdminModuleDataState = z.infer<typeof adminModuleDataStateSchema>;

export const adminModuleSizeHintSchema = z.enum(["sm", "md", "lg"]);

export type AdminModuleSizeHint = z.infer<typeof adminModuleSizeHintSchema>;

export const adminModuleActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  disabled: z.boolean(),
});

export type AdminModuleAction = z.infer<typeof adminModuleActionSchema>;

export const adminModuleDescriptorSchema = z.object({
  id: adminModuleIdSchema,
  kind: adminModuleKindSchema,
  title: z.string(),
  visible: z.boolean(),
  order: z.number().int(),
  sizeHint: adminModuleSizeHintSchema,
  dataState: adminModuleDataStateSchema,
  actions: z.array(adminModuleActionSchema),
});

export type AdminModuleDescriptor = z.infer<typeof adminModuleDescriptorSchema>;

const MODULE_BASE: Record<
  AdminModuleId,
  Pick<AdminModuleDescriptor, "kind" | "title" | "order" | "sizeHint">
> = {
  platform_health: { kind: "health_strip", title: "Platform health", order: 10, sizeHint: "sm" },
  action_required: { kind: "alert_list", title: "Action required", order: 20, sizeHint: "md" },
  provisioning_queue: { kind: "provisioning_queue", title: "Provisioning queue", order: 30, sizeHint: "md" },
  quick_actions: { kind: "quick_actions", title: "Quick actions", order: 40, sizeHint: "sm" },
  audit_recent: { kind: "audit_snippet", title: "Recent audit", order: 50, sizeHint: "md" },
};

export function buildAdminModuleDescriptors(
  config: AdminHomeConfig,
  dataState: AdminModuleDataState = "ready",
): AdminModuleDescriptor[] {
  return (Object.keys(MODULE_BASE) as AdminModuleId[]).map((id) => {
    const base = MODULE_BASE[id];
    return adminModuleDescriptorSchema.parse({
      id,
      kind: base.kind,
      title: base.title,
      order: base.order,
      sizeHint: base.sizeHint,
      visible: isAdminModuleEnabled(config, id),
      dataState,
      actions: [],
    });
  });
}
