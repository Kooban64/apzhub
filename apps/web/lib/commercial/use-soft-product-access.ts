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

/**
 * Soft-gate hook — bootstrap (empty ledger) allows; otherwise reason-aware deny.
 */
export function useSoftProductAccess(productKey: ProductKey): SoftProductAccess | null {
  const [state, setState] = useState<SoftProductAccess | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/me/home-context", { cache: "no-store" });
        const body = (await res.json()) as HomeContextBody;
        if (cancelled) return;
        setState(softEvaluateProductAccess(productKey, body.data?.entitlements));
      } catch {
        if (!cancelled) setState({ status: "allowed" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [productKey]);

  return state;
}
