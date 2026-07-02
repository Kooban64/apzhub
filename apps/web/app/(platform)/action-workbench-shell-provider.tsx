"use client";

import { useSession } from "@apzhub/auth";
import type { ActionExecutor } from "@apzhub/command-framework";
import type { ActionRegistryDto } from "@apzhub/command-framework/server";
import { CommandRegistryProvider } from "@apzhub/command-framework/react";
import type { ActionRegistryHydrationDiagnostics } from "@apzhub/command-framework/server";
import { WorkbenchProvider } from "@apzhub/workbench-framework/react";
import type { WorkbenchRegistryDto } from "@apzhub/workbench-framework/server";
import { useCallback, useState, type ReactNode } from "react";

import { ActionFrameworkDiagnostics } from "@/components/action-framework-diagnostics";
import { createAppActionExecutorBundle } from "@/lib/create-app-action-executor";

export interface ActionWorkbenchShellProviderProps {
  readonly registry: WorkbenchRegistryDto;
  readonly commandDto: ActionRegistryDto;
  readonly commandDiagnostics: ActionRegistryHydrationDiagnostics;
  readonly children: ReactNode;
}

export function ActionWorkbenchShellProvider({
  registry,
  commandDto,
  commandDiagnostics,
  children,
}: ActionWorkbenchShellProviderProps) {
  const { data: session } = useSession();
  const [actionExecutor, setActionExecutor] = useState<ActionExecutor | null>(null);

  const resolveActionExecutor = useCallback(
    (context: {
      publish: (
        request: import("@apzhub/workbench-framework").WorkbenchRequest,
      ) => import("@apzhub/workbench-framework").WorkbenchRequestResult;
      permissionAdapter: import("@apzhub/workbench-framework").WorkbenchPermissionAdapter;
    }) => {
      const bundle = createAppActionExecutorBundle({
        dto: commandDto,
        permissionAdapter: context.permissionAdapter,
        publish: context.publish,
      });
      setActionExecutor(bundle.actionExecutor);
      return bundle.workbenchActionExecutor;
    },
    [commandDto],
  );

  return (
    <WorkbenchProvider
      initialRegistry={registry}
      userId={session?.user.id}
      resolveActionExecutor={resolveActionExecutor}
    >
      {actionExecutor ? (
        <CommandRegistryProvider dto={commandDto} executor={actionExecutor}>
          {children}
          <ActionFrameworkDiagnostics
            diagnostics={commandDiagnostics}
            userId={session?.user.id}
          />
        </CommandRegistryProvider>
      ) : null}
    </WorkbenchProvider>
  );
}
