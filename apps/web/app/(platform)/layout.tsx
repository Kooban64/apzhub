import { loadActionRegistryDto } from "@/lib/command-hydration";
import { loadWorkbenchRegistryDto } from "@/lib/workbench-hydration";

import { ActionWorkbenchShellProvider } from "./action-workbench-shell-provider";

export default async function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [registry, commandHydration] = await Promise.all([
    loadWorkbenchRegistryDto(),
    loadActionRegistryDto(),
  ]);

  return (
    <div className="flex h-full min-h-screen flex-col">
      <ActionWorkbenchShellProvider
        registry={registry}
        commandDto={commandHydration.dto}
        commandDiagnostics={commandHydration.diagnostics}
      >
        {children}
      </ActionWorkbenchShellProvider>
    </div>
  );
}
