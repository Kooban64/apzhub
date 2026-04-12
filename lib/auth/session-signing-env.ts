/**
 * Env-only session signing secret (no `fs`) — safe for `proxy` / shared decode graphs.
 * Docker: `deploy/docker/entrypoint.sh` exports `APZHUB_SESSION_SIGNING_SECRET` from
 * `APZHUB_SESSION_SIGNING_SECRET_FILE` so this matches `resolveSessionSigningSecret()`.
 */
export function getSessionSigningSecretFromEnv(): string | undefined {
  const v = process.env.APZHUB_SESSION_SIGNING_SECRET?.trim();
  return v && v.length >= 32 ? v : undefined;
}
