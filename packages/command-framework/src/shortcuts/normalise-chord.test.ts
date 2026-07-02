import { describe, expect, it } from "vitest";

import { chordFromKeyboardEvent, normaliseChord } from "./normalise-chord";

describe("normaliseChord", () => {
  it("normalises modifier aliases and key case", () => {
    expect(normaliseChord("ctrl+shift+p")).toBe("Ctrl+Shift+P");
    expect(normaliseChord("Cmd+Shift+T")).toBe("Meta+Shift+T");
    expect(normaliseChord("Meta+Shift+P")).toBe("Meta+Shift+P");
  });

  it("sorts modifiers consistently", () => {
    expect(normaliseChord("Shift+Ctrl+Alt+K")).toBe("Alt+Ctrl+Shift+K");
  });

  it("returns null for empty chords", () => {
    expect(normaliseChord("")).toBeNull();
    expect(normaliseChord("   ")).toBeNull();
  });
});

describe("chordFromKeyboardEvent", () => {
  it("builds canonical chord from keyboard event", () => {
    expect(
      chordFromKeyboardEvent({
        key: "p",
        ctrlKey: true,
        metaKey: false,
        shiftKey: true,
        altKey: false,
      }),
    ).toBe("Ctrl+Shift+P");
  });

  it("returns null for modifier-only keys", () => {
    expect(
      chordFromKeyboardEvent({
        key: "Shift",
        ctrlKey: true,
        metaKey: false,
        shiftKey: true,
        altKey: false,
      }),
    ).toBeNull();
  });
});
