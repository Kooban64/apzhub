import { z } from "zod";

import { appThemeIdSchema, densityIdSchema } from "@/lib/theme/appearance-vocabulary";

export const userAppearancePreferencesSchema = z.object({
  themeId: appThemeIdSchema,
  densityId: densityIdSchema,
  /** Reserved for later default landing mode; not applied in Phase 8. */
  defaultMode: z.enum(["workspace", "admin"]).optional(),
});

export type UserAppearancePreferences = z.infer<typeof userAppearancePreferencesSchema>;
