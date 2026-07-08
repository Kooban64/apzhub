import { NextResponse, type NextRequest } from "next/server";

const publicPaths = ["/login", "/register", "/forgot-password", "/api/health"];

/** Paths reachable without session (Law API public endpoints + developer docs). */
function isPublicPath(pathname: string): boolean {
  if (publicPaths.some((p) => pathname === p || pathname.startsWith("/api/auth"))) {
    return true;
  }

  if (pathname === "/api/law/v1/health" || pathname.startsWith("/api/law/v1/openapi")) {
    return true;
  }

  if (pathname === "/api/docs" || pathname.startsWith("/api/docs/")) {
    return true;
  }

  if (pathname === "/docs" || pathname.startsWith("/docs/")) {
    return true;
  }

  if (pathname.startsWith("/specs/collections")) {
    return true;
  }

  return false;
}

type SessionPayload = {
  session?: { expiresAt: string };
  user?: { id: string };
};

async function fetchValidatedSession(
  request: NextRequest,
): Promise<SessionPayload | null> {
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

  const data = (await response.json()) as SessionPayload | null;

  if (!data?.session || !data?.user) {
    return null;
  }

  const expiresAt = new Date(data.session.expiresAt);
  if (expiresAt.getTime() <= Date.now()) {
    return null;
  }

  return data;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const session = await fetchValidatedSession(request);
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
