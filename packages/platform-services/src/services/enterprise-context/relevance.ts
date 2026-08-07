import type { ContextFocus } from "@apzhub/platform-service-contracts";

/** True when any haystack string references the focus work object. */
export function matchesFocus(
  focus: ContextFocus,
  haystacks: readonly (string | undefined | null)[],
): boolean {
  const needles = [focus.id, focus.identifier, focus.name]
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => value.toLowerCase());

  if (needles.length === 0) return false;

  for (const haystack of haystacks) {
    if (!haystack) continue;
    const lower = haystack.toLowerCase();
    if (needles.some((needle) => lower.includes(needle))) {
      return true;
    }
  }
  return false;
}

/** @deprecated Prefer matchesFocus — retained for CONTEXT-001 call sites. */
export const matchesProjectFocus = matchesFocus;

export function focusTagCandidates(focus: ContextFocus): readonly string[] {
  const out: string[] = [];
  if (focus.id) {
    out.push(focus.id, `${focus.type}:${focus.id}`);
    if (focus.type === "project") out.push(`project:${focus.id}`);
  }
  if (focus.identifier) {
    out.push(focus.identifier, `${focus.type}:${focus.identifier}`);
    if (focus.type === "project") out.push(`project:${focus.identifier}`);
  }
  if (focus.name) out.push(focus.name);
  return out;
}

/** @deprecated Prefer focusTagCandidates. */
export const projectTagCandidates = focusTagCandidates;
