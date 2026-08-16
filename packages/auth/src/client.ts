import { createAuthClient } from "better-auth/react";

/**
 * Prefer the browsing origin so CSP `connect-src 'self'` works when the app is
 * reached via 127.0.0.1 / localhost while NEXT_PUBLIC_APP_URL is the public host
 * (or the reverse). Absolute cross-origin auth URLs break login in production CSP.
 */
function resolveAuthClientBaseURL(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.BETTER_AUTH_URL?.trim() ||
    "http://localhost:3300"
  );
}

export const authClient = createAuthClient({
  baseURL: resolveAuthClientBaseURL(),
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
  requestPasswordReset,
  resetPassword,
} = authClient;
