import {
  createPlaceholderEventBus,
  type EventBus,
} from "@apzhub/event-notification-framework";
import type { Matter } from "@apzhub/legal-business-core";

import {
  MatterWorkflowService,
  createEmptyMatterFormValues,
  getLawRepositoryMode,
  getSharedMatterRepository,
  matterToFormValues,
} from "@apzhub/law-platform/api";

import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";
import { createWorkflowRunner } from "../framework";
import {
  customFieldsRecordToInput,
  tagsArrayToInput,
} from "../framework/dto-input-helpers";
import type { CreateMatterV1Request, UpdateMatterV1Request } from "./matter-dto-mapper";
import { getMatterApiMetadata, touchMatterApiMetadata } from "./matter-dto-mapper";

let matterApiEventBus: EventBus | undefined;

export function getMatterApiEventBus(): EventBus {
  matterApiEventBus ??= createPlaceholderEventBus();
  return matterApiEventBus;
}

export function resetMatterApiEventBus(): void {
  matterApiEventBus = undefined;
}

const matterWorkflowRunner = createWorkflowRunner({
  createService: (context) =>
    new MatterWorkflowService({
      repository: getSharedMatterRepository(),
      eventBus: getMatterApiEventBus(),
      actorId: context.user?.userId,
    }),
});

export function createMatterWorkflowService(
  context: LawApiAuthenticatedContext,
): MatterWorkflowService {
  return matterWorkflowRunner.createService(context);
}

export async function withMatterWorkflowService<T>(
  context: LawApiAuthenticatedContext,
  operation: (service: MatterWorkflowService) => T | Promise<T>,
): Promise<T> {
  return matterWorkflowRunner.withService(context, operation);
}

export function createMatterFormValuesFromRequest(body: CreateMatterV1Request) {
  const defaults = createEmptyMatterFormValues();

  return {
    ...defaults,
    title: body.title,
    clientId: body.clientId,
    matterTypeId: body.matterTypeId,
    practiceAreaId: body.practiceAreaId,
    leadAttorneyId: body.leadAttorneyId,
    description: body.description ?? "",
    priority: body.priority ?? defaults.priority,
    tags: tagsArrayToInput(body.tags),
    customFields: customFieldsRecordToInput(body.customFields),
  };
}

export function mergeUpdateMatterFormValues(
  existing: Matter,
  body: UpdateMatterV1Request,
) {
  const current = matterToFormValues(existing);

  return {
    ...current,
    title: body.title ?? current.title,
    description:
      body.description !== undefined ? (body.description ?? "") : current.description,
    matterStatus: body.matterStatus ?? current.matterStatus,
    priority: body.priority ?? current.priority,
    leadAttorneyId: body.leadAttorneyId ?? current.leadAttorneyId,
    tags: body.tags !== undefined ? tagsArrayToInput(body.tags) : current.tags,
    customFields:
      body.customFields !== undefined
        ? customFieldsRecordToInput(body.customFields)
        : current.customFields,
  };
}

export function recordMatterMetadataAfterWrite(matter: Matter, created: boolean) {
  if (getLawRepositoryMode() === "postgres") {
    return;
  }

  touchMatterApiMetadata(matter.matterId, created);
}

export function resolveMatterMetadata(matterId: string) {
  return getMatterApiMetadata(matterId);
}

export function assertMatterVersion(
  matterId: string,
  expectedVersion: number | undefined,
): boolean {
  if (expectedVersion === undefined) {
    return true;
  }

  return resolveMatterMetadata(matterId).version === expectedVersion;
}
