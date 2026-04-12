import type { ReactNode } from "react";

import { ShellLayoutClient } from "@/components/shell/shell-layout-client";
import packageJson from "../../package.json";

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return (
    <ShellLayoutClient versionLabel={`v${packageJson.version}`}>{children}</ShellLayoutClient>
  );
}
