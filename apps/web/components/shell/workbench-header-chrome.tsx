"use client";

import { TenantSwitcher } from "@/components/operator/tenant-switcher";
import { ProductSwitcher } from "@/components/shell/product-switcher";

/** Stream 5 header chrome — Org ▼ + Product ▼ (entitled only). */
export function WorkbenchHeaderChrome() {
  return (
    <div
      className="flex min-w-0 items-center gap-1"
      data-testid="workbench-header-chrome"
    >
      <TenantSwitcher />
      <ProductSwitcher />
    </div>
  );
}
