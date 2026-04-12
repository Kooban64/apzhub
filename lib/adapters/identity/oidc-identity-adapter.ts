import type { IdentityAdapter, IdentityLoginContext } from "@/lib/adapters/identity/types";

/**
 * Password login is disabled; operators use `/api/auth/oidc/authorize` → callback → session cookie.
 */
export function createOidcIdentityAdapter(): IdentityAdapter {
  return {
    kind: "oidc",
    getHealth() {
      const issuer = process.env.APZHUB_OIDC_ISSUER?.trim();
      const clientId = process.env.APZHUB_OIDC_CLIENT_ID?.trim();
      const redirect = process.env.APZHUB_OIDC_REDIRECT_URI?.trim();
      if (!issuer || !clientId || !redirect) {
        return {
          domain: "identity",
          signal: "misconfigured",
          detail: "OIDC enabled but APZHUB_OIDC_ISSUER / CLIENT_ID / REDIRECT_URI incomplete.",
        };
      }
      return { domain: "identity", signal: "healthy", detail: "OIDC issuer and client configured." };
    },
    async loginWithPassword(email: string, password: string, ctx?: IdentityLoginContext) {
      void email;
      void password;
      void ctx;
      return {
        ok: false,
        error: "Password sign-in is disabled. Use organization SSO.",
        ssoAuthorizePath: "/api/auth/oidc/authorize",
      };
    },
  };
}
