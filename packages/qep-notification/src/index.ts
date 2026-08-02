export { QEP_NOTIFICATION_VERSION, QEP_NOTIFICATION_PLATFORM_VERSION } from "./version";

export {
  NOTIFICATION_SEVERITIES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_AUDIENCES,
  type NotificationSeverity,
  type NotificationPriority,
  type NotificationCategory,
  type NotificationAudience,
  type NotificationClassification,
} from "./domain/classification";

export {
  DELIVERY_STATUSES,
  type SubscriptionScopeKind,
  type SubscriptionScope,
  type SubscriptionDefinition,
  type NotificationPreference,
  type RenderedNotification,
  type NotificationRecord,
  type DeliveryStatus,
  type DeliveryFailureClass,
  type DeliveryRecord,
  type NotificationAuditEntry,
  type InternalInboxMessage,
} from "./domain/types";

export {
  createSubscriptionRegistry,
  type SubscriptionRegistry,
} from "./subscription/registry";

export {
  createSubscriptionManager,
  type SubscriptionManager,
} from "./subscription/manager";

export {
  createSubscriptionResolver,
  type SubscriptionResolver,
  type ResolvedSubscription,
} from "./subscription/resolution";

export {
  createInMemoryPreferenceStore,
  evaluatePreference,
  type PreferenceStore,
  type PreferenceDecision,
} from "./preferences/preferences";

export {
  createDefaultNotificationPolicy,
  type NotificationPolicy,
  type NotificationPolicyDecision,
} from "./policy/policy";

export {
  createNotificationRouter,
  type NotificationRouter,
  type RoutePlan,
} from "./policy/routing";

export {
  CHANNEL_IDS,
  createUnimplementedChannelProvider,
  type ChannelProvider,
  type ChannelDeliverInput,
  type ChannelDeliverResult,
} from "./channel/port";

export {
  createInternalNotificationChannel,
  type InternalInbox,
} from "./channel/internal";

export {
  createChannelRegistry,
  createDefaultChannelRegistry,
  type ChannelRegistry,
} from "./channel/registry";

export {
  createTemplateRegistry,
  EVIDENCE_NOTIFICATION_TEMPLATES,
  type NotificationTemplate,
  type TemplateRegistry,
} from "./template/registry";

export {
  createTemplateResolver,
  renderTemplate,
  type TemplateResolver,
  type TemplateResolutionResult,
} from "./template/resolution";

export { createInMemoryDeliveryStore, type DeliveryStore } from "./delivery/status";

export {
  createInMemoryNotificationHistoryStore,
  type NotificationHistoryStore,
  type DeliveryHistoryView,
} from "./delivery/history";

export {
  createInMemoryNotificationAudit,
  type NotificationAudit,
} from "./delivery/audit";

export {
  createNotificationMetrics,
  type NotificationMetrics,
  type NotificationMetricsSnapshot,
} from "./delivery/metrics";

export {
  collectNotificationDiagnostics,
  type NotificationDiagnostics,
} from "./delivery/diagnostics";

export {
  createNotificationDeliveryEngine,
  type NotificationDeliveryEngine,
  type NotificationFact,
  type DeliveryEngineResult,
} from "./delivery/engine";

export {
  enqueueNotificationDeliveryIntent,
  NOTIFICATION_DELIVERY_OUTBOX_EVENT,
  type NotificationDeliveryIntent,
} from "./delivery/outbox-bridge";

export { createNotificationEvidenceProcessors } from "./processors/evidence-processors";

export {
  createNotificationProcessorBundle,
  NOTIFICATION_BUNDLE_ID,
  type NotificationProcessorBundle,
} from "./processors/registry";

export {
  createNotificationSubscriptionPlatform,
  type NotificationSubscriptionPlatform,
} from "./compose";
