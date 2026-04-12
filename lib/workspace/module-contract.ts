import { z } from "zod";

import {
  isModuleEnabled,
  workspaceModuleIdSchema,
  type WorkspaceConfig,
  type WorkspaceModuleId,
} from "@/lib/workspace/workspace-config";

/** Stable rendering contract for every workspace home module (do not ad-hoc per module). */
export const workspaceModuleKindSchema = z.enum([
  "summary_strip",
  "card_grid",
  "dual_column_lists",
  "app_shortcuts_grid",
  "activity_timeline",
  "launcher_toolbar",
]);

export type WorkspaceModuleKind = z.infer<typeof workspaceModuleKindSchema>;

export const workspaceModuleDataStateSchema = z.enum(["empty", "loading", "ready", "error"]);

export type WorkspaceModuleDataState = z.infer<typeof workspaceModuleDataStateSchema>;

export const workspaceModuleSizeHintSchema = z.enum(["sm", "md", "lg"]);

export type WorkspaceModuleSizeHint = z.infer<typeof workspaceModuleSizeHintSchema>;

export const workspaceModuleActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  disabled: z.boolean(),
});

export type WorkspaceModuleAction = z.infer<typeof workspaceModuleActionSchema>;

export const workspaceModuleDescriptorSchema = z.object({
  id: workspaceModuleIdSchema,
  kind: workspaceModuleKindSchema,
  title: z.string(),
  visible: z.boolean(),
  order: z.number().int(),
  sizeHint: workspaceModuleSizeHintSchema,
  dataState: workspaceModuleDataStateSchema,
  actions: z.array(workspaceModuleActionSchema),
});

export type WorkspaceModuleDescriptor = z.infer<typeof workspaceModuleDescriptorSchema>;

const MODULE_BASE: Record<
  WorkspaceModuleId,
  Pick<WorkspaceModuleDescriptor, "kind" | "title" | "order" | "sizeHint">
> = {
  today_summary: { kind: "summary_strip", title: "Today", order: 10, sizeHint: "md" },
  attention: { kind: "card_grid", title: "Needs attention", order: 20, sizeHint: "sm" },
  my_work: { kind: "dual_column_lists", title: "My work", order: 30, sizeHint: "md" },
  my_apps: { kind: "app_shortcuts_grid", title: "My apps", order: 40, sizeHint: "sm" },
  activity: { kind: "activity_timeline", title: "Activity", order: 50, sizeHint: "md" },
  launcher: { kind: "launcher_toolbar", title: "Launcher", order: 60, sizeHint: "sm" },
};

/** Phase 3: modules are intentionally empty; later phases set `dataState` + `actions` from data. */
export function buildWorkspaceModuleDescriptors(config: WorkspaceConfig): WorkspaceModuleDescriptor[] {
  return (Object.keys(MODULE_BASE) as WorkspaceModuleId[]).map((id) => {
    const base = MODULE_BASE[id];
    return workspaceModuleDescriptorSchema.parse({
      id,
      kind: base.kind,
      title: base.title,
      order: base.order,
      sizeHint: base.sizeHint,
      visible: isModuleEnabled(config, id),
      dataState: "empty" as const,
      actions: [],
    });
  });
}
