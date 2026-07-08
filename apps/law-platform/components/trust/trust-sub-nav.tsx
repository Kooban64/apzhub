"use client";

import Link from "next/link";

import { lawUxTokens } from "../ux";
import type { TrustRouteKind } from "../../lib/trust/trust-routes";
import { TRUST_SUB_ROUTES } from "../../lib/trust/trust-routes";

export interface TrustSubNavProps {
  readonly active: TrustRouteKind;
}

/** Trust module sub-navigation across workbench views (LAW-015-09). */
export function TrustSubNav({ active }: TrustSubNavProps) {
  return (
    <nav
      aria-label="Trust Accounting navigation"
      className={`${lawUxTokens.surface} flex flex-wrap gap-2 border p-3`}
      data-testid="trust-sub-nav"
    >
      {TRUST_SUB_ROUTES.map((item) => {
        const isActive = item.kind === active;

        return (
          <Link
            key={item.kind}
            href={item.route}
            className={`rounded-md px-3 py-1.5 text-sm ${
              isActive
                ? "bg-[var(--law-accent)] text-[var(--law-accent-foreground)]"
                : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            }`}
            data-testid={`trust-sub-nav-${item.kind}`}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
