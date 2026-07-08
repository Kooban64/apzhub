import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  GET as listCalendarEvents,
  POST as createCalendarEvent,
} from "../../../app/api/law/v1/calendar-events/route";
import {
  GET as getCalendarEvent,
  PATCH as patchCalendarEvent,
  DELETE as cancelCalendarEvent,
} from "../../../app/api/law/v1/calendar-events/[calendarEventId]/route";
import { resetCalendarEventApiMetadataCache } from "@/lib/api/calendar-events";
import {
  authHeaders,
  configureLawApiTestEnv,
  enableDevPermissions,
  mockGetValidatedSession,
  mockIsDevRegistrationAllowed,
  mockSession,
  seedLawApiClientAndMatter,
} from "@/lib/api/testing/law-api-test-helpers";
import {
  resetSharedCalendarEventRepository,
  resetSharedClientRepository,
  resetSharedMatterRepository,
  resetLawPersistenceScope,
} from "@apzhub/law-platform/api";

vi.mock("@apzhub/auth/server", () => ({
  getValidatedSession: (...args: unknown[]) => mockGetValidatedSession(...args),
}));

vi.mock("@apzhub/config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@apzhub/config")>();
  return {
    ...actual,
    isDevRegistrationAllowed: () => mockIsDevRegistrationAllowed(),
  };
});

function calendarEventCreateBody(
  matterId: string,
  overrides: Record<string, unknown> = {},
) {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  const end = new Date(start);
  end.setHours(end.getHours() + 1);

  return {
    title: "Meridian Hearing",
    eventType: "hearing",
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    ownerUserId: mockSession.user.id,
    matterId,
    ...overrides,
  };
}

