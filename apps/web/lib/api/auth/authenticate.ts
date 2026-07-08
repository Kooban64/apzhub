import { getValidatedSession, type ValidatedSession } from "@apzhub/auth/server";

export interface LawApiAuthenticationResult {
  readonly authenticated: boolean;
  readonly session: ValidatedSession | null;
}

/** Resolve Platform authentication from incoming request headers (LAW-014-02). */
export async function authenticateLawApiRequest(
  headers: Headers,
): Promise<LawApiAuthenticationResult> {
  const session = await getValidatedSession(headers);

  return {
    authenticated: session !== null,
    session,
  };
}
