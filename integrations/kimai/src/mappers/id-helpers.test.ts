import { describe, expect, it } from "vitest";

import { toIsoDateTime, toKimaiDateTime } from "./id-helpers";

describe("toIsoDateTime", () => {
  it("parses Kimai +0000 offsets without appending Z", () => {
    expect(toIsoDateTime("2026-08-15T14:36:00+0000")).toBe("2026-08-15T14:36:00.000Z");
  });

  it("parses colon offsets and Z", () => {
    expect(toIsoDateTime("2026-08-15T14:36:00+00:00")).toBe("2026-08-15T14:36:00.000Z");
    expect(toIsoDateTime("2026-08-15T14:36:00Z")).toBe("2026-08-15T14:36:00.000Z");
  });

  it("treats naive local as UTC", () => {
    expect(toIsoDateTime("2026-08-15T14:36:00")).toBe("2026-08-15T14:36:00.000Z");
  });
});

describe("toKimaiDateTime", () => {
  it("strips timezone to HTML5 local datetime", () => {
    expect(toKimaiDateTime("2026-08-15T14:36:00.000Z")).toBe("2026-08-15T14:36:00");
  });
});
