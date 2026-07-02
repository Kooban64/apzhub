import { createAuth } from "./server";

export type ValidatedSession = NonNullable<
  Awaited<ReturnType<ReturnType<typeof createAuth>["api"]["getSession"]>>
>;

function isSessionActive(session: ValidatedSession["session"]): boolean {
  const expiresAt = new Date(session.expiresAt);
  return expiresAt.getTime() > Date.now();
}

/**
 * Validates the current session against Better Auth (database-backed).
 * Confirms session exists, user exists, expiration, and revocation state.
 */
export async function getValidatedSession(
  headers: Headers,
): Promise<ValidatedSession | null> {
  const auth = createAuth();
  const result = await auth.api.getSession({ headers });

  if (!result?.session || !result?.user) {
    return null;
  }

  if (!isSessionActive(result.session)) {
    return null;
  }

  return result;
}
