import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type {
  CreateWebhookInput,
  UpdateWebhookInput,
  WebhookRegistration,
  WebhookValidationResult,
} from "@apzhub/platform-service-contracts";

import { ZAMMAD_SUPPORTED_WEBHOOK_EVENT_TYPES } from "../events/event-translator";
import type { ZammadWebhookRecord } from "../internal/zammad-api-types";
import {
  assertValid,
  mergeValidation,
  validateRequiredString,
} from "../validation/request-validation";
import { buildZammadListQuery } from "./list-helpers";
import type { ZammadServiceDeps } from "./zammad-operation-runner";

function toWebhookId(zammadId: string | number): string {
  return `webhook_zammad_${zammadId}`;
}

function extractWebhookZammadId(webhookId: string): string {
  const marker = "webhook_zammad_";
  return webhookId.startsWith(marker) ? webhookId.slice(marker.length) : webhookId;
}

function mapWebhook(record: ZammadWebhookRecord): WebhookRegistration {
  return {
    id: toWebhookId(record.id),
    url: record.endpoint,
    isActive: record.active !== false,
    eventTypes: record.subscriptions?.length
      ? [...record.subscriptions]
      : [...ZAMMAD_SUPPORTED_WEBHOOK_EVENT_TYPES],
    secretPresent: Boolean(record.signature_token),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

function buildWebhookBody(
  input: CreateWebhookInput | UpdateWebhookInput,
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.url !== undefined) {
    body.endpoint = input.url;
  }
  if (input.isActive !== undefined) {
    body.active = input.isActive;
  }
  if (input.eventTypes !== undefined) {
    body.subscriptions = [...input.eventTypes];
  }
  return body;
}

function isHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Zammad CE webhook registration — adapter-only; no HTTP ingress in this milestone.
 */
export class ZammadWebhookService {
  constructor(private readonly deps: ZammadServiceDeps) {}

  validateConfiguration(input: CreateWebhookInput | UpdateWebhookInput): WebhookValidationResult {
    const issues: string[] = [];

    if ("url" in input && input.url !== undefined) {
      if (!input.url.trim()) {
        issues.push("url_required");
      } else if (!isHttpUrl(input.url)) {
        issues.push("url_invalid");
      }
    }

    if (input.eventTypes !== undefined) {
      if (input.eventTypes.length === 0) {
        issues.push("event_types_required");
      }
      for (const eventType of input.eventTypes) {
        if (!(ZAMMAD_SUPPORTED_WEBHOOK_EVENT_TYPES as readonly string[]).includes(eventType)) {
          issues.push(`unsupported_event_type:${eventType}`);
        }
      }
    }

    return { ok: issues.length === 0, issues };
  }

  async list(context: IntegrationRequestContext): Promise<readonly WebhookRegistration[]> {
    return this.deps.runner.run(context, "zammad.webhooks.list", async () => {
      const response = await this.deps.client.listWebhooks(
        context,
        buildZammadListQuery({ page: 1, perPage: 100 }),
      );
      return response.items.map(mapWebhook);
    });
  }

  async get(
    context: IntegrationRequestContext,
    webhookId: string,
  ): Promise<WebhookRegistration> {
    assertValid(validateRequiredString(webhookId, "webhookId"), "webhooks.get");

    return this.deps.runner.run(context, "zammad.webhooks.get", async () => {
      const record = await this.deps.client.getWebhook(
        context,
        extractWebhookZammadId(webhookId),
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
        issues: [...validation.issues],
      }),
      "webhooks.create",
    );

    return this.deps.runner.run(context, "zammad.webhooks.create", async () => {
      const record = await this.deps.client.createWebhook(context, {
        name: "APZHUB Support webhook",
        ...buildWebhookBody(input),
      });
      this.deps.metricsProvider
        ?.counter("zammad.webhook.registration", { operation: "create", result: "success" })
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
    assertValid(
      { ok: validation.ok, issues: [...validation.issues] },
      "webhooks.update",
    );

    return this.deps.runner.run(context, "zammad.webhooks.update", async () => {
      const record = await this.deps.client.updateWebhook(
        context,
        extractWebhookZammadId(webhookId),
        buildWebhookBody(input),
      );
      this.deps.metricsProvider
        ?.counter("zammad.webhook.registration", { operation: "update", result: "success" })
        .inc();
      return mapWebhook(record);
    });
  }

  async delete(context: IntegrationRequestContext, webhookId: string): Promise<void> {
    assertValid(validateRequiredString(webhookId, "webhookId"), "webhooks.delete");

    return this.deps.runner.run(context, "zammad.webhooks.delete", async () => {
      await this.deps.client.deleteWebhook(context, extractWebhookZammadId(webhookId));
      this.deps.metricsProvider
        ?.counter("zammad.webhook.registration", { operation: "delete", result: "success" })
        .inc();
    });
  }

  supportedEventTypes(): readonly string[] {
    return ZAMMAD_SUPPORTED_WEBHOOK_EVENT_TYPES;
  }

  supportedOperations(): readonly string[] {
    return ["create", "update", "delete", "list", "get", "validate"];
  }
}
