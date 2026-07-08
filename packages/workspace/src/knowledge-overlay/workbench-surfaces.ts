/** Knowledge Overlay — first Knowledge Experience surface (DF-012). */
export const KNOWLEDGE_OVERLAY_SURFACE = Object.freeze({
  id: "knowledge-overlay",
  label: "Knowledge Overlay",
  status: "implemented",
  consumes: "knowledge-query-api",
  description:
    "Grouped knowledge discovery results overlay. Presentation and selection delegation only.",
} as const);
