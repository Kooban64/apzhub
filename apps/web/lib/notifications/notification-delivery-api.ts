/**
 * Notification Delivery typed client (ENG-004) — inbox + administration.
 * Calls only /api/v1/notifications/{inbox,intents,deliveries,...} — never providers.
 */

import { assertNotificationApiPath, NOTIFICATIONS_API_BASE } from "./routes";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  assertNotificationApiPath(path);
  const response = await fetch(path, {
    ...init,
    headers: {
      accept: "application/json",
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
    credentials: "same-origin",
  });
  const json = (await response.json()) as {
    data?: T;
    error?: { message?: string; code?: string };
  };
  if (!response.ok) {
    throw new Error(json.error?.message ?? `Request failed (${response.status})`);
  }
  return json.data as T;
}

export type InAppNotificationDto = {
  readonly id: string;
  readonly deliveryId: string;
  readonly intentId: string;
  readonly category: string;
  readonly priority: string;
  readonly title: string;
  readonly summary?: string;
  readonly body?: string;
  readonly sourceProduct: string;
  readonly sourceObjectRef?: string;
  readonly readAt?: string;
  readonly createdAt: string;
  readonly expiresAt?: string;
};

export const notificationDeliveryQueryKeys = {
  inbox: ["notifications", "inbox"] as const,
  deliveries: ["notifications", "deliveries"] as const,
  health: ["notifications", "delivery-health"] as const,
  diagnostics: ["notifications", "delivery-diagnostics"] as const,
};

export function listInAppNotifications() {
  return request<InAppNotificationDto[]>(`${NOTIFICATIONS_API_BASE}/inbox`);
}

export function markInAppNotificationRead(id: string) {
  return request<InAppNotificationDto>(`${NOTIFICATIONS_API_BASE}/inbox/${id}/read`, {
    method: "POST",
  });
}

export function markInAppNotificationUnread(id: string) {
  return request<InAppNotificationDto>(`${NOTIFICATIONS_API_BASE}/inbox/${id}/unread`, {
    method: "POST",
  });
}

export function markAllInAppNotificationsRead() {
  return request<{ updated: number }>(`${NOTIFICATIONS_API_BASE}/inbox/read-all`, {
    method: "POST",
  });
}

export function getNotificationDeliveryHealth() {
  return request<Record<string, unknown>>(`${NOTIFICATIONS_API_BASE}/delivery-health`);
}

export function getNotificationDeliveryDiagnostics() {
  return request<Record<string, unknown>>(
    `${NOTIFICATIONS_API_BASE}/delivery-diagnostics`,
  );
}
