/** Platform Notification typed client view models (APZNOTIFY-003). */

export type NotificationClientRequestOptions = {
  readonly signal?: AbortSignal;
  readonly headers?: HeadersInit;
};

export type NotificationCollectionResult<T> = {
  readonly items: readonly T[];
  readonly page?: { readonly limit?: number; readonly hasMore?: boolean };
};

export type NotificationViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key?: string;
  readonly title: string;
  readonly summary?: string;
  readonly body?: string;
  readonly status: string;
  readonly priority: string;
  readonly categoryId?: string;
  readonly templateId?: string;
  readonly channelKinds: readonly string[];
  readonly expiresAt?: string;
  readonly archivedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
};

export type NotificationTemplateViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly categoryId?: string;
  readonly defaultPriority: string;
  readonly defaultChannelKinds: readonly string[];
  readonly subjectTemplate?: string;
  readonly bodyTemplate?: string;
  readonly locale?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
};

export type NotificationPreferenceViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly userId: string;
  readonly categoryId?: string;
  readonly channelKind: string;
  readonly enabled: boolean;
  readonly quietHours?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type NotificationCategoryViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type NotificationChannelViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly kind: string;
  readonly name: string;
  readonly enabled: boolean;
  readonly configRef?: string;
  readonly deliveryAvailable: false;
  readonly providersConfigured: false;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type NotificationRecipientViewModel = {
  readonly id: string;
  readonly notificationId: string;
  readonly tenantId: string;
  readonly userId?: string;
  readonly addressHint?: string;
  readonly channelKind: string;
  readonly status: string;
  readonly readAt?: string;
  readonly acknowledgedAt?: string;
  readonly dismissedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type NotificationReferenceViewModel = {
  readonly id: string;
  readonly notificationId: string;
  readonly kind: string;
  readonly resourceId: string;
  readonly label?: string;
};

export type NotificationAuditViewModel = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly notificationId?: string;
  readonly action: string;
  readonly actorUserId: string;
  readonly detail?: string;
  readonly createdAt: string;
};

export type NotificationManagementPlaneViewModel = {
  readonly notificationEnabled: boolean;
  readonly managementPlaneReady?: boolean;
  readonly deliveryPlaneReady: false;
  readonly deliveryEnabled: false;
  readonly providersConfigured: false;
  readonly workersReady: false;
  readonly eventBusReady: false;
  readonly realtimeReady: false;
  readonly persistenceMode: string;
  readonly capabilities?: Readonly<Record<string, unknown>>;
  readonly status?: string;
  readonly healthy?: boolean;
  readonly ready?: boolean;
  readonly platformServicesVersion?: string;
};

export type ListNotificationsClientQuery = {
  readonly status?: string;
  readonly priority?: string;
  readonly categoryId?: string;
  readonly channel?: string;
  readonly limit?: number;
  readonly cursor?: string;
  readonly sort?: string;
  readonly order?: "asc" | "desc";
};

export type CreateNotificationClientInput = {
  readonly title: string;
  readonly summary?: string;
  readonly body?: string;
  readonly key?: string;
  readonly priority?: string;
  readonly categoryId?: string;
  readonly templateId?: string;
  readonly channelKinds?: readonly string[];
  readonly organisationId?: string;
  readonly expiresAt?: string;
  readonly recipients?: readonly {
    readonly userId?: string;
    readonly addressHint?: string;
    readonly channelKind: string;
  }[];
  readonly references?: readonly {
    readonly kind: string;
    readonly resourceId: string;
    readonly label?: string;
  }[];
};

export type UpdateNotificationClientInput = {
  readonly title?: string;
  readonly summary?: string | null;
  readonly body?: string | null;
  readonly priority?: string;
  readonly categoryId?: string | null;
  readonly templateId?: string | null;
  readonly channelKinds?: readonly string[];
  readonly expiresAt?: string | null;
};

export type TransitionNotificationClientInput = {
  readonly to: string;
  readonly reason?: string;
};

export type CreateNotificationTemplateClientInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly categoryId?: string;
  readonly defaultPriority?: string;
  readonly defaultChannelKinds?: readonly string[];
  readonly subjectTemplate?: string;
  readonly bodyTemplate?: string;
  readonly locale?: string;
  readonly organisationId?: string;
};

export type UpdateNotificationTemplateClientInput = {
  readonly name?: string;
  readonly description?: string | null;
  readonly categoryId?: string | null;
  readonly defaultPriority?: string;
  readonly defaultChannelKinds?: readonly string[];
  readonly subjectTemplate?: string | null;
  readonly bodyTemplate?: string | null;
  readonly locale?: string | null;
};

export type UpdateNotificationPreferenceClientInput = {
  readonly enabled?: boolean;
  readonly quietHours?: string | null;
  readonly categoryId?: string | null;
  readonly channelKind?: string;
};
