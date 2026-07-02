import type { KeyboardEventLike } from "./types";

const MODIFIER_ALIASES = {
  alt: "Alt",
  ctrl: "Ctrl",
  control: "Ctrl",
  meta: "Meta",
  cmd: "Meta",
  command: "Meta",
  shift: "Shift",
} as const satisfies Record<string, "Alt" | "Ctrl" | "Meta" | "Shift">;

const MODIFIER_KEYS = new Set(["Control", "Shift", "Alt", "Meta"]);

type CanonicalModifier = (typeof MODIFIER_ALIASES)[keyof typeof MODIFIER_ALIASES];

/** Normalise a manifest or user chord to canonical `Alt+Ctrl+Meta+Shift+Key` form. */
export function normaliseChord(chord: string): string | null {
  const segments = chord
    .split("+")
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  const modifiers = new Set<CanonicalModifier>();
  let keyPart: string | null = null;

  for (const segment of segments) {
    const alias =
      MODIFIER_ALIASES[segment.toLowerCase() as keyof typeof MODIFIER_ALIASES];
    if (alias) {
      modifiers.add(alias);
      continue;
    }

    keyPart = normaliseKeyToken(segment);
  }

  if (!keyPart) {
    return null;
  }

  const orderedModifiers = [...modifiers].sort();
  return [...orderedModifiers, keyPart].join("+");
}

/** Build a canonical chord from a keyboard event for registry lookup. */
export function chordFromKeyboardEvent(event: KeyboardEventLike): string | null {
  if (!event.key || MODIFIER_KEYS.has(event.key)) {
    return null;
  }

  const segments: string[] = [];
  if (event.altKey) {
    segments.push("Alt");
  }
  if (event.ctrlKey) {
    segments.push("Ctrl");
  }
  if (event.metaKey) {
    segments.push("Meta");
  }
  if (event.shiftKey) {
    segments.push("Shift");
  }

  const keyToken = normaliseKeyToken(event.key);
  if (!keyToken) {
    return null;
  }

  segments.push(keyToken);
  return normaliseChord(segments.join("+"));
}

function normaliseKeyToken(key: string): string | null {
  const trimmed = key.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.length === 1) {
    return trimmed.toUpperCase();
  }

  if (/^f\d{1,2}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  if (trimmed === " ") {
    return "Space";
  }

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
