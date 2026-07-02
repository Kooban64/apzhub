import { z } from "zod";

import { capabilityIdSchema } from "./envelope";

/** Globally unique action id — lowercase dot notation (ADR-0025). */
export const workbenchActionIdSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9][a-z0-9.-]*$/, "Action id must use lowercase dot notation");

export const NAVIGATION_LEVELS = [
  "activity-bar",
  "sidebar",
  "workspace",
  "context",
] as const;

export type WorkbenchNavigationLevel = (typeof NAVIGATION_LEVELS)[number];

export const navigationLevelSchema = z.enum(NAVIGATION_LEVELS);

export const workbenchNavigationSchema = z
  .object({
    id: capabilityIdSchema.optional(),
    level: navigationLevelSchema,
    workspace: z.string().min(1),
    label: z.string().min(1).optional(),
    icon: z.string().optional(),
    route: z.string().optional(),
    order: z.number().int().optional(),
    parent: z.string().optional(),
    permission: z.string().optional(),
    hidden: z.boolean().optional(),
    badge: z.string().optional(),
  })
  .strict();

export const workbenchViewSchema = z
  .object({
    viewId: capabilityIdSchema.optional(),
    title: z.string().min(1),
    workspace: z.string().min(1),
    route: z.string().optional(),
    permission: z.string().optional(),
    default: z.boolean().optional(),
    icon: z.string().optional(),
  })
  .strict();

export const workbenchActionContextWhenSchema = z
  .object({
    surfaces: z.array(z.string().min(1)).optional(),
    selectionKinds: z.array(z.enum(["none", "single", "multi"])).optional(),
    contextTypes: z.array(z.string().min(1)).optional(),
  })
  .strict();

/** Canonical manifest block — `workbench.actions` (AF-004). */
export const workbenchActionSchema = z
  .object({
    id: workbenchActionIdSchema,
    label: z.string().min(1),
    handler: z.string().min(1),
    permission: z.string().optional(),
    shortcut: z.string().optional(),
    description: z.string().optional(),
    palette: z.boolean().optional(),
    icon: z.string().optional(),
    disabled: z.boolean().optional(),
    group: z.string().optional(),
    contextWhen: workbenchActionContextWhenSchema.optional(),
    order: z.number().int().optional(),
  })
  .strict();

export const workbenchToolbarItemSchema = z
  .object({
    commandId: workbenchActionIdSchema,
    icon: z.string().optional(),
    label: z.string().optional(),
    order: z.number().int().optional(),
  })
  .strict();

export const workbenchToolbarRegionSchema = z
  .object({
    region: z.string().min(1),
    items: z.array(workbenchToolbarItemSchema),
  })
  .strict();

export const workbenchBlockSchema = z
  .object({
    navigation: workbenchNavigationSchema.optional(),
    view: workbenchViewSchema.optional(),
    actions: z.array(workbenchActionSchema).optional(),
    /** ADR-0025 legacy alias — normalised to `actions` at extraction time. */
    commands: z.array(workbenchActionSchema).optional(),
    toolbar: z.array(workbenchToolbarRegionSchema).optional(),
  })
  .strict();

/** Optional envelope extension per ADR-0022. */
export const optionalWorkbenchFields = {
  workbench: workbenchBlockSchema.optional(),
};

export type WorkbenchNavigationManifest = z.infer<typeof workbenchNavigationSchema>;
export type WorkbenchViewManifest = z.infer<typeof workbenchViewSchema>;
export type WorkbenchActionManifest = z.infer<typeof workbenchActionSchema>;
export type WorkbenchToolbarItemManifest = z.infer<typeof workbenchToolbarItemSchema>;
export type WorkbenchToolbarRegionManifest = z.infer<
  typeof workbenchToolbarRegionSchema
>;
export type WorkbenchBlockManifest = z.infer<typeof workbenchBlockSchema>;

/** Collect canonical and legacy action declarations from a workbench block. */
export function collectWorkbenchActionManifests(
  workbench: WorkbenchBlockManifest,
): readonly WorkbenchActionManifest[] {
  const actions = workbench.actions ?? [];
  const legacyCommands = workbench.commands ?? [];
  return [...actions, ...legacyCommands];
}

export function hasWorkbenchActions(manifest: unknown): manifest is {
  workbench: WorkbenchBlockManifest & { actions?: WorkbenchActionManifest[] };
} {
  if (typeof manifest !== "object" || manifest === null || !("workbench" in manifest)) {
    return false;
  }

  const workbench = (manifest as { workbench?: WorkbenchBlockManifest }).workbench;
  if (!workbench) {
    return false;
  }

  return collectWorkbenchActionManifests(workbench).length > 0;
}

export function hasWorkbenchNavigation(manifest: unknown): manifest is {
  workbench: WorkbenchBlockManifest & { navigation: WorkbenchNavigationManifest };
} {
  if (typeof manifest !== "object" || manifest === null || !("workbench" in manifest)) {
    return false;
  }

  const workbench = (manifest as { workbench?: WorkbenchBlockManifest }).workbench;
  return workbench?.navigation !== undefined;
}

export function hasWorkbenchView(
  manifest: unknown,
): manifest is { workbench: WorkbenchBlockManifest & { view: WorkbenchViewManifest } } {
  if (typeof manifest !== "object" || manifest === null || !("workbench" in manifest)) {
    return false;
  }

  const workbench = (manifest as { workbench?: WorkbenchBlockManifest }).workbench;
  return workbench?.view !== undefined;
}

/** Collect toolbar regions declared on a workbench block. */
export function collectWorkbenchToolbarManifests(
  workbench: WorkbenchBlockManifest,
): readonly WorkbenchToolbarRegionManifest[] {
  return workbench.toolbar ?? [];
}

export function hasWorkbenchToolbar(manifest: unknown): manifest is {
  workbench: WorkbenchBlockManifest & { toolbar?: WorkbenchToolbarRegionManifest[] };
} {
  if (typeof manifest !== "object" || manifest === null || !("workbench" in manifest)) {
    return false;
  }

  const workbench = (manifest as { workbench?: WorkbenchBlockManifest }).workbench;
  if (!workbench) {
    return false;
  }

  return collectWorkbenchToolbarManifests(workbench).length > 0;
}
