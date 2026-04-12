import { z } from "zod";

export const adminHealthSubsystemStatusSchema = z.enum(["ok", "degraded", "down", "unknown"]);

export type AdminHealthSubsystemStatus = z.infer<typeof adminHealthSubsystemStatusSchema>;

export const adminHealthSubsystemRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: adminHealthSubsystemStatusSchema,
  detail: z.string(),
  since: z.string().optional(),
});

export type AdminHealthSubsystemRow = z.infer<typeof adminHealthSubsystemRowSchema>;

export const adminHealthStripSchema = z.object({
  overall: adminHealthSubsystemStatusSchema,
  headline: z.string(),
  subsystems: z.array(adminHealthSubsystemRowSchema),
});

export type AdminHealthStrip = z.infer<typeof adminHealthStripSchema>;
