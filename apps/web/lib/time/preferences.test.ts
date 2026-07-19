import { afterEach, describe, expect, it } from "vitest";

import {
  readLastCustomerId,
  readLastTimesheetId,
  writeLastCustomerId,
  writeLastTimesheetId,
} from "./preferences";

afterEach(() => {
  window.sessionStorage.clear();
});

describe("time preferences", () => {
  it("reads and writes last timesheet id", () => {
    expect(readLastTimesheetId()).toBe("");
    writeLastTimesheetId("tts_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    expect(readLastTimesheetId()).toBe("tts_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    writeLastTimesheetId("");
    expect(readLastTimesheetId()).toBe("");
  });

  it("reads and writes last customer id", () => {
    expect(readLastCustomerId()).toBe("");
    writeLastCustomerId("tcust_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    expect(readLastCustomerId()).toBe("tcust_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    writeLastCustomerId("");
    expect(readLastCustomerId()).toBe("");
  });
});
