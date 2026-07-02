import { describe, expect, it } from "vitest";

import { useCommandPaletteState } from "./use-command-palette-state";
import { renderHook, act } from "@testing-library/react";

describe("useCommandPaletteState", () => {
  it("defaults to closed", () => {
    const { result } = renderHook(() => useCommandPaletteState());
    expect(result.current.open).toBe(false);
  });

  it("opens and closes the palette", () => {
    const { result } = renderHook(() => useCommandPaletteState());

    act(() => {
      result.current.openPalette();
    });
    expect(result.current.open).toBe(true);

    act(() => {
      result.current.closePalette();
    });
    expect(result.current.open).toBe(false);
  });

  it("clears query when palette closes", () => {
    const { result } = renderHook(() => useCommandPaletteState());

    act(() => {
      result.current.openPalette();
      result.current.onQueryChange("theme");
    });
    expect(result.current.query).toBe("theme");

    act(() => {
      result.current.closePalette();
    });
    expect(result.current.query).toBe("");
  });

  it("supports controlled open state", () => {
    const { result, rerender } = renderHook(
      ({ open }) => useCommandPaletteState({ open, onOpenChange: () => undefined }),
      { initialProps: { open: false } },
    );

    expect(result.current.open).toBe(false);
    rerender({ open: true });
    expect(result.current.open).toBe(true);
  });
});
