"use client";

import type { ReactNode } from "react";

import { ProductAccessDeniedView } from "@/components/commercial/product-access-denied";
import type { ProductKey } from "@/lib/commercial/catalogue";
import { useSoftProductAccess } from "@/lib/commercial/use-soft-product-access";

/**
 * Soft commercial entitlement gate for APZPRD product routers.
 * Mirrors Projects / QEP — empty ledger soft-open only when bootstrap/test allows.
 */
export function SoftProductGate({
  productKey,
  productLabel,
  loading,
  children,
}: {
  readonly productKey: ProductKey;
  readonly productLabel: string;
  readonly loading: ReactNode;
  readonly children: ReactNode;
}) {
  const productAccess = useSoftProductAccess(productKey);

  if (productAccess === null) {
    return loading;
  }
  if (productAccess.status === "denied") {
    return (
      <ProductAccessDeniedView
        productKey={productAccess.productKey}
        reason={productAccess.reason}
        breadcrumbs={[productLabel, "Product required"]}
      />
    );
  }
  return children;
}
