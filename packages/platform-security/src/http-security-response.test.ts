import { describe, expect, it } from "vitest";

import { jsonPlatformResponse } from "./http-security-response";
import { HTTP_SECURITY_HEADER_NAMES } from "./http-security-header-types";

describe("http-security-response", () => {
  it("applies API security headers to platform JSON responses", () => {
    const response = jsonPlatformResponse({ ok: true }, { status: 200 }, "api", "web");

    expect(response.headers.get(HTTP_SECURITY_HEADER_NAMES.xContentTypeOptions)).toBe("nosniff");
    expect(response.headers.get(HTTP_SECURITY_HEADER_NAMES.cacheControl)).toContain("no-store");
    expect(response.headers.get(HTTP_SECURITY_HEADER_NAMES.crossOriginOpenerPolicy)).toBe(
      "same-origin-allow-popups",
    );
  });
});
