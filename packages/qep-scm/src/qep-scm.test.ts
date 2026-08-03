import { describe, expect, it } from "vitest";

import { createQepScm } from "./compose";
import {
  QEP_SCM_BASE_PATH,
  QEP_SCM_ROUTES,
  isQepScmRoute,
} from "./presentation/routes";

describe("APZQEP-162 qep-scm", () => {
  it("exposes workspace routes under /workspace/qep/scm", () => {
    expect(QEP_SCM_ROUTES.home).toBe(QEP_SCM_BASE_PATH);
    expect(isQepScmRoute("/workspace/qep/scm/providers")).toBe(true);
    expect(isQepScmRoute("/workspace/qep/automation")).toBe(false);
  });

  it("integrates platform scm for GitHub offline registration", async () => {
    const qep = createQepScm({ githubOffline: true });
    await qep.connectProvider("tenant-1", "github", "corr-1");
    const repository = await qep.registerRepository({
      tenantId: "tenant-1",
      providerId: "github",
      fullName: "apzor/apzhub",
      registeredBy: "user-1",
    });
    expect(repository.fullName).toBe("apzor/apzhub");
    expect(qep.listProviders().some((p) => p.providerId === "github")).toBe(true);
  });
});
