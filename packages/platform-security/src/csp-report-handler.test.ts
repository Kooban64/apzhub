import { describe, expect, it } from "vitest";

import { handlePostCspReport } from "./api-handlers";
import { resetSharedPlatformSecurityService } from "./index";
import { resetSharedCspViolationService } from "./csp-violation-service";

describe("handlePostCspReport", () => {
  it("returns 204 for valid browser reports", async () => {
    resetSharedPlatformSecurityService();
    resetSharedCspViolationService();

    const response = await handlePostCspReport(
      "web",
      new Request("http://localhost/api/platform/v1/security/csp-report", {
        method: "POST",
        headers: { "content-type": "application/csp-report" },
        body: JSON.stringify({
          "csp-report": {
            "document-uri": "http://localhost/login",
            "violated-directive": "style-src",
          },
        }),
      }),
    );

    expect(response.status).toBe(204);
  });
});
