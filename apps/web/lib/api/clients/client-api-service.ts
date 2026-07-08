import {
  createPlaceholderEventBus,
  type EventBus,
} from "@apzhub/event-notification-framework";
import type { Client } from "@apzhub/legal-business-core";

import {
  ClientWorkflowService,
  clientToFormValues,
  createEmptyClientFormValues,
  getLawRepositoryMode,
  getSharedClientRepository,
} from "@apzhub/law-platform/api";

import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";
import { createWorkflowRunner } from "../framework";
import type { CreateClientV1Request, UpdateClientV1Request } from "./client-dto-mapper";
import {
  customFieldsRecordToInput,
  getClientApiMetadata,
  tagsArrayToInput,
  touchClientApiMetadata,
} from "./client-dto-mapper";

let clientApiEventBus: EventBus | undefined;

export function getClientApiEventBus(): EventBus {
  clientApiEventBus ??= createPlaceholderEventBus();
  return clientApiEventBus;
}

export function resetClientApiEventBus(): void {
  clientApiEventBus = undefined;
}

const clientWorkflowRunner = createWorkflowRunner({
  createService: (context) =>
    new ClientWorkflowService({
      repository: getSharedClientRepository(),
      eventBus: getClientApiEventBus(),
      actorId: context.user?.userId,
    }),
});

export function createClientWorkflowService(
  context: LawApiAuthenticatedContext,
): ClientWorkflowService {
  return clientWorkflowRunner.createService(context);
}

export async function withClientWorkflowService<T>(
  context: LawApiAuthenticatedContext,
  operation: (service: ClientWorkflowService) => T | Promise<T>,
): Promise<T> {
  return clientWorkflowRunner.withService(context, operation);
}

export function createClientFormValuesFromRequest(body: CreateClientV1Request) {
  return {
    ...createEmptyClientFormValues(),
    displayName: body.displayName,
    clientType: body.clientType,
    status: body.status,
    tags: tagsArrayToInput(body.tags),
    customFields: customFieldsRecordToInput(body.customFields),
  };
}

export function mergeUpdateClientFormValues(
  existing: Client,
  body: UpdateClientV1Request,
) {
  const current = clientToFormValues(existing);

  return {
    ...current,
    displayName: body.displayName ?? current.displayName,
    status: body.status ?? current.status,
    tags: body.tags !== undefined ? tagsArrayToInput(body.tags) : current.tags,
    customFields:
      body.customFields !== undefined
        ? customFieldsRecordToInput(body.customFields)
        : current.customFields,
  };
}

export function recordClientMetadataAfterWrite(client: Client, created: boolean) {
  if (getLawRepositoryMode() === "postgres") {
    return;
  }

  touchClientApiMetadata(client.clientId, created);
}

export function resolveClientMetadata(clientId: string) {
  return getClientApiMetadata(clientId);
}

export function assertClientVersion(
  clientId: string,
  expectedVersion: number | undefined,
): boolean {
  if (expectedVersion === undefined) {
    return true;
  }

  return resolveClientMetadata(clientId).version === expectedVersion;
}
