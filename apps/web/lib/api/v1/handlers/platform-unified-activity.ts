import type { NextRequest } from "next/server";

import {
  activityProductLabel,
  deriveActivityProduct,
  resolveActivityDeepLink,
} from "@/lib/unified-activity/product";
import { loadSharedActivityTimelineContext } from "@/lib/load-shared-activity-timeline-context";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { jsonDataResponse } from "../response";

/**
 * Unified Activity aggregator — groups ATF documents by derived product.
 * SoR remains APS-Activity / Activity Timeline Framework.
 */
export async function handlePlatformUnifiedActivity(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const productFilter = request.nextUrl.searchParams
    .get("product")
    ?.trim()
    .toLowerCase();
  const typeFilter = request.nextUrl.searchParams.get("type")?.trim();
  const since = request.nextUrl.searchParams.get("since")?.trim();
  const until = request.nextUrl.searchParams.get("until")?.trim();

  const timeline = await loadSharedActivityTimelineContext();
  const documents = timeline?.service.listActivities() ?? [];

  const filtered = documents.filter((doc) => {
    const productId = deriveActivityProduct(doc);
    if (productFilter && productId !== productFilter) {
      return false;
    }
    if (typeFilter && doc.activityTypeId !== typeFilter) {
      return false;
    }
    const ts = Date.parse(doc.timestamp);
    if (since && !Number.isNaN(ts) && ts < Date.parse(since)) {
      return false;
    }
    if (until && !Number.isNaN(ts) && ts > Date.parse(until)) {
      return false;
    }
    return true;
  });

  const byProduct = new Map<
    string,
    {
      productId: string;
      productLabel: string;
      items: Array<{
        id: string;
        title: string;
        description: string;
        activityTypeId: string;
        href: string;
        timestamp: string;
        category: string;
      }>;
    }
  >();

  for (const doc of filtered) {
    const productId = deriveActivityProduct(doc);
    const existing = byProduct.get(productId) ?? {
      productId,
      productLabel: activityProductLabel(productId),
      items: [],
    };
    existing.items.push({
      id: doc.activityId,
      title: doc.title,
      description: doc.description,
      activityTypeId: doc.activityTypeId,
      href: resolveActivityDeepLink(doc),
      timestamp: doc.timestamp,
      category: doc.category,
    });
    byProduct.set(productId, existing);
  }

  return jsonDataResponse(
    {
      capability: "unified-activity-v1",
      groups: [...byProduct.values()],
      total: filtered.length,
    },
    context.tracing,
  );
}
