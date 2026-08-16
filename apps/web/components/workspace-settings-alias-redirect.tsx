"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

/** Legacy `/workspace/settings` bookmark → personalisation centre. */
export function WorkspaceSettingsAliasRedirect() {
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (pathname === "/workspace/settings" || pathname === "/workspace/settings/") {
      router.replace("/workspace/personalisation");
    }
  }, [pathname, router]);
  return null;
}
