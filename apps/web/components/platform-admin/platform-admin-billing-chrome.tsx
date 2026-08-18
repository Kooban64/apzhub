"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BILLING_SUBNAV, PLATFORM_ADMIN_BASE } from "@/lib/platform-admin/nav";

export function PlatformAdminBillingChrome({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-3 p-4" data-testid="platform-admin-billing">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Billing</h1>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          Commercial catalogue and pricing control plane
        </p>
      </div>
      <nav
        className="flex flex-wrap gap-1 border-b border-[var(--color-border)] pb-2"
        aria-label="Billing sections"
        data-testid="billing-subnav"
      >
        {BILLING_SUBNAV.map((item) => {
          const active =
            item.id === "overview"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`rounded px-2.5 py-1.5 text-xs ${
                active ? "bg-[var(--color-muted)] font-medium" : "opacity-70"
              }`}
              data-testid={`billing-tab-${item.id}`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}

export { PLATFORM_ADMIN_BASE };
