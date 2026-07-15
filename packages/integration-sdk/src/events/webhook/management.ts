import type {
  WebhookDefinition,
  WebhookEndpointDefinition,
  WebhookManager,
  WebhookManagerOperation,
  WebhookRegistrationRequest,
  WebhookRegistrationResult,
  WebhookUpdateRequest,
  WebhookValidationOutcome,
} from "./types";
import { WEBHOOK_MANAGER_OPERATIONS } from "./types";

export type {
  WebhookDefinition,
  WebhookEndpointDefinition,
  WebhookLifecycleStatus,
  WebhookListOptions,
  WebhookManager,
  WebhookManagerOperation,
  WebhookRegistrationRequest,
  WebhookRegistrationResult,
  WebhookSecretRef,
  WebhookUpdateRequest,
  WebhookValidationOutcome,
} from "./types";

export {
  WEBHOOK_MANAGER_OPERATIONS,
  assertWebhookOperationSupported,
  isWebhookOperationSupported,
} from "./types";

/** Shape compatible with Plane/Zammad webhook services for thin wrapping. */
export interface LegacyWebhookServiceLike {
  list(context: unknown): Promise<readonly LegacyWebhookRegistrationLike[]>;
  get(context: unknown, webhookId: string): Promise<LegacyWebhookRegistrationLike>;
  create(
    context: unknown,
    input: LegacyCreateWebhookInput,
  ): Promise<LegacyWebhookRegistrationLike>;
  update(
    context: unknown,
    webhookId: string,
    input: LegacyUpdateWebhookInput,
  ): Promise<LegacyWebhookRegistrationLike>;
  delete(context: unknown, webhookId: string): Promise<void>;
  validateConfiguration(input: LegacyCreateWebhookInput | LegacyUpdateWebhookInput): {
    readonly ok: boolean;
    readonly issues: readonly string[];
  };
  supportedOperations(): readonly string[];
}

export interface LegacyWebhookRegistrationLike {
  readonly id: string;
  readonly url: string;
  readonly isActive: boolean;
  readonly eventTypes: readonly string[];
  readonly secretPresent: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface LegacyCreateWebhookInput {
  readonly url: string;
  readonly eventTypes: readonly string[];
  readonly isActive?: boolean;
}

export interface LegacyUpdateWebhookInput {
  readonly url?: string;
  readonly eventTypes?: readonly string[];
  readonly isActive?: boolean;
}

export interface AsWebhookManagerOptions {
  readonly integrationId: string;
  readonly providerId: string;
}

function mapLegacyDefinition(
  registration: LegacyWebhookRegistrationLike,
  options: AsWebhookManagerOptions,
): WebhookDefinition {
  return {
    id: registration.id,
    integrationId: options.integrationId,
    providerId: options.providerId,
    status: registration.isActive ? "active" : "disabled",
    eventTypes: registration.eventTypes,
    endpoint: {
      callbackUrl: registration.url,
      requireHttps: true,
    },
    secretPresent: registration.secretPresent,
    createdAt: registration.createdAt,
    updatedAt: registration.updatedAt,
  };
}

function toLegacyCreate(request: WebhookRegistrationRequest): LegacyCreateWebhookInput {
  return {
    url: request.callbackUrl,
    eventTypes: request.eventTypes,
    isActive: request.enabled ?? true,
  };
}

function toLegacyUpdate(request: WebhookUpdateRequest): LegacyUpdateWebhookInput {
  return {
    url: request.callbackUrl,
    eventTypes: request.eventTypes,
    isActive: request.enabled,
  };
}

/**
 * Wrap an existing adapter webhook service as a SDK `WebhookManager`
 * without changing the underlying method signatures.
 */
export function asWebhookManager(
  service: LegacyWebhookServiceLike,
  options: AsWebhookManagerOptions,
): WebhookManager {
  const supported = service
    .supportedOperations()
    .filter((op): op is WebhookManagerOperation =>
      (WEBHOOK_MANAGER_OPERATIONS as readonly string[]).includes(op),
    );

  // enable/disable map to update when present
  const operations = new Set<WebhookManagerOperation>(supported);
  if (operations.has("update")) {
    operations.add("enable");
    operations.add("disable");
  }

  return {
    async list(context, listOptions) {
      const items = await service.list(context);
      const mapped = items.map((item) => mapLegacyDefinition(item, options));
      if (!listOptions?.status) return mapped;
      return mapped.filter((item) => item.status === listOptions.status);
    },

    async get(context, webhookId) {
      const item = await service.get(context, webhookId);
      return mapLegacyDefinition(item, options);
    },

    async create(context, request) {
      const validation = service.validateConfiguration(toLegacyCreate(request));
      if (!validation.ok) {
        return { ok: false, issues: validation.issues };
      }
      const created = await service.create(context, toLegacyCreate(request));
      return { ok: true, definition: mapLegacyDefinition(created, options) };
    },

    async update(context, webhookId, request) {
      const validation = service.validateConfiguration(toLegacyUpdate(request));
      if (!validation.ok) {
        return { ok: false, issues: validation.issues };
      }
      const updated = await service.update(context, webhookId, toLegacyUpdate(request));
      return { ok: true, definition: mapLegacyDefinition(updated, options) };
    },

    async enable(context, webhookId) {
      const updated = await service.update(context, webhookId, { isActive: true });
      return mapLegacyDefinition(updated, options);
    },

    async disable(context, webhookId) {
      const updated = await service.update(context, webhookId, { isActive: false });
      return mapLegacyDefinition(updated, options);
    },

    async delete(context, webhookId) {
      await service.delete(context, webhookId);
    },

    async validate(_context, request) {
      const legacy =
        "callbackUrl" in request && request.callbackUrl !== undefined
          ? toLegacyCreate(request as WebhookRegistrationRequest)
          : toLegacyUpdate(request);
      const result = service.validateConfiguration(legacy);
      const outcome: WebhookValidationOutcome = {
        ok: result.ok,
        issues: result.issues,
      };
      return outcome;
    },

    supportedOperations() {
      return [...operations];
    },
  };
}

export function validateWebhookEndpoint(
  endpoint: WebhookEndpointDefinition,
): WebhookValidationOutcome {
  const issues: string[] = [];
  if (!endpoint.callbackUrl?.trim()) {
    issues.push("callback_url_required");
  } else {
    try {
      const url = new URL(endpoint.callbackUrl);
      if (endpoint.requireHttps !== false && url.protocol !== "https:") {
        if (url.protocol !== "http:") {
          issues.push("callback_url_invalid_protocol");
        } else if (endpoint.requireHttps === true) {
          issues.push("callback_url_https_required");
        }
      }
    } catch {
      issues.push("callback_url_invalid");
    }
  }
  return { ok: issues.length === 0, issues };
}

export type { WebhookRegistrationResult as WebhookCreateResult };
