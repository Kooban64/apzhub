"use client";

import { useSession } from "@apzhub/auth";
import type { ReactNode } from "react";

import { OrganisationAdminGate } from "@/components/organisation-admin/organisation-admin-gate";
import { OrganisationAdminShell } from "@/components/organisation-admin/organisation-admin-shell";

export default function OrganisationAdminLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  return (
    <OrganisationAdminGate>
      {(permissions) => (
        <OrganisationAdminShell
          userName={session?.user?.name}
          userEmail={session?.user?.email}
          permissions={permissions}
        >
          {children}
        </OrganisationAdminShell>
      )}
    </OrganisationAdminGate>
  );
}
