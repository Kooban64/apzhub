import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

import {
  COMMAND_PALETTE_QUERY_DEBOUNCE_MS,
  useDebouncedValue,
} from "./use-debounced-value";

describe("useDebouncedValue", () => {
  it("updates after the debounce delay", () => {
    vi.useFakeTimers();

    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, COMMAND_PALETTE_QUERY_DEBOUNCE_MS),
      { initialProps: { value: "a" } },
    );

    expect(result.current).toBe("a");

    rerender({ value: "theme" });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(COMMAND_PALETTE_QUERY_DEBOUNCE_MS);
    });

    expect(result.current).toBe("theme");
    vi.useRealTimers();
  });
});
