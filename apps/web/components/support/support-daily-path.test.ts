/**
 * SUP-P1-03 / APZSUP-103 — core request daily path (repository smoke).
 * Documents list → open → communicate → close wiring without redesign.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  resolveSupportRoute,
  supportInboxPath,
  supportRequestCreatePath,
  supportRequestDetailPath,
} from "@/lib/support/routes";

const root = join(process.cwd());

describe("support daily path (SUP-P1-03)", () => {
  it("routes inbox → create → detail", () => {
    expect(resolveSupportRoute(supportInboxPath())).toEqual({ kind: "inbox" });
    expect(resolveSupportRoute("/workspace/support")).toEqual({ kind: "inbox" });
    expect(resolveSupportRoute(supportRequestCreatePath())).toEqual({
      kind: "create",
    });
    expect(
      resolveSupportRoute(
        supportRequestDetailPath("sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"),
      ),
    ).toEqual({
      kind: "detail",
      supportRequestId: "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    });
  });

  it("mounts inbox, create, and detail views on the workspace router", () => {
    const router = readFileSync(
      join(root, "apps/web/components/support/support-workspace-router.tsx"),
      "utf8",
    );
    expect(router).toContain("SupportInboxView");
    expect(router).toContain("SupportRequestCreateView");
    expect(router).toContain("SupportRequestDetailView");
    expect(router).toContain('case "inbox"');
    expect(router).toContain('case "detail"');
  });

  it("exposes list, communicate, and close API client methods", () => {
    const client = readFileSync(
      join(root, "apps/web/lib/support/support-api.ts"),
      "utf8",
    );
    expect(client).toContain("listSupportRequests");
    expect(client).toContain("createCustomerReply");
    expect(client).toContain("createInternalNote");
    expect(client).toContain("closeSupportRequest");
  });

  it("wires conversation + composers on the request detail surface", () => {
    const detail = readFileSync(
      join(root, "apps/web/components/support/support-request-detail-view.tsx"),
      "utf8",
    );
    expect(detail).toContain("SupportConversation");
    expect(detail).toContain("CustomerReplyComposer");
    expect(detail).toContain("InternalNoteComposer");
  });
});
