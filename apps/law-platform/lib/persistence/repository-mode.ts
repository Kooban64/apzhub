export type LawRepositoryMode = "memory" | "postgres";

const VALID_MODES: readonly LawRepositoryMode[] = ["memory", "postgres"];

/** Reads LAW_REPOSITORY_MODE — defaults to memory (opt-in postgres). */
export function getLawRepositoryMode(): LawRepositoryMode {
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

export function isPostgresRepositoryMode(): boolean {
  return getLawRepositoryMode() === "postgres";
}
