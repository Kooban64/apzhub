import { describe, expect, it } from "vitest";

import {
  isMiddlewareSessionActive,
  resolveMiddlewareSessionOrigin,
} from "./middleware-session";

describe("middleware-session origin", () => {
  it("keeps loopback request origins", () => {
    expect(
      resolveMiddlewareSessionOrigin("http://127.0.0.1:3300", { PORT: "3300" }),
    ).toBe("http://127.0.0.1:3300");
    expect(resolveMiddlewareSessionOrigin("http://localhost:3300", {})).toBe(
      "http://localhost:3300",
    );
  });

  it("rewrites public hosts to loopback for Edge self-fetch", () => {
    expect(
      resolveMiddlewareSessionOrigin("https://apzhub.apzportal.apzor.com", {
        PORT: "3300",
      }),
    ).toBe("http://127.0.0.1:3300");
  });

  it("honours AUTH_INTERNAL_ORIGIN override", () => {
    expect(
      resolveMiddlewareSessionOrigin("https://apzhub.apzportal.apzor.com", {
        AUTH_INTERNAL_ORIGIN: "http://127.0.0.1:3300/",
        PORT: "9999",
      }),
    ).toBe("http://127.0.0.1:3300");
  });

  it("detects active sessions by expiry", () => {
    expect(
      isMiddlewareSessionActive({
        session: { expiresAt: new Date(Date.now() + 60_000).toISOString() },
        user: { id: "u1" },
      }),
    ).toBe(true);
    expect(
      isMiddlewareSessionActive({
        session: { expiresAt: new Date(Date.now() - 60_000).toISOString() },
        user: { id: "u1" },
      }),
    ).toBe(false);
  });
});
