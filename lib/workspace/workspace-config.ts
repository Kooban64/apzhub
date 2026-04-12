import { z } from "zod";

export const workspaceModuleIdSchema = z.enum([
  "today_summary",
  "attention",
  "my_work",
  "my_apps",
  "activity",
  "launcher",
]);

export type WorkspaceModuleId = z.infer<typeof workspaceModuleIdSchema>;

export const workspaceServiceIdSchema = z.enum([
  "calendar",
  "mail",
  "reminders",
  "drive",
  "chat",
  "plane",
  "zammad",
  "kimai",
  "kiwi",
  "paperless",
  "n8n",
]);

export type WorkspaceServiceId = z.infer<typeof workspaceServiceIdSchema>;

export const workspaceConfigSchema = z
  .object({
    enabledModules: z.array(workspaceModuleIdSchema),
    /** Tenant may use these services anywhere (launcher, deep links, future modules). */
    allowedServices: z.array(workspaceServiceIdSchema),
    /**
     * Services shown as launcher tiles. Must be a subset of `allowedServices`.
     * Empty array means “show all allowed” (resolved in launcher-semantics).
     */
    launcherVisibleServiceIds: z.array(workspaceServiceIdSchema).default([]),
    /**
     * Featured / pinned subset of visible launcher tiles. Must be subset of visible (or allowed if visible empty).
     */
    launcherFeaturedServiceIds: z.array(workspaceServiceIdSchema).default([]),
    /** Right panel tabs (capability ids); each must be allowed. */
    rightPanelTabs: z.array(workspaceServiceIdSchema),
    launcherMaxVisible: z.number().int().positive().max(24).default(12),
  })
  .superRefine((data, ctx) => {
    const allowed = new Set(data.allowedServices);
    const check = (ids: WorkspaceServiceId[], path: string) => {
      for (let i = 0; i < ids.length; i++) {
        const id = ids[i]!;
        if (!allowed.has(id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${path}[${i}] must be in allowedServices`,
            path: [path, i],
          });
        }
      }
    };
    check(data.launcherVisibleServiceIds, "launcherVisibleServiceIds");
    check(data.launcherFeaturedServiceIds, "launcherFeaturedServiceIds");
    check(data.rightPanelTabs, "rightPanelTabs");

    const visibleSet =
      data.launcherVisibleServiceIds.length > 0
        ? new Set(data.launcherVisibleServiceIds.filter((id) => allowed.has(id)))
        : allowed;
    data.launcherFeaturedServiceIds.forEach((id, i) => {
      if (!visibleSet.has(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `launcherFeaturedServiceIds[${i}] must appear in effective launcher visible set`,
          path: ["launcherFeaturedServiceIds", i],
        });
      }
    });
  });

export type WorkspaceConfig = z.infer<typeof workspaceConfigSchema>;

/** Default composition: Google-shaped apps plus vendor tiles when tenant enables them. */
export const defaultWorkspaceConfig: WorkspaceConfig = workspaceConfigSchema.parse({
  enabledModules: [
    "today_summary",
    "attention",
    "my_work",
    "my_apps",
    "activity",
    "launcher",
  ],
  allowedServices: [
    "calendar",
    "mail",
    "reminders",
    "drive",
    "chat",
    "plane",
    "zammad",
    "kimai",
    "kiwi",
    "paperless",
    "n8n",
  ],
  launcherVisibleServiceIds: [
    "calendar",
    "mail",
    "reminders",
    "drive",
    "chat",
    "plane",
    "zammad",
    "kimai",
    "kiwi",
    "paperless",
    "n8n",
  ],
  launcherFeaturedServiceIds: ["calendar", "mail", "plane", "drive"],
  rightPanelTabs: ["calendar", "mail", "reminders", "drive", "plane", "paperless"],
  launcherMaxVisible: 14,
});

/** Intentionally sparse: one allowed service, minimal modules — for empty-state / composition tests. */
export const minimalEmptyWorkspaceConfig: WorkspaceConfig = workspaceConfigSchema.parse({
  enabledModules: ["today_summary", "launcher"],
  allowedServices: ["calendar"],
  launcherVisibleServiceIds: ["calendar"],
  launcherFeaturedServiceIds: [],
  rightPanelTabs: ["calendar"],
  launcherMaxVisible: 4,
});

export function isModuleEnabled(config: WorkspaceConfig, id: WorkspaceModuleId): boolean {
  return config.enabledModules.includes(id);
}

export function isServiceAllowed(config: WorkspaceConfig, id: WorkspaceServiceId): boolean {
  return config.allowedServices.includes(id);
}
