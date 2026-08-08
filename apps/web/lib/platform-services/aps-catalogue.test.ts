import { describe, expect, it } from "vitest";

import { APS_CATALOGUE, listAcceptedPlatformServices } from "./aps-catalogue";

describe("APS catalogue (APS-E-01)", () => {
  it("lists exactly seven Owner-accepted Platform Services", () => {
    const items = listAcceptedPlatformServices();
    expect(items).toHaveLength(7);
    expect(APS_CATALOGUE).toHaveLength(7);
    expect(items.map((e) => e.shortName)).toEqual([
      "APS-Search",
      "APS-Notifications",
      "APS-Command",
      "APS-Activity",
      "APS-Personalisation",
      "APS-Realtime",
      "APS-Audit",
    ]);
  });

  it("does not include AI, Presence, Inbox, or Navigation as services", () => {
    const ids = APS_CATALOGUE.map((e) => e.id).join(" ");
    expect(ids).not.toMatch(/ai|rag|presence|inbox|navigation|nav/i);
  });
});
