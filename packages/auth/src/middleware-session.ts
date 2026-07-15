export interface MiddlewareSessionPayload {
  readonly session?: { readonly expiresAt: string };
  readonly user?: { readonly id: string };
  readonly tenantId?: string;
}

export function isMiddlewareSessionActive(payload: MiddlewareSessionPayload | null): boolean {
  if (!payload?.session || !payload.user?.id) {
    return false;
  }

  const expiresAt = new Date(payload.session.expiresAt);
  return expiresAt.getTime() > Date.now();
}

/**
 * Edge-safe session resolution for Next.js middleware.
 * Uses Better Auth get-session endpoint; full tenant enrichment occurs in route handlers.
 */
export async function fetchMiddlewareSession(
  request: { readonly headers: { get(name: string): string | null }; readonly nextUrl: { readonly origin: string } },
): Promise<MiddlewareSessionPayload | null> {
  const sessionUrl = new URL("/api/auth/get-session", request.nextUrl.origin);

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
}
