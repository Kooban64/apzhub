import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type {
  CreateWebhookInput,
  UpdateWebhookInput,
  WebhookRegistration,
  WebhookValidationResult,
} from "@apzhub/platform-service-contracts";

import type {
  PlanePaginatedResponse,
  PlaneWebhookRecord,
} from "../internal/plane-api-types";
import { PLANE_SUPPORTED_WEBHOOK_EVENT_TYPES } from "../events/event-translator";
import {
  assertValid,
  mergeValidation,
  validateRequiredString,
} from "../validation/request-validation";
import type { PlaneServiceDeps } from "./plane-operation-runner";

const WEBHOOK_EVENT_FLAGS = [
  "project",
  "issue",
  "cycle",
  "module",
  "issue_comment",
] as const;

type WebhookEventFlag = (typeof WEBHOOK_EVENT_FLAGS)[number];

function asWebhookArray(
  response: PlanePaginatedResponse<PlaneWebhookRecord> | readonly PlaneWebhookRecord[],
): readonly PlaneWebhookRecord[] {
  if (Array.isArray(response)) {
    return response;
  }
  return (response as PlanePaginatedResponse<PlaneWebhookRecord>).results;
}

function toWebhookId(planeId: string): string {
  return `webhook_plane_${planeId}`;
}

function extractWebhookPlaneId(webhookId: string): string {
  const marker = "webhook_plane_";
  return webhookId.startsWith(marker) ? webhookId.slice(marker.length) : webhookId;
}

function eventTypesFromRecord(record: PlaneWebhookRecord): readonly string[] {
  const types: string[] = [];
  for (const flag of WEBHOOK_EVENT_FLAGS) {
    if (record[flag]) {
      types.push(flag);
    }
  }
  return types;
}

function mapWebhook(record: PlaneWebhookRecord): WebhookRegistration {
  return {
    id: toWebhookId(record.id),
    url: record.url,
    isActive: record.is_active !== false,
    eventTypes: eventTypesFromRecord(record),
    secretPresent: Boolean(record.secret_key),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function buildWebhookBody(
  input: CreateWebhookInput | UpdateWebhookInput,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.url !== undefined) {
    body.url = input.url;
  }
  if (input.isActive !== undefined) {
    body.is_active = input.isActive;
  }
  if (input.eventTypes !== undefined) {
    for (const flag of WEBHOOK_EVENT_FLAGS) {
      body[flag] = input.eventTypes.includes(flag);
    }
  }
  return body;
}

function isHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Plane CE webhook registration — adapter-only; no HTTP ingress in this milestone.
 */
export class PlaneWebhookService {
  constructor(private readonly deps: PlaneServiceDeps) {}

  validateConfiguration(
    input: CreateWebhookInput | UpdateWebhookInput,
  ): WebhookValidationResult {
    const issues: string[] = [];

    if ("url" in input && input.url !== undefined) {
      if (!input.url.trim()) {
        issues.push("url_required");
      } else if (!isHttpsUrl(input.url)) {
        issues.push("url_invalid");
      }
    }

    if (input.eventTypes !== undefined) {
      if (input.eventTypes.length === 0) {
        issues.push("event_types_required");
      }
      for (const eventType of input.eventTypes) {
        if (
          !(PLANE_SUPPORTED_WEBHOOK_EVENT_TYPES as readonly string[]).includes(
            eventType,
          )
        ) {
          issues.push(`unsupported_event_type:${eventType}`);
        }
      }
    }

    return { ok: issues.length === 0, issues };
  }

  async list(
    context: IntegrationRequestContext,
  ): Promise<readonly WebhookRegistration[]> {
    return this.deps.runner.run(context, "plane.webhooks.list", async () => {
      const response = await this.deps.client.listWebhooks(context, { per_page: 100 });
      return asWebhookArray(response).map(mapWebhook);
    });
  }

  async get(
    context: IntegrationRequestContext,
    webhookId: string,
  ): Promise<WebhookRegistration> {
    assertValid(validateRequiredString(webhookId, "webhookId"), "webhooks.get");

    return this.deps.runner.run(context, "plane.webhooks.get", async () => {
      const record = await this.deps.client.getWebhook(
        context,
        extractWebhookPlaneId(webhookId),
      );
      return mapWebhook(record);
    });
  }

  async create(
    context: IntegrationRequestContext,
    input: CreateWebhookInput,
  ): Promise<WebhookRegistration> {
    const validation = this.validateConfiguration(input);
    assertValid(
      mergeValidation(validateRequiredString(input.url, "url"), {
        ok: validation.ok,
        issues: validation.issues,
      }),
      "webhooks.create",
    );

    return this.deps.runner.run(context, "plane.webhooks.create", async () => {
      const record = await this.deps.client.createWebhook(
        context,
        buildWebhookBody(input),
      );
      this.deps.metricsProvider
        ?.counter("plane.webhook.registration", {
          operation: "create",
          result: "success",
        })
        .inc();
      return mapWebhook(record);
    });
  }

  async update(
    context: IntegrationRequestContext,
    webhookId: string,
    input: UpdateWebhookInput,
  ): Promise<WebhookRegistration> {
    assertValid(validateRequiredString(webhookId, "webhookId"), "webhooks.update");
    const validation = this.validateConfiguration(input);
    assertValid({ ok: validation.ok, issues: validation.issues }, "webhooks.update");

    return this.deps.runner.run(context, "plane.webhooks.update", async () => {
      const record = await this.deps.client.updateWebhook(
        context,
        extractWebhookPlaneId(webhookId),
        buildWebhookBody(input),
      );
      this.deps.metricsProvider
        ?.counter("plane.webhook.registration", {
          operation: "update",
          result: "success",
        })
        .inc();
      return mapWebhook(record);
    });
  }

  async delete(context: IntegrationRequestContext, webhookId: string): Promise<void> {
    assertValid(validateRequiredString(webhookId, "webhookId"), "webhooks.delete");

    await this.deps.runner.run(context, "plane.webhooks.delete", async () => {
      await this.deps.client.deleteWebhook(context, extractWebhookPlaneId(webhookId));
      this.deps.metricsProvider
        ?.counter("plane.webhook.registration", {
          operation: "delete",
          result: "success",
        })
        .inc();
    });
  }

  supportedEventTypes(): readonly WebhookEventFlag[] {
    return WEBHOOK_EVENT_FLAGS;
  }

  supportedOperations(): readonly string[] {
    return ["create", "update", "delete", "list", "get", "validate"];
  }
}
