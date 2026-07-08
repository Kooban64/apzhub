export type LawApiRepositoryMode = "memory" | "postgres";

const VALID_MODES: readonly LawApiRepositoryMode[] = ["memory", "postgres"];

/** Reads LAW_REPOSITORY_MODE for API diagnostics (LAW-014-02). */
export function getLawApiRepositoryMode(): LawApiRepositoryMode {
  const raw = process.env.LAW_REPOSITORY_MODE?.trim().toLowerCase();
  if (!raw || raw === "memory") {
    return "memory";
  }

  if (raw === "postgres") {
    return "postgres";
  }

  throw new Error(
    `Invalid LAW_REPOSITORY_MODE "${raw}". Expected one of: ${VALID_MODES.join(", ")}`,
  );
}
