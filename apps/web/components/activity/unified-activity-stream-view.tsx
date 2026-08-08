"use client";

import { useActivityService } from "@apzhub/activity-timeline-framework/react";
import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  activityProductLabel,
  deriveActivityProduct,
  resolveActivityDeepLink,
} from "@/lib/unified-activity/product";

function formatWhen(value: string): string {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function UnifiedActivityStreamView() {
  const router = useRouter();
  const { listActivities } = useActivityService();
  const [productFilter, setProductFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [since, setSince] = useState("");

  const all = listActivities();

  const products = useMemo(() => {
    return [...new Set(all.map((doc) => deriveActivityProduct(doc)))].sort();
  }, [all]);

  const types = useMemo(() => {
    return [...new Set(all.map((doc) => doc.activityTypeId))].sort();
  }, [all]);

  const filtered = useMemo(() => {
    return all.filter((doc) => {
      const productId = deriveActivityProduct(doc);
      if (productFilter !== "all" && productId !== productFilter) {
        return false;
      }
      if (typeFilter !== "all" && doc.activityTypeId !== typeFilter) {
        return false;
      }
      if (since) {
        const ts = Date.parse(doc.timestamp);
        const from = Date.parse(since);
        if (!Number.isNaN(ts) && !Number.isNaN(from) && ts < from) {
          return false;
        }
      }
      return true;
    });
  }, [all, productFilter, since, typeFilter]);

  const groups = useMemo(() => {
    const map = new Map<
      string,
      { productId: string; productLabel: string; items: typeof filtered }
    >();
    for (const doc of filtered) {
      const productId = deriveActivityProduct(doc);
      const existing = map.get(productId) ?? {
        productId,
        productLabel: activityProductLabel(productId),
        items: [],
      };
      existing.items = [...existing.items, doc];
      map.set(productId, existing);
    }
    return [...map.values()];
  }, [filtered]);

  return (
    <div className="flex flex-col gap-6 p-1" data-testid="unified-activity-stream">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            APS-Activity
          </p>
          <h1 className="text-2xl font-semibold">Activity Stream</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Cross-product activity · {filtered.length} events
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-[var(--color-muted-foreground)]">
            Product
            <select
              className="ml-2 rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              value={productFilter}
              onChange={(event) => setProductFilter(event.target.value)}
              data-testid="activity-product-filter"
            >
              <option value="all">All</option>
              {products.map((product) => (
                <option key={product} value={product}>
                  {activityProductLabel(product)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-[var(--color-muted-foreground)]">
            Type
            <select
              className="ml-2 rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              data-testid="activity-type-filter"
            >
              <option value="all">All</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-[var(--color-muted-foreground)]">
            Since
            <input
              type="date"
              className="ml-2 rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              value={since}
              onChange={(event) => setSince(event.target.value)}
              data-testid="activity-since-filter"
            />
          </label>
        </div>
      </header>

      {groups.length === 0 ? (
        <div
          className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-10 text-center"
          data-testid="activity-stream-empty"
        >
          <p className="font-medium">No activity yet</p>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Platform and product events will appear here as they occur.
          </p>
        </div>
      ) : (
        groups.map((group) => (
          <section key={group.productId} className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
              {group.productLabel}
            </h2>
            <ul className="flex flex-col gap-2">
              {group.items.map((doc) => (
                <li
                  key={doc.activityId}
                  className="rounded-lg border border-[var(--color-border)] px-3 py-3"
                  data-testid="activity-stream-item"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{doc.title}</p>
                      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                        {doc.description}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                        {doc.activityTypeId} · {formatWhen(doc.timestamp)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      data-testid="activity-open-product"
                      onClick={() => router.push(resolveActivityDeepLink(doc))}
                    >
                      Open
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
