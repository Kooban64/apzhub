"use client";

import type { LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";

/**
 * Map module.yaml Lucide icon names (`clock`, `layout-dashboard`) to components.
 * Falls back to null when unknown — callers keep a text glyph as last resort.
 */
export function resolveLucideIcon(name: string | undefined): LucideIcon | null {
  if (!name?.trim() || name.trim().length === 1) {
    return null;
  }
  const pascal = name
    .trim()
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  const candidate = (LucideIcons as Record<string, unknown>)[pascal];
  if (typeof candidate === "function") {
    return candidate as LucideIcon;
  }
  return null;
}
