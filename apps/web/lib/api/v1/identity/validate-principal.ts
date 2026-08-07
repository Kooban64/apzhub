/**
 * P2 — validate Projects ownership principals against Platform Identity
 * and Enterprise Delivery Team Directory.
 * Rejects free-text / unknown principals on write paths.
 */

import {
  createProjectsTeamDirectoryService,
  getMemoryProjectsTeamDirectoryStore,
  setProjectsTeamDirectoryStoreForTests,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import {
  getPlatformApiGatewayBootstrap,
  getPlatformServiceGateway,
} from "../gateway/bootstrap";

export class InvalidPrincipalError extends Error {
  readonly code = "INVALID_PRINCIPAL";
  constructor(readonly principalId: string) {
    super(`invalid_principal:${principalId}`);
    this.name = "InvalidPrincipalError";
  }
}

/**
 * When Identity platform services are enabled, require the user id to exist.
 * When Identity is disabled (local/dev without directory), accept non-empty ids.
 */
export async function assertValidUserPrincipal(
  context: PlatformApiRequestContext,
  principalId: string | undefined | null,
  options?: { readonly required?: boolean },
): Promise<void> {
  const id = principalId?.trim() ?? "";
  if (!id) {
    if (options?.required) {
      throw new InvalidPrincipalError("(empty)");
    }
    return;
  }

  let identityEnabled = false;
  try {
    const bootstrap = await getPlatformApiGatewayBootstrap();
    identityEnabled = bootstrap.identityEnabled;
  } catch {
    return;
  }

  if (!identityEnabled) {
    return;
  }

  try {
    const gateway = await getPlatformServiceGateway();
    await gateway.identity.users.get(context.serviceContext, id as never);
  } catch (error) {
    if (error instanceof InvalidPrincipalError) throw error;
    throw new InvalidPrincipalError(id);
  }
}

function teamDirectory() {
  try {
    return createProjectsTeamDirectoryService();
  } catch {
    setProjectsTeamDirectoryStoreForTests(getMemoryProjectsTeamDirectoryStore());
    return createProjectsTeamDirectoryService(getMemoryProjectsTeamDirectoryStore());
  }
}

/**
 * Validate deliveryTeamId against Enterprise Delivery Team Directory (not Identity Groups).
 */
export async function assertValidDeliveryTeamPrincipal(
  context: PlatformApiRequestContext,
  teamId: string | undefined | null,
  options?: { readonly required?: boolean },
): Promise<void> {
  const id = teamId?.trim() ?? "";
  if (!id) {
    if (options?.required) {
      throw new InvalidPrincipalError("(empty)");
    }
    return;
  }
  const team = await teamDirectory().getTeam(context.serviceContext, id);
  if (!team || team.status !== "active") {
    throw new InvalidPrincipalError(id);
  }
}
