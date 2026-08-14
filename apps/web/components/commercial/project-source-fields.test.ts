import { describe, expect, it } from "vitest";

import {
  EMPTY_PROJECT_SOURCE_FORM,
  formatSourceBindingsSummary,
  projectSourcePayloadFromForm,
} from "@/components/commercial/project-source-fields";

describe("ProjectSourceFields helpers", () => {
  it("omits payload when disabled or empty ref", () => {
    expect(projectSourcePayloadFromForm(EMPTY_PROJECT_SOURCE_FORM)).toBeUndefined();
    expect(
      projectSourcePayloadFromForm({
        ...EMPTY_PROJECT_SOURCE_FORM,
        enabled: true,
        externalRef: "  ",
      }),
    ).toBeUndefined();
  });

  it("builds github granted_read payload", () => {
    expect(
      projectSourcePayloadFromForm({
        enabled: true,
        providerId: "github",
        externalRef: " acme/payments ",
        mode: "granted_read",
        defaultBranch: "main",
        secretRef: "secrets/github-app",
      }),
    ).toEqual({
      providerId: "github",
      externalRef: "acme/payments",
      mode: "granted_read",
      defaultBranch: "main",
      secretRef: "secrets/github-app",
    });
  });

  it("summarises bindings for list rows", () => {
    expect(formatSourceBindingsSummary(undefined)).toBeNull();
    expect(
      formatSourceBindingsSummary([
        {
          providerId: "github",
          externalRef: "acme/x",
          mode: "customer_pipeline",
        },
      ]),
    ).toBe("github:acme/x (customer_pipeline)");
  });
});
