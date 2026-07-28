/**
 * CapabilityService + HealthService — interfaces only (APZHUB-PLATFORM-WORKFLOW-003).
 */

import type {
  WorkflowCapability,
  WorkflowHealth,
  WorkflowProvider,
} from "../domain/runtime";
import type { WorkflowPlatformServiceContext } from "./platform-gateway";

export type CapabilityService = {
  readonly listCapabilities: (
    ctx: WorkflowPlatformServiceContext,
  ) => Promise<readonly WorkflowCapability[]>;
  readonly listProviders: (
    ctx: WorkflowPlatformServiceContext,
  ) => Promise<readonly WorkflowProvider[]>;
  readonly getProvider: (
    ctx: WorkflowPlatformServiceContext,
    providerKey: string,
  ) => Promise<WorkflowProvider>;
};

export type HealthService = {
  readonly getHealth: (ctx: WorkflowPlatformServiceContext) => Promise<WorkflowHealth>;
  readonly getComponentHealth: (
    ctx: WorkflowPlatformServiceContext,
    componentKey: string,
  ) => Promise<WorkflowHealth>;
};
