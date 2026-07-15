import type { UserPreferences } from "./personalisation-types";
import { getPersonalisationServiceForSession } from "./personalisation-runtime";
import { getSharedPersonalisationService } from "./index";
import type { PersonalisationService } from "./personalisation-service";

export * from "./index";
export {
  createPostgresPersonalisationService,
  getPersonalisationServiceForSession,
} from "./personalisation-runtime";

export {
  handleDeleteFavorite,
  handleGetFavorites,
  handleGetPersonalisationDiagnostics,
  handleGetPreferences,
  handleGetRecent,
  handleGetWorkbenchLayout,
  handlePatchPreferences,
  handlePostFavorite,
  handlePostRecent,
  handlePutWorkbenchLayout,
} from "./api-handlers";

export interface ResolveSessionPersonalisationInput {
  readonly userId?: string;
  readonly provisionIfEmpty?: boolean;
}

export interface SessionPersonalisationSnapshot {
  readonly preferences: UserPreferences;
}

export async function resolveSessionPersonalisation(
  input: ResolveSessionPersonalisationInput,
): Promise<SessionPersonalisationSnapshot> {
  if (!input.userId) {
    const service = getSharedPersonalisationService();
    return { preferences: await service.getUserPreferences("") };
  }

  const service = await getPersonalisationServiceForSession();
  const preferences = await service.getUserPreferences(input.userId);
  return { preferences };
}

export async function patchSessionPreferences(
  userId: string,
  patch: Parameters<PersonalisationService["patchUserPreferences"]>[1],
): Promise<UserPreferences> {
  const service = await getPersonalisationServiceForSession();
  return service.patchUserPreferences(userId, patch);
}
