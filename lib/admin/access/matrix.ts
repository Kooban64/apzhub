import { z } from "zod";

import { accessSourceVisibilitySchema } from "@/lib/admin/access/access-source-visibility";
import { accessRealizationStatusSchema } from "@/lib/admin/access/realization-status";

export const adminMatrixServiceColumnSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type AdminMatrixServiceColumn = z.infer<typeof adminMatrixServiceColumnSchema>;

export const adminMatrixCellSchema = z.object({
  userId: z.string(),
  serviceId: z.string(),
  effectiveRole: z.string(),
  sourceVisibility: accessSourceVisibilitySchema,
  realizationStatus: accessRealizationStatusSchema.optional(),
  activeJobId: z.string().optional(),
});

export type AdminMatrixCell = z.infer<typeof adminMatrixCellSchema>;

export const adminMatrixModelSchema = z.object({
  services: z.array(adminMatrixServiceColumnSchema),
  cells: z.array(adminMatrixCellSchema),
});

export type AdminMatrixModel = z.infer<typeof adminMatrixModelSchema>;
