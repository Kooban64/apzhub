"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import { AppShell } from "@/components/shell/app-shell";
import { SecondaryRail } from "@/components/shell/secondary-rail";
import { getChromeForMode, getShellModeFromPathname } from "@/lib/shell/get-shell-config";

export function ShellLayoutClient({
  children,
  versionLabel,
}: {
  children: ReactNode;
  versionLabel: string;
}) {
  const pathname = usePathname() ?? "/";
  const mode = getShellModeFromPathname(pathname);
  const chrome = getChromeForMode(mode);

  return (
    <AppShell
      versionLabel={versionLabel}
      chrome={chrome}
      pathname={pathname}
      secondaryRail={<SecondaryRail mode={mode} />}
    >
      {children}
    </AppShell>
  );
}
