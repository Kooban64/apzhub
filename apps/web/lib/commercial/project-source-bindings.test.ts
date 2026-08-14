import { describe, expect, it, beforeEach } from "vitest";

import {
  attachSourceBindingsToProject,
  isSourceProviderAvailable,
  listProjectSourceBindings,
  parseSourceBindingInputs,
  PROJECT_SOURCE_PROVIDER_CATALOGUE,
  resetProjectSourceBindingsForTests,
  upsertProjectSourceBinding,
} from "./project-source-bindings";

describe("SPR-COMM-002 project source bindings", () => {
  beforeEach(() => {
    resetProjectSourceBindingsForTests();
  });

  it("catalogues GitHub and GitLab as available", () => {
    expect(isSourceProviderAvailable("github")).toBe(true);
    expect(isSourceProviderAvailable("gitlab")).toBe(true);
    expect(isSourceProviderAvailable("bitbucket")).toBe(false);
    expect(PROJECT_SOURCE_PROVIDER_CATALOGUE).toHaveLength(6);
  });

  it("binds GitHub to a QEP project and an APZPEN engagement separately", () => {
    const qep = attachSourceBindingsToProject({
      tenantId: "t1",
      projectId: "qproj-1",
      productKey: "qep",
      bindings: [
        {
          providerId: "github",
          externalRef: "acme/payments",
          mode: "granted_read",
          secretRef: "secrets/github-app",
        },
      ],
    });
    expect(qep[0]?.projectId).toBe("qproj-1");
    expect(qep[0]?.productKey).toBe("qep");

    const pen = upsertProjectSourceBinding({
      tenantId: "t1",
      projectId: "eng-1",
      productKey: "pentest",
      binding: {
        providerId: "github",
        externalRef: "acme/portal",
        mode: "customer_pipeline",
      },
    });
    expect(pen.productKey).toBe("pentest");

    expect(
      listProjectSourceBindings({ tenantId: "t1", productKey: "qep" }),
    ).toHaveLength(1);
    expect(
      listProjectSourceBindings({
        tenantId: "t1",
        productKey: "pentest",
        projectId: "eng-1",
      })[0]?.externalRef,
    ).toBe("acme/portal");
  });

  it("refuses unavailable providers", () => {
    expect(() =>
      upsertProjectSourceBinding({
        tenantId: "t1",
        projectId: "qproj-1",
        productKey: "qep",
        binding: {
          providerId: "bitbucket",
          externalRef: "group/repo",
          mode: "granted_read",
        },
      }),
    ).toThrow("source.provider_not_available");
  });

  it("parses single source or sourceBindings array from API bodies", () => {
    expect(
      parseSourceBindingInputs({
        providerId: "github",
        externalRef: "a/b",
        mode: "granted_read",
      }),
    ).toHaveLength(1);
    expect(
      parseSourceBindingInputs([
        {
          providerId: "github",
          externalRef: "a/b",
          mode: "customer_pipeline",
        },
        { providerId: "gitlab", externalRef: "x/y", mode: "granted_read" },
      ]),
    ).toHaveLength(2);
    expect(parseSourceBindingInputs({ bad: true })).toEqual([]);
  });
});
