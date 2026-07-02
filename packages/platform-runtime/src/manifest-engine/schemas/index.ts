import { z } from "zod";

import type { CapabilityKind } from "../capability-kinds";
import { componentCapabilityManifestSchema } from "./component";
import { eventCapabilityManifestSchema } from "./event";
import {
  aiProviderCapabilityManifestSchema,
  commandCapabilityManifestSchema,
  dashboardCapabilityManifestSchema,
  featureFlagCapabilityManifestSchema,
  reportCapabilityManifestSchema,
  searchProviderCapabilityManifestSchema,
  themeCapabilityManifestSchema,
  widgetCapabilityManifestSchema,
  workerCapabilityManifestSchema,
} from "./extensions";
import { integrationCapabilityManifestSchema } from "./integration";
import { moduleCapabilityManifestSchema } from "./module";
import { serviceCapabilityManifestSchema } from "./service";

export const capabilityManifestSchema = z.discriminatedUnion("kind", [
  componentCapabilityManifestSchema,
  moduleCapabilityManifestSchema,
  serviceCapabilityManifestSchema,
  integrationCapabilityManifestSchema,
  eventCapabilityManifestSchema,
  themeCapabilityManifestSchema,
  commandCapabilityManifestSchema,
  searchProviderCapabilityManifestSchema,
  workerCapabilityManifestSchema,
  dashboardCapabilityManifestSchema,
  widgetCapabilityManifestSchema,
  reportCapabilityManifestSchema,
  aiProviderCapabilityManifestSchema,
  featureFlagCapabilityManifestSchema,
]);

export type CapabilityManifest = z.infer<typeof capabilityManifestSchema>;
export type { ComponentCapabilityManifest } from "./component";
export type { ModuleCapabilityManifest } from "./module";
export type { ServiceCapabilityManifest } from "./service";

const schemaByKind: Record<CapabilityKind, z.ZodTypeAny> = {
  component: componentCapabilityManifestSchema,
  module: moduleCapabilityManifestSchema,
  service: serviceCapabilityManifestSchema,
  integration: integrationCapabilityManifestSchema,
  event: eventCapabilityManifestSchema,
  theme: themeCapabilityManifestSchema,
  command: commandCapabilityManifestSchema,
  "search-provider": searchProviderCapabilityManifestSchema,
  worker: workerCapabilityManifestSchema,
  dashboard: dashboardCapabilityManifestSchema,
  widget: widgetCapabilityManifestSchema,
  report: reportCapabilityManifestSchema,
  "ai-provider": aiProviderCapabilityManifestSchema,
  "feature-flag": featureFlagCapabilityManifestSchema,
};

export function getCapabilityManifestSchema(kind: CapabilityKind): z.ZodTypeAny {
  return schemaByKind[kind];
}
