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

/**
 * Edge-safe session resolution for Next.js middleware.
 * Uses Better Auth get-session endpoint; full tenant enrichment occurs in route handlers.
 */
export async function fetchMiddlewareSession(request: {
  readonly headers: { get(name: string): string | null };
  readonly nextUrl: { readonly origin: string };
}): Promise<MiddlewareSessionPayload | null> {
  const origin = resolveMiddlewareSessionOrigin(request.nextUrl.origin);
  const sessionUrl = new URL("/api/auth/get-session", origin);

  try {
    const response = await fetch(sessionUrl, {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as MiddlewareSessionPayload | null;
    return isMiddlewareSessionActive(data) ? data : null;
  } catch {
    // Edge/public-host self-fetch failures must not 500 HTML pages — treat as signed out.
    return null;
  }
}
