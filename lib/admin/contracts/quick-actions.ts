import { z } from "zod";

export const adminQuickActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string().optional(),
  disabled: z.boolean(),
  disabledReason: z.string().optional(),
});

export type AdminQuickAction = z.infer<typeof adminQuickActionSchema>;

export const adminQuickActionsSchema = z.object({
  actions: z.array(adminQuickActionSchema),
});

export type AdminQuickActions = z.infer<typeof adminQuickActionsSchema>;
