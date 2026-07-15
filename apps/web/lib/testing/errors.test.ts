import { describe, expect, it } from "vitest";

import {
  TestingClientError,
  isTestingClientError,
  toTestingUserMessage,
} from "./errors";

describe("TestingClientError helpers", () => {
  it("identifies TestingClientError instances", () => {
    const error = new TestingClientError("Plan not found", "NOT_FOUND", 404);
    expect(isTestingClientError(error)).toBe(true);
    expect(isTestingClientError(new Error("generic"))).toBe(false);
    expect(isTestingClientError("string")).toBe(false);
    expect(isTestingClientError(null)).toBe(false);
  });

  it("maps TestingClientError to its message", () => {
    const error = new TestingClientError("Missing permission", "FORBIDDEN", 403);
    expect(toTestingUserMessage(error)).toBe("Missing permission");
  });

  it("maps generic Error to its message", () => {
    expect(toTestingUserMessage(new Error("Network failed"))).toBe("Network failed");
  });

  it("maps unknown values to the default message", () => {
    expect(toTestingUserMessage("oops")).toBe("Unable to load Testing data.");
    expect(toTestingUserMessage({ code: "X" })).toBe("Unable to load Testing data.");
    expect(toTestingUserMessage(new Error(""))).toBe("Unable to load Testing data.");
  });
});