describe("Law Calendar Event API", () => {
  beforeEach(() => {
    configureLawApiTestEnv();
    resetSharedCalendarEventRepository();
    resetSharedClientRepository();
    resetSharedMatterRepository();
    resetLawPersistenceScope();
    resetCalendarEventApiMetadataCache();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetValidatedSession.mockResolvedValue(null);

    const response = await listCalendarEvents(
      new NextRequest("http://localhost/api/law/v1/calendar-events", { method: "GET" }),
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("UNAUTHENTICATED");
  });

  it("returns 403 when permission is missing", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);
    vi.stubEnv("NODE_ENV", "production");

    const response = await listCalendarEvents(
      new NextRequest("http://localhost/api/law/v1/calendar-events", {
        method: "GET",
        headers: authHeaders(),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("lists calendar events with pagination envelope", async () => {
    enableDevPermissions();
    const { matterId } = seedLawApiClientAndMatter();

    await createCalendarEvent(
      new NextRequest("http://localhost/api/law/v1/calendar-events", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(calendarEventCreateBody(matterId)),
      }),
    );

    const response = await listCalendarEvents(
      new NextRequest("http://localhost/api/law/v1/calendar-events?limit=1", {
        method: "GET",
        headers: authHeaders(),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.pagination.limit).toBe(1);
    expect(body.meta.requestId).toBeTruthy();
  });

  it("filters calendar events by query", async () => {
    enableDevPermissions();
    const { matterId } = seedLawApiClientAndMatter();

    await createCalendarEvent(
      new NextRequest("http://localhost/api/law/v1/calendar-events", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          calendarEventCreateBody(matterId, { title: "Unique Meridian Hearing" }),
        ),
      }),
    );

    const response = await listCalendarEvents(
      new NextRequest("http://localhost/api/law/v1/calendar-events?query=meridian", {
        method: "GET",
        headers: authHeaders(),
      }),
    );
    const body = await response.json();

    expect(
      body.data.some((event: { title: string }) => event.title.includes("Meridian")),
    ).toBe(true);
  });

  it("creates a calendar event and returns 201 envelope", async () => {
    enableDevPermissions();
    const { matterId } = seedLawApiClientAndMatter();

    const response = await createCalendarEvent(
      new NextRequest("http://localhost/api/law/v1/calendar-events", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          calendarEventCreateBody(matterId, { title: "Chen Hearing" }),
        ),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.ok).toBe(true);
    expect(body.data.title).toBe("Chen Hearing");
    expect(body.data.eventType).toBe("hearing");
  });

  it("returns validation error for invalid create body", async () => {
    enableDevPermissions();
    const { matterId } = seedLawApiClientAndMatter();

    const response = await createCalendarEvent(
      new NextRequest("http://localhost/api/law/v1/calendar-events", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(calendarEventCreateBody(matterId, { title: "" })),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION_FAILED");
  });

  it("gets calendar event by id", async () => {
    enableDevPermissions();
    const { matterId } = seedLawApiClientAndMatter();

    const created = await createCalendarEvent(
      new NextRequest("http://localhost/api/law/v1/calendar-events", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          calendarEventCreateBody(matterId, { title: "Get By Id Event" }),
        ),
      }),
    );
    const createdBody = await created.json();

    const response = await getCalendarEvent(
      new NextRequest(
        `http://localhost/api/law/v1/calendar-events/${createdBody.data.calendarEventId}`,
        { method: "GET", headers: authHeaders() },
      ),
      {
        params: Promise.resolve({ calendarEventId: createdBody.data.calendarEventId }),
      },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.calendarEventId).toBe(createdBody.data.calendarEventId);
  });

  it("returns 404 for unknown calendar event", async () => {
    enableDevPermissions();

    const response = await getCalendarEvent(
      new NextRequest("http://localhost/api/law/v1/calendar-events/missing-event-id", {
        method: "GET",
        headers: authHeaders(),
      }),
      { params: Promise.resolve({ calendarEventId: "missing-event-id" }) },
    );

    expect(response.status).toBe(404);
  });

  it("updates a calendar event via PATCH", async () => {
    enableDevPermissions();
    const { matterId } = seedLawApiClientAndMatter();

    const created = await createCalendarEvent(
      new NextRequest("http://localhost/api/law/v1/calendar-events", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          calendarEventCreateBody(matterId, { title: "Patch Target Event" }),
        ),
      }),
    );
    const createdBody = await created.json();
    const calendarEventId = createdBody.data.calendarEventId;

    const response = await patchCalendarEvent(
      new NextRequest(
        `http://localhost/api/law/v1/calendar-events/${calendarEventId}`,
        {
          method: "PATCH",
          headers: authHeaders({ "content-type": "application/json" }),
          body: JSON.stringify({ title: "Updated Event Title" }),
        },
      ),
      { params: Promise.resolve({ calendarEventId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.title).toBe("Updated Event Title");
  });

  it("cancels a calendar event", async () => {
    enableDevPermissions();
    const { matterId } = seedLawApiClientAndMatter();

    const created = await createCalendarEvent(
      new NextRequest("http://localhost/api/law/v1/calendar-events", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          calendarEventCreateBody(matterId, { title: "Cancel Target Event" }),
        ),
      }),
    );
    const createdBody = await created.json();
    const calendarEventId = createdBody.data.calendarEventId;

    const response = await cancelCalendarEvent(
      new NextRequest(
        `http://localhost/api/law/v1/calendar-events/${calendarEventId}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        },
      ),
      { params: Promise.resolve({ calendarEventId }) },
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.status).toBe("cancelled");
    expect(body.data.calendarEventId).toBe(calendarEventId);
  });

  it("paginates with cursor", async () => {
    enableDevPermissions();
    const { matterId } = seedLawApiClientAndMatter();

    for (const title of ["Alpha Event", "Beta Event", "Gamma Event"]) {
      await createCalendarEvent(
        new NextRequest("http://localhost/api/law/v1/calendar-events", {
          method: "POST",
          headers: authHeaders({ "content-type": "application/json" }),
          body: JSON.stringify(calendarEventCreateBody(matterId, { title })),
        }),
      );
    }

    const first = await listCalendarEvents(
      new NextRequest(
        "http://localhost/api/law/v1/calendar-events?limit=1&sort=title",
        {
          method: "GET",
          headers: authHeaders(),
        },
      ),
    );
    const firstBody = await first.json();
    expect(firstBody.pagination.hasMore).toBe(true);

    const second = await listCalendarEvents(
      new NextRequest(
        `http://localhost/api/law/v1/calendar-events?limit=1&sort=title&cursor=${firstBody.pagination.nextCursor}`,
        { method: "GET", headers: authHeaders() },
      ),
    );
    const secondBody = await second.json();

    expect(secondBody.data[0]?.calendarEventId).not.toBe(
      firstBody.data[0]?.calendarEventId,
    );
  });

  it("retrieves a created calendar event in the same tenant", async () => {
    enableDevPermissions();
    const { matterId } = seedLawApiClientAndMatter();

    const created = await createCalendarEvent(
      new NextRequest("http://localhost/api/law/v1/calendar-events", {
        method: "POST",
        headers: authHeaders({ "content-type": "application/json" }),
        body: JSON.stringify(
          calendarEventCreateBody(matterId, { title: "Same Tenant Persistence Event" }),
        ),
      }),
    );
    const createdBody = await created.json();
    const calendarEventId = createdBody.data.calendarEventId;

    const response = await getCalendarEvent(
      new NextRequest(
        `http://localhost/api/law/v1/calendar-events/${calendarEventId}`,
        {
          method: "GET",
          headers: authHeaders(),
        },
      ),
      { params: Promise.resolve({ calendarEventId }) },
    );

    expect(response.status).toBe(200);
  });
});
