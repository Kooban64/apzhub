import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it, vi } from "vitest";

import { createLawSessionDualWriteStorage } from "./law-session-dual-write-storage";

const repoRoot = join(__dirname, "../../../..");

describe("R12-PERSIST-02 boundary", () => {
  it("includes drizzle migrations for Law session SoR + RLS", () => {
    const sqlPath = join(
      repoRoot,
      "packages/config/drizzle/0063_apz_platform_law_session_stores.sql",
    );
    const rlsPath = join(
      repoRoot,
      "packages/config/drizzle/0064_apz_platform_law_session_stores_rls.sql",
    );
    expect(existsSync(sqlPath)).toBe(true);
    expect(existsSync(rlsPath)).toBe(true);
    const body = readFileSync(sqlPath, "utf8");
    expect(body).toContain("platform_law_activity_session");
    expect(body).toContain("platform_law_notification_session");

    const meta = JSON.parse(
      readFileSync(
        join(repoRoot, "packages/config/drizzle/meta/_journal.json"),
        "utf8",
      ),
    ) as { entries: Array<{ tag: string }> };
    const tags = meta.entries.map((e) => e.tag);
    expect(tags).toContain("0063_apz_platform_law_session_stores");
    expect(tags).toContain("0064_apz_platform_law_session_stores_rls");
  });

  it("dual-write storage mirrors mutations to Platform API", () => {
    const map = new Map<string, string>();
    const storage = {
      getItem: (k: string) => map.get(k) ?? null,
      setItem: (k: string, v: string) => {
        map.set(k, v);
      },
      removeItem: (k: string) => {
        map.delete(k);
      },
    };
    const fetchMock = vi.fn(async () => new Response(null, { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const key = "apzhub.law.activity.v1.t1.u1";
    const dual = createLawSessionDualWriteStorage({
      kind: "activity",
      storageKey: key,
      scope: { tenantId: "t1", userId: "u1" },
      storage,
    });
    dual.setItem(key, JSON.stringify([{ activityId: "a1" }]));

    expect(map.get(key)).toContain("a1");
    expect(fetchMock).toHaveBeenCalled();
    const firstCall = fetchMock.mock.calls[0] as unknown[] | undefined;
    const url = String(firstCall?.[0] ?? "");
    expect(url).toContain("/api/platform/v1/law/session/activity");

    vi.unstubAllGlobals();
  });
});
