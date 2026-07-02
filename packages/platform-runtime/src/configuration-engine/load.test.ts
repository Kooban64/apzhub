import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { Configuration } from "../configuration-manager";
import { loadRuntimeConfiguration } from "./load";

describe("loadRuntimeConfiguration (deprecated)", () => {
  afterEach(() => {
    Configuration._resetForTests();
  });

  it("delegates to Configuration.load()", () => {
    const configuration = loadRuntimeConfiguration({ workspaceRoot: "/tmp/apzhub" });
    expect(configuration.workspaceRoot).toBe(path.resolve("/tmp/apzhub"));
  });
});
