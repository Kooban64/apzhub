"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { toApzpenWorkbenchPath } from "@/lib/apzpen/workbench-routes";

/** Redirects legacy `/apzpen/*` bookmarks into Workbench `/workspace/pen/*`. */
export function ApzpenLegacyClientRedirect() {
  const pathname = usePathname() ?? "/apzpen";
  const search = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!pathname.startsWith("/apzpen")) return;
    const next = toApzpenWorkbenchPath(pathname);
    const qs = search?.toString();
    router.replace(qs ? `${next}?${qs}` : next);
  }, [pathname, router, search]);

  return null;
}
