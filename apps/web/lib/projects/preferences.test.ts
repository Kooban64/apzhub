import { afterEach, describe, expect, it } from "vitest";

import { readLastProjectId, writeLastProjectId } from "./preferences";

afterEach(() => {
  window.sessionStorage.clear();
});

describe("projects preferences", () => {
  it("reads and writes last project id", () => {
    expect(readLastProjectId()).toBe("");
    writeLastProjectId("proj_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    expect(readLastProjectId()).toBe("proj_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    writeLastProjectId("");
    expect(readLastProjectId()).toBe("");
  });
});
