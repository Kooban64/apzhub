"use client";

import { useEffect, useState } from "react";

import type { ProductKey } from "@/lib/commercial/catalogue";
import {
  softEvaluateProductAccess,
  type EntitlementSnapshotLike,
  type SoftProductAccess,
} from "@/lib/commercial/soft-product-access";

type HomeContextBody = {
  data?: {
    entitlements?: EntitlementSnapshotLike | null;
  };
};

const lastAccess = new Map<ProductKey, SoftProductAccess>();

/**
 * Soft-gate hook — bootstrap (empty ledger) allows; otherwise reason-aware deny.
 * Last evaluation is kept so desktop↔mobile shell remounts do not flash the gate.
 */
export function useSoftProductAccess(productKey: ProductKey): SoftProductAccess | null {
  const [state, setState] = useState<SoftProductAccess | null>(
    () => lastAccess.get(productKey) ?? null,
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/me/home-context", { cache: "no-store" });
        const body = (await res.json()) as HomeContextBody;
        if (cancelled) return;
        const next = softEvaluateProductAccess(productKey, body.data?.entitlements);
        lastAccess.set(productKey, next);
        setState(next);
      } catch {
        if (!cancelled) {
          const fallback: SoftProductAccess = { status: "allowed" };
          lastAccess.set(productKey, fallback);
          setState(fallback);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productKey]);

  return state;
}
