import { getPersonalisationServiceForSession } from "./personalisation-runtime";

export interface PersonalisationSessionUser {
  readonly id: string;
}

export interface PersonalisationSession {
  readonly user: PersonalisationSessionUser;
}

type SessionResolver = () => Promise<PersonalisationSession | null>;

function unauthorized(): Response {
  return Response.json(
    { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
    { status: 401 },
  );
}

export async function handleGetPreferences(resolveSession: SessionResolver): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const service = await getPersonalisationServiceForSession();
  const preferences = await service.getUserPreferences(session.user.id);
  return Response.json({ data: preferences });
}

export async function handlePatchPreferences(
  resolveSession: SessionResolver,
  request: Request,
): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const body = (await request.json()) as Record<string, unknown>;
  const service = await getPersonalisationServiceForSession();
  const preferences = await service.patchUserPreferences(session.user.id, body);
  return Response.json({ data: preferences });
}

export async function handleGetFavorites(resolveSession: SessionResolver): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const service = await getPersonalisationServiceForSession();
  const favorites = await service.favorites.listFavorites(session.user.id);
  return Response.json({ data: favorites, meta: { count: favorites.length } });
}

export async function handlePostFavorite(
  resolveSession: SessionResolver,
  request: Request,
): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const body = (await request.json()) as {
    itemType?: string;
    itemKey?: string;
    label?: string;
    metadata?: Record<string, unknown>;
  };

  if (!body.itemType || !body.itemKey || !body.label) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "itemType, itemKey, and label are required.",
        },
      },
      { status: 400 },
    );
  }

  const service = await getPersonalisationServiceForSession();
  const favorite = await service.favorites.addFavorite({
    userId: session.user.id,
    itemType: body.itemType,
    itemKey: body.itemKey,
    label: body.label,
    metadata: body.metadata,
  });

  return Response.json({ data: favorite }, { status: 201 });
}

export async function handleDeleteFavorite(
  resolveSession: SessionResolver,
  request: Request,
): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const favoriteId = searchParams.get("favoriteId");
  if (!favoriteId) {
    return Response.json(
      { error: { code: "VALIDATION_ERROR", message: "favoriteId query parameter is required." } },
      { status: 400 },
    );
  }

  const service = await getPersonalisationServiceForSession();
  const removed = await service.favorites.removeFavorite(session.user.id, favoriteId);
  return Response.json({ data: { removed } });
}

export async function handleGetRecent(resolveSession: SessionResolver): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const service = await getPersonalisationServiceForSession();
  const recent = await service.recentItems.listRecentItems(session.user.id);
  return Response.json({ data: recent, meta: { count: recent.length } });
}

export async function handlePostRecent(
  resolveSession: SessionResolver,
  request: Request,
): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const body = (await request.json()) as {
    itemType?: string;
    itemKey?: string;
    label?: string;
  };

  if (!body.itemType || !body.itemKey || !body.label) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "itemType, itemKey, and label are required.",
        },
      },
      { status: 400 },
    );
  }

  const service = await getPersonalisationServiceForSession();
  const item = await service.recentItems.trackRecentItem({
    userId: session.user.id,
    itemType: body.itemType,
    itemKey: body.itemKey,
    label: body.label,
  });

  return Response.json({ data: item }, { status: 201 });
}

export async function handleGetPersonalisationDiagnostics(
  resolveSession: SessionResolver,
): Promise<Response> {
  const session = await resolveSession();
  const { getSharedPersonalisationService } = await import("./index");
  const inMemoryService = getSharedPersonalisationService();
  const inMemoryDiagnostics = await inMemoryService.getDiagnostics();

  let postgresDiagnostics: Awaited<
    ReturnType<
      typeof import("./postgres-personalisation-store").getPostgresPersonalisationDiagnostics
    >
  > | null = null;
  if (process.env.DATABASE_URL) {
    try {
      const { getPostgresPersonalisationDiagnostics } = await import(
        "./postgres-personalisation-store"
      );
      postgresDiagnostics = await getPostgresPersonalisationDiagnostics();
    } catch {
      postgresDiagnostics = null;
    }
  }

  const sessionService = session?.user?.id
    ? await getPersonalisationServiceForSession()
    : null;
  const sessionPreferences = session?.user?.id
    ? await sessionService!.getUserPreferences(session.user.id)
    : null;

  return Response.json({
    data: {
      diagnostics: {
        inMemory: inMemoryDiagnostics,
        postgres: postgresDiagnostics,
      },
      session: session
        ? {
            userId: session.user.id,
            preferences: sessionPreferences,
          }
        : null,
    },
  });
}

export async function handleGetWorkbenchLayout(
  resolveSession: SessionResolver,
): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const service = await getPersonalisationServiceForSession();
  const layout = await service.workbenchLayout.getLayout(session.user.id);
  return Response.json({ data: layout ?? null });
}

export async function handlePutWorkbenchLayout(
  resolveSession: SessionResolver,
  request: Request,
): Promise<Response> {
  const session = await resolveSession();
  if (!session?.user?.id) {
    return unauthorized();
  }

  const body = (await request.json()) as Record<string, unknown>;
  const validation = validateWorkbenchLayoutPayload(body);
  if (!validation.ok) {
    return Response.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: validation.errors.join("; "),
        },
      },
      { status: 400 },
    );
  }

  const service = await getPersonalisationServiceForSession();
  const layout = await service.workbenchLayout.saveLayout(session.user.id, body);
  return Response.json({ data: layout });
}

function validateWorkbenchLayoutPayload(
  body: Record<string, unknown>,
): { ok: true } | { ok: false; errors: string[] } {
  if (body.schemaVersion !== "1.0") {
    return { ok: false, errors: ['schemaVersion must be "1.0"'] };
  }
  if (typeof body.activeWorkspace !== "string" || body.activeWorkspace.length === 0) {
    return { ok: false, errors: ["activeWorkspace must be a non-empty string"] };
  }
  if (typeof body.capturedAt !== "string" || Number.isNaN(Date.parse(body.capturedAt))) {
    return { ok: false, errors: ["capturedAt must be a valid ISO timestamp"] };
  }
  return { ok: true };
}
