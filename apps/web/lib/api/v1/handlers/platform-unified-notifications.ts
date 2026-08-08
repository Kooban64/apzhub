import type { NextRequest } from "next/server";

import {
  productLabel,
  resolveNotificationDeepLink,
} from "@/lib/unified-notifications/deep-links";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import {
  getOrCreateNotificationDeliveryService,
  isNotificationDeliveryHttpEnabled,
} from "../gateway/notification-delivery-bootstrap";
import { jsonDataResponse } from "../response";

/**
 * Unified Notifications aggregator — groups delivery inbox by source product.
 * SoR remains Notification Delivery.
 */
export async function handlePlatformUnifiedNotifications(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const unreadOnly = request.nextUrl.searchParams.get("unread") === "1";

  if (!isNotificationDeliveryHttpEnabled()) {
    return jsonDataResponse(
      {
        capability: "unified-notifications-v1",
        enabled: false,
        groups: [],
        total: 0,
        unread: 0,
      },
      context.tracing,
    );
  }

  const svc = getOrCreateNotificationDeliveryService();
  const items = await svc.getInAppNotifications(context.serviceContext, {
    unreadOnly,
  });

  const byProduct = new Map<
    string,
    {
      productId: string;
      productLabel: string;
      items: Array<{
        id: string;
        title: string;
        summary?: string;
        href: string;
        readAt?: string;
        createdAt: string;
        category: string;
        priority: string;
      }>;
    }
  >();

  for (const item of items) {
    const productId = item.sourceProduct;
    const existing = byProduct.get(productId) ?? {
      productId,
      productLabel: productLabel(productId),
      items: [],
    };
    existing.items.push({
      id: item.id,
      title: item.title,
      summary: item.summary,
      href:
        resolveNotificationDeepLink({
          sourceProduct: item.sourceProduct,
          sourceObjectRef: item.sourceObjectRef,
        }) ?? "/workspace/home",
      readAt: item.readAt,
      createdAt: item.createdAt,
      category: item.category,
      priority: item.priority,
    });
    byProduct.set(productId, existing);
  }

  return jsonDataResponse(
    {
      capability: "unified-notifications-v1",
      enabled: true,
      groups: [...byProduct.values()],
      total: items.length,
      unread: items.filter((item) => !item.readAt).length,
    },
    context.tracing,
  );
}
