/**
 * APZQEP-ENG-020E Part 3 — security regression: requirement baselines expose no
 * unlock, restore, or delete capability for the baseline itself, and every
 * disallowed HTTP verb on a baseline route either has no handler at all (Next.js
 * App Router returns 405 automatically) or an explicit 405 stub.
 */
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import * as baselineDetailRoute from "./[baselineId]/route";
import * as lockRoute from "./[baselineId]/lock/route";
import * as archiveRoute from "./[baselineId]/archive/route";
import * as verifyRoute from "./[baselineId]/verify/route";
import * as baselinesListRoute from "./route";
import * as itemRoute from "./[baselineId]/items/[contentVersionId]/route";

function request(url: string, method: string) {
  return new NextRequest(new URL(url, "http://localhost"), { method });
}

describe("APZQEP-ENG-020E baseline routes: no unlock/restore/delete surface", () => {
  it("the baseline resource itself exposes no DELETE handler (no delete)", () => {
    expect(baselineDetailRoute.DELETE).toBeDefined();
  });

  it("has no DELETE (unlock/restore/delete) success path on the baseline resource", async () => {
    const response = await baselineDetailRoute.DELETE(
      request("http://localhost/api/v1/qep/requirements/baselines/rbl_1", "DELETE"),
    );
    expect(response.status).toBe(405);
  });

  it("rejects PUT and POST on the baseline resource (no replace/clone)", async () => {
    const put = await baselineDetailRoute.PUT(
      request("http://localhost/api/v1/qep/requirements/baselines/rbl_1", "PUT"),
    );
    expect(put.status).toBe(405);
    const post = await baselineDetailRoute.POST(
      request("http://localhost/api/v1/qep/requirements/baselines/rbl_1", "POST"),
    );
    expect(post.status).toBe(405);
  });

  it("lock exposes only POST — no PATCH/DELETE/PUT export exists (no unlock route at all)", () => {
    expect(lockRoute.POST).toBeDefined();
    expect((lockRoute as Record<string, unknown>).PATCH).toBeUndefined();
    expect((lockRoute as Record<string, unknown>).DELETE).toBeUndefined();
    expect((lockRoute as Record<string, unknown>).PUT).toBeUndefined();
  });

  it("lock rejects GET with an explicit 405", async () => {
    const response = await lockRoute.GET(request("http://localhost/x/lock", "GET"));
    expect(response.status).toBe(405);
  });

  it("archive exposes only POST — no PATCH/DELETE/PUT export exists (no restore route at all)", () => {
    expect(archiveRoute.POST).toBeDefined();
    expect((archiveRoute as Record<string, unknown>).PATCH).toBeUndefined();
    expect((archiveRoute as Record<string, unknown>).DELETE).toBeUndefined();
    expect((archiveRoute as Record<string, unknown>).PUT).toBeUndefined();
  });

  it("archive rejects GET with an explicit 405", async () => {
    const response = await archiveRoute.GET(request("http://localhost/x/archive", "GET"));
    expect(response.status).toBe(405);
  });

  it("verify exposes only POST — no PATCH/DELETE/PUT export exists", () => {
    expect(verifyRoute.POST).toBeDefined();
    expect((verifyRoute as Record<string, unknown>).PATCH).toBeUndefined();
    expect((verifyRoute as Record<string, unknown>).DELETE).toBeUndefined();
    expect((verifyRoute as Record<string, unknown>).PUT).toBeUndefined();
  });

  it("verify rejects GET with an explicit 405", async () => {
    const response = await verifyRoute.GET(request("http://localhost/x/verify", "GET"));
    expect(response.status).toBe(405);
  });

  it("the item-removal route's only real handler is DELETE (remove membership)", () => {
    expect(itemRoute.DELETE).toBeDefined();
  });

  it("the item-removal route rejects GET/POST/PATCH/PUT with an explicit 405", async () => {
    const get = await itemRoute.GET(request("http://localhost/x/items/rcv_1", "GET"));
    expect(get.status).toBe(405);
    const post = await itemRoute.POST(request("http://localhost/x/items/rcv_1", "POST"));
    expect(post.status).toBe(405);
    const patch = await itemRoute.PATCH(request("http://localhost/x/items/rcv_1", "PATCH"));
    expect(patch.status).toBe(405);
    const put = await itemRoute.PUT(request("http://localhost/x/items/rcv_1", "PUT"));
    expect(put.status).toBe(405);
  });

  it("the baselines collection route rejects DELETE/PATCH/PUT", async () => {
    expect(
      (
        await baselinesListRoute.DELETE(
          request("http://localhost/api/v1/qep/requirements/baselines", "DELETE"),
        )
      ).status,
    ).toBe(405);
    expect(
      (
        await baselinesListRoute.PATCH(
          request("http://localhost/api/v1/qep/requirements/baselines", "PATCH"),
        )
      ).status,
    ).toBe(405);
    expect(
      (
        await baselinesListRoute.PUT(
          request("http://localhost/api/v1/qep/requirements/baselines", "PUT"),
        )
      ).status,
    ).toBe(405);
  });
});
