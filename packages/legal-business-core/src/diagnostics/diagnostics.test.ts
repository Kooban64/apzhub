import { describe, expect, it } from "vitest";

import type { ClientRepository } from "../repositories";
import { getLegalBusinessCoreDiagnostics } from "../diagnostics";

describe("repository interfaces", () => {
  it("allows structural typing for ClientRepository", () => {
    const repository: ClientRepository = {
      list: () => [],
      getById: () => undefined,
    };

    expect(repository.list()).toEqual([]);
  });
});

describe("diagnostics", () => {
  it("describes the legal business core surface", () => {
    const diagnostics = getLegalBusinessCoreDiagnostics();

    expect(diagnostics.version).toBe("1.0.0");
    expect(diagnostics.repositoryInterfaces).toContain("ClientRepository");
    expect(diagnostics.validators).toContain("ClientValidator");
    expect(diagnostics.supportedEntities).toContain("invoice");
  });
});
