export interface MiddlewareSessionPayload {
  readonly session?: { readonly expiresAt: string };
  readonly user?: { readonly id: string };
  readonly tenantId?: string;
}

export function isMiddlewareSessionActive(
  payload: MiddlewareSessionPayload | null,
): boolean {
  if (!payload?.session || !payload.user?.id) {
    return false;
  }

  const expiresAt = new Date(payload.session.expiresAt);
  return expiresAt.getTime() > Date.now();
}

/**
 * Origin used for Edge middleware → get-session self-fetch.
 * Prefer loopback so public HTTPS hosts (nginx hairpin / Edge sandbox) do not 500.
 */
export function resolveMiddlewareSessionOrigin(
  requestOrigin: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const configured = env.AUTH_INTERNAL_ORIGIN?.trim() || env.AUTH_INTERNAL_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const port = env.PORT?.trim() || "3300";
  try {
    const url = new URL(requestOrigin);
    const isLoopback =
      url.hostname === "localhost" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "::1";
    if (isLoopback) {
      return requestOrigin.replace(/\/$/, "");
    }
  } catch {
    // fall through to loopback default
  }

  return `http://127.0.0.1:${port}`;
}

export type MiddlewareSessionResult =
  | { readonly kind: "session"; readonly session: MiddlewareSessionPayload }
  | { readonly kind: "none" }
  | { readonly kind: "transient" };

/**
 * Edge-safe session resolution for Next.js middleware.
 * Uses Better Auth get-session endpoint; full tenant enrichment occurs in route handlers.
 *
 * Distinguishes hard “no session” from transient failures (429 / 5xx / network)
 * so middleware does not bounce authenticated users to /login when cookies are
 * present but get-session is briefly unavailable.
 */
export async function resolveMiddlewareSession(request: {
  readonly headers: { get(name: string): string | null };
  readonly nextUrl: { readonly origin: string };
}): Promise<MiddlewareSessionResult> {
  const origin = resolveMiddlewareSessionOrigin(request.nextUrl.origin);
  const sessionUrl = new URL("/api/auth/get-session", origin);
  const cookie = request.headers.get("cookie") ?? "";
  const hasAuthCookie = /better-auth\.session/i.test(cookie);

  try {
    let response: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      response = await fetch(sessionUrl, {
        method: "GET",
        headers: { cookie },
        cache: "no-store",
      });
      if (response.status !== 429 && response.status < 500) {
        break;
      }
      await new Promise((r) => setTimeout(r, 150 * (attempt + 1)));
    }

    if (!response) {
      return hasAuthCookie ? { kind: "transient" } : { kind: "none" };
    }

    if (response.status === 429 || response.status >= 500) {
      return hasAuthCookie ? { kind: "transient" } : { kind: "none" };
    }

    if (!response.ok) {
      return { kind: "none" };
    }

    const data = (await response.json()) as MiddlewareSessionPayload | null;
    if (isMiddlewareSessionActive(data)) {
      return { kind: "session", session: data as MiddlewareSessionPayload };
    }
    return { kind: "none" };
  } catch {
    // Edge/public-host self-fetch failures must not 500 HTML pages.
    return hasAuthCookie ? { kind: "transient" } : { kind: "none" };
  }
}

/**
 * @deprecated Prefer {@link resolveMiddlewareSession} — retained for callers that
 * only need a session payload (treats transient failures as signed out).
 */
export async function fetchMiddlewareSession(request: {
  readonly headers: { get(name: string): string | null };
  readonly nextUrl: { readonly origin: string };
}): Promise<MiddlewareSessionPayload | null> {
  const result = await resolveMiddlewareSession(request);
  return result.kind === "session" ? result.session : null;
}
