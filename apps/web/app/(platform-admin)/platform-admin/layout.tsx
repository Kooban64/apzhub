"use client";

import { useSession } from "@apzhub/auth";
import type { ReactNode } from "react";

import { PlatformAdminGate } from "@/components/platform-admin/platform-admin-gate";
import { PlatformAdminShell } from "@/components/platform-admin/platform-admin-shell";

export default function PlatformAdminLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  return (
    <PlatformAdminGate>
      <PlatformAdminShell
        userName={session?.user?.name}
        userEmail={session?.user?.email}
      >
        {children}
      </PlatformAdminShell>
    </PlatformAdminGate>
  );
}
