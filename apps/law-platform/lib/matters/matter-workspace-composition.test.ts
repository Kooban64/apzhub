import { describe, expect, it } from "vitest";

import { composeMatterWorkspaceSnapshot } from "./matter-workspace-composition";
import { SEED_MATTERS } from "./seed-matters";

describe("composeMatterWorkspaceSnapshot", () => {
  it("composes related module data for a seed matter", () => {
    const matter = SEED_MATTERS[0]!;
    const snapshot = composeMatterWorkspaceSnapshot(matter);

    expect(snapshot.matterId).toBe(matter.matterId);
    expect(snapshot.matter.matterReference).toBe(matter.matterReference);
    expect(snapshot.client.displayName.length).toBeGreaterThan(0);
    expect(snapshot.relatedEntityCounts.documents).toBeGreaterThanOrEqual(0);
    expect(snapshot.relatedEntityCounts.tasks).toBeGreaterThanOrEqual(0);
    expect(snapshot.relatedEntityCounts.timeEntries).toBeGreaterThanOrEqual(0);
    expect(snapshot.relatedEntityCounts.invoices).toBeGreaterThanOrEqual(0);
    expect(snapshot.billing.outstanding.length).toBeGreaterThanOrEqual(0);
  });
});
