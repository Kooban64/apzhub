"use client";

import { usePathname } from "next/navigation";
import { Suspense } from "react";

import { resolveAdministrationSection } from "@/lib/administration/routes";

import { ContextLearningSummaryView } from "./context-learning-summary-view";
import { FrictionRegisterView } from "./friction-register-view";
import { PlatformAdministrationView } from "./platform-administration-view";

export function AdministrationWorkspaceRouter() {
  const pathname = usePathname();
  const section = resolveAdministrationSection(pathname);
  if (section === "product-learning") {
    return <ContextLearningSummaryView />;
  }
  if (section === "friction-register") {
    return (
      <Suspense fallback={<p role="status">Loading Friction Register…</p>}>
        <FrictionRegisterView />
      </Suspense>
    );
  }
  return <PlatformAdministrationView section={section} />;
}
