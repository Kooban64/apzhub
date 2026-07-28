/**
 * Search Publication Port — APZQEP-ENG-100D.
 * No dedicated Test Execution search index exists yet; this adapter exposes an
 * injectable hook so a future Platform Search Service wiring (Doc 020) can
 * subscribe without further Application/Domain changes. Defaults to a no-op.
 */
import type {
  SearchPublicationPort,
  StoredTestExecution,
} from "../../application/ports";

export type SearchPublicationHook = (
  execution: StoredTestExecution,
) => void | Promise<void>;

export function createSearchPublicationPort(
  hook?: SearchPublicationHook,
): SearchPublicationPort {
  return {
    portId: "SearchPublicationPort",
    async publish(execution) {
      if (!hook) return;
      await hook(execution);
    },
  };
}
