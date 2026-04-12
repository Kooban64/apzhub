import type { ReactNode } from "react";

import { AdminAccessDatasourceBanner } from "@/features/admin/admin-access-datasource-banner";
import { AdminRightPanelRegistrar } from "@/features/admin/admin-right-panel-registrar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AdminRightPanelRegistrar />
      <AdminAccessDatasourceBanner />
      {children}
    </>
  );
}
