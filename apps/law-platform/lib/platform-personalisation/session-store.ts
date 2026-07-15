import type { SessionStore } from "@apzhub/workbench-framework";
import type { WorkbenchSessionPayload } from "@apzhub/workbench-framework";
import { parseWorkbenchSessionPayload } from "@apzhub/workbench-framework";

const LAYOUT_URL = "/api/platform/v1/personalisation/workbench-layout";

/** Platform-backed SessionStore — persists workbench layout via PersonalisationService (M8-04). */
export function createPlatformPersonalisationSessionStore(): SessionStore {
  return {
    async load(_userId: string): Promise<WorkbenchSessionPayload | null> {
      const response = await fetch(LAYOUT_URL, { credentials: "include" });
      if (!response.ok) {
        return null;
      }

      const body = (await response.json()) as {
        data?: { layout?: unknown } | null;
      };
      const raw = body.data?.layout;
      if (!raw) {
        return null;
      }

      const parsed = parseWorkbenchSessionPayload(raw);
      return parsed.ok ? parsed.payload : null;
    },

    async save(_userId: string, payload: WorkbenchSessionPayload): Promise<void> {
      await fetch(LAYOUT_URL, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },

    async clear(_userId: string): Promise<void> {
      await fetch(LAYOUT_URL, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemaVersion: "1.0",
          activeWorkspace: "home",
          openViews: [],
          panels: {},
          capturedAt: new Date().toISOString(),
        }),
      });
    },
  };
}
