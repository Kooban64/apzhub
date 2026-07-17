/**
 * Notification Platform Services factories (APZNOTIFY-002).
 * Production: PostgreSQL — no silent in-memory / allow-all authz fallbacks.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import type { NotificationPlatformGateway } from "@apzhub/notification-contracts";
import {
  createNotificationFoundation,
  createPlatformNotificationService,
  type NotificationFoundation,
} from "@apzhub/notification-core";
import {
  createNotificationPersistenceForTest,
  createProductionNotificationPersistence,
  type NotificationPersistenceBundle,
} from "@apzhub/notification-persistence";

import type { RequestPipeline } from "../../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../../execution/wrap-service";
import {
  createNotificationPlatformServiceImpls,
  type NotificationPlatformServiceImpls,
} from "./notification-service-impls";

export type NotificationPlatformServicesBundle = {
  readonly foundation: NotificationFoundation;
  readonly persistence: NotificationPersistenceBundle;
  readonly gatewaySurface: NotificationPlatformGateway;
  readonly impls: NotificationPlatformServiceImpls;
  readonly readiness: {
    readonly notificationEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
    readonly deliveryEnabled: false;
  };
  wrapWithPipeline(pipeline: RequestPipeline): NotificationPlatformGateway;
};

export type CreateNotificationPlatformServicesInput = {
  readonly foundation?: NotificationFoundation;
  readonly persistence?: NotificationPersistenceBundle;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type CreateNotificationPlatformServicesForProductionInput = {
  readonly postgresDb: DatabaseExecutor;
  readonly now?: () => string;
  readonly id?: () => string;
};

export type CreateNotificationPlatformServicesForTestInput = {
  readonly postgresDb?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
  readonly now?: () => string;
  readonly id?: () => string;
};

export function wrapNotificationPlatformGatewayWithPipeline(
  gateway: NotificationPlatformGateway,
  pipeline: RequestPipeline,
): NotificationPlatformGateway {
  return {
    notifications: wrapServiceWithPipeline(
      gateway.notifications,
      pipeline,
      "notificationNotifications",
    ),
    templates: wrapServiceWithPipeline(
      gateway.templates,
      pipeline,
      "notificationTemplates",
    ),
    preferences: wrapServiceWithPipeline(
      gateway.preferences,
      pipeline,
      "notificationPreferences",
    ),
    categories: wrapServiceWithPipeline(
      gateway.categories,
      pipeline,
      "notificationCategories",
    ),
    channels: wrapServiceWithPipeline(
      gateway.channels,
      pipeline,
      "notificationChannels",
    ),
    recipients: wrapServiceWithPipeline(
      gateway.recipients,
      pipeline,
      "notificationRecipients",
    ),
    references: wrapServiceWithPipeline(
      gateway.references,
      pipeline,
      "notificationReferences",
    ),
    audit: wrapServiceWithPipeline(
      gateway.audit,
      pipeline,
      "notificationAudit",
    ),
    diagnostics: wrapServiceWithPipeline(
      gateway.diagnostics,
      pipeline,
      "notificationDiagnostics",
    ),
  };
}

function buildBundle(input: {
  readonly persistence: NotificationPersistenceBundle;
  readonly persistenceMode: "postgres" | "memory";
  readonly now?: () => string;
  readonly id?: () => string;
}): NotificationPlatformServicesBundle {
  const foundation = createNotificationFoundation({ repos: input.persistence });
  let seq = 0;
  const now = input.now ?? (() => new Date().toISOString());
  const id =
    input.id ?? (() => `ntf_${Date.now().toString(36)}_${++seq}`);
  const domain = createPlatformNotificationService({
    repos: input.persistence,
    now,
    id,
    persistenceMode: input.persistenceMode,
  });
  const impls = createNotificationPlatformServiceImpls({ domain });
  const gatewaySurface = impls;

  return {
    foundation,
    persistence: input.persistence,
    gatewaySurface,
    impls,
    readiness: {
      notificationEnabled: true,
      persistenceMode: input.persistenceMode,
      deliveryEnabled: false,
    },
    wrapWithPipeline: (pipeline) =>
      wrapNotificationPlatformGatewayWithPipeline(gatewaySurface, pipeline),
  };
}

export function createNotificationPlatformServices(
  input: CreateNotificationPlatformServicesInput & {
    readonly persistence: NotificationPersistenceBundle;
    readonly persistenceMode?: "postgres" | "memory";
  },
): NotificationPlatformServicesBundle {
  return buildBundle({
    persistence: input.persistence,
    persistenceMode: input.persistenceMode ?? "memory",
    now: input.now,
    id: input.id,
  });
}

export function createNotificationPlatformServicesForProduction(
  input: CreateNotificationPlatformServicesForProductionInput,
): NotificationPlatformServicesBundle {
  if (!input?.postgresDb) {
    throw new Error(
      "createNotificationPlatformServicesForProduction requires postgresDb — in-memory fallback is forbidden",
    );
  }
  const persistence = createProductionNotificationPersistence({
    db: input.postgresDb,
  });
  return buildBundle({
    persistence,
    persistenceMode: "postgres",
    now: input.now,
    id: input.id,
  });
}

export function createNotificationPlatformServicesForTest(
  input: CreateNotificationPlatformServicesForTestInput = {},
): NotificationPlatformServicesBundle {
  if (!input.postgresDb && !input.allowInMemoryPersistence) {
    throw new Error(
      "createNotificationPlatformServicesForTest requires postgresDb or allowInMemoryPersistence: true",
    );
  }
  const persistence = createNotificationPersistenceForTest({
    postgresDb: input.postgresDb,
    allowInMemoryPersistence: input.allowInMemoryPersistence,
  });
  return buildBundle({
    persistence,
    persistenceMode: input.postgresDb ? "postgres" : "memory",
    now: input.now,
    id: input.id,
  });
}
