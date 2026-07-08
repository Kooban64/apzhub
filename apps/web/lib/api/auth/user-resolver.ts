import type { ValidatedSession } from "@apzhub/auth/server";

export interface LawApiUser {
  readonly userId: string;
  readonly email: string;
  readonly name: string;
  readonly emailVerified: boolean;
}

/** Map Better Auth session to Law API user (LAW-014-02). */
export function resolveLawApiUser(
  session: ValidatedSession | null | undefined,
): LawApiUser | undefined {
  if (!session?.user) {
    return undefined;
  }

  return {
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    emailVerified: session.user.emailVerified,
  };
}
