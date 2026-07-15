/** Re-exports vendor-neutral input contracts from the platform service layer. */
export type {
  UpdateProjectInput,
  CreateLabelInput,
  UpdateLabelInput,
  CreateCycleInput,
  UpdateCycleInput,
  CreateModuleInput,
  UpdateModuleInput,
  CreateProjectStateInput,
  UpdateProjectStateInput,
  AddMemberInput,
  UpdateMemberInput,
  CreateTaskInput,
  UpdateTaskInput,
  TransitionTaskStatusInput,
  AssignTaskInput,
  AddCommentInput,
  UpdateCommentInput,
  AddWatcherInput,
  CreateWebhookInput,
  UpdateWebhookInput,
  WebhookRegistration,
  EventTranslationResult,
  IntegrationEventEnvelope,
  SyncStatus,
  SyncRunResult,
  SyncRunOptions,
} from "@apzhub/platform-service-contracts";

import type { CreateProjectInput as PlatformCreateProjectInput } from "@apzhub/platform-service-contracts";

/** Adapter create input — workspace resolved from Plane connection context. */
export type CreateProjectInput = Omit<PlatformCreateProjectInput, "workspaceId">;
