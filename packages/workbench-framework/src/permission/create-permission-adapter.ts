import { createAllowAllWorkbenchPermissionAdapter } from "./allow-all-adapter";
import {
  createAuthWorkbenchPermissionAdapter,
  type AuthSessionPermissionInput,
} from "./auth-permission-adapter";
import type { WorkbenchPermissionAdapter } from "../interfaces/permission-adapter";
import { createScaffoldWorkbenchPermissionAdapter } from "./scaffold-permission-adapter";

export type WorkbenchPermissionAdapterMode = "allow-all" | "auth" | "scaffold";

export interface CreateWorkbenchPermissionAdapterOptions {
  readonly mode?: WorkbenchPermissionAdapterMode;
  readonly authContext?: AuthSessionPermissionInput | null;
  readonly nodeEnv?: string;
  readonly allowDevRegistration?: boolean;
}

export function resolveWorkbenchPermissionAdapterMode(
  options: CreateWorkbenchPermissionAdapterOptions = {},
): WorkbenchPermissionAdapterMode {
  if (options.mode) {
    return options.mode;
  }

  if (options.nodeEnv === "test") {
    return "allow-all";
  }

  if (options.allowDevRegistration) {
    return "allow-all";
  }

  return "auth";
}

export function createWorkbenchPermissionAdapter(
  options: CreateWorkbenchPermissionAdapterOptions = {},
): WorkbenchPermissionAdapter {
  const mode = resolveWorkbenchPermissionAdapterMode(options);

  switch (mode) {
    case "allow-all":
      return createAllowAllWorkbenchPermissionAdapter();
    case "scaffold":
      return createScaffoldWorkbenchPermissionAdapter({
        context: options.authContext
          ? {
              userId: options.authContext.userId,
              roles: options.authContext.roles ?? [],
              permissions: new Set(options.authContext.permissions ?? []),
            }
          : null,
      });
    case "auth":
    default:
      return createAuthWorkbenchPermissionAdapter(options.authContext ?? null);
  }
}
