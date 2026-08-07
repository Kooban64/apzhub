/** APZ Law governance companion routes (N-03). */

export const LAW_GOVERNANCE_BASE = "/workspace/law";

export type LawGovernanceRouteResolution =
  | { readonly kind: "home" }
  | { readonly kind: "questions" }
  | { readonly kind: "question-detail"; readonly questionId: string }
  | { readonly kind: "catalogue" }
  | { readonly kind: "catalogue-capability"; readonly capabilityId: string }
  | { readonly kind: "context" }
  | { readonly kind: "help" }
  | { readonly kind: "settings" }
  | { readonly kind: "unknown" };

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/** Practice prefixes must not be claimed by the governance router. */
const PRACTICE_PREFIXES = [
  "/dashboard",
  "/clients",
  "/matters",
  "/documents",
  "/calendar",
  "/tasks",
  "/time",
  "/search",
  "/billing",
  "/trust",
  "/reports",
  "/administration",
] as const;

export function isLawGovernanceRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  if (normalized === LAW_GOVERNANCE_BASE) return true;
  if (!normalized.startsWith(`${LAW_GOVERNANCE_BASE}/`)) return false;
  const rest = normalized.slice(LAW_GOVERNANCE_BASE.length);
  for (const prefix of PRACTICE_PREFIXES) {
    if (rest === prefix || rest.startsWith(`${prefix}/`)) {
      return false;
    }
  }
  return true;
}

export function resolveLawGovernanceRoute(
  pathname: string,
): LawGovernanceRouteResolution {
  const normalized = normalizePath(pathname);
  if (!isLawGovernanceRoute(normalized)) {
    return { kind: "unknown" };
  }

  if (
    normalized === LAW_GOVERNANCE_BASE ||
    normalized === `${LAW_GOVERNANCE_BASE}/home`
  ) {
    return { kind: "home" };
  }

  const exact: Record<string, LawGovernanceRouteResolution> = {
    [`${LAW_GOVERNANCE_BASE}/questions`]: { kind: "questions" },
    [`${LAW_GOVERNANCE_BASE}/catalogue`]: { kind: "catalogue" },
    [`${LAW_GOVERNANCE_BASE}/context`]: { kind: "context" },
    [`${LAW_GOVERNANCE_BASE}/help`]: { kind: "help" },
    [`${LAW_GOVERNANCE_BASE}/settings`]: { kind: "settings" },
  };
  if (exact[normalized]) {
    return exact[normalized]!;
  }

  const questionsPrefix = `${LAW_GOVERNANCE_BASE}/questions/`;
  if (normalized.startsWith(questionsPrefix)) {
    const questionId = normalized.slice(questionsPrefix.length);
    if (questionId && !questionId.includes("/")) {
      return { kind: "question-detail", questionId };
    }
  }

  const cataloguePrefix = `${LAW_GOVERNANCE_BASE}/catalogue/`;
  if (normalized.startsWith(cataloguePrefix)) {
    const capabilityId = normalized.slice(cataloguePrefix.length);
    if (capabilityId && !capabilityId.includes("/")) {
      return { kind: "catalogue-capability", capabilityId };
    }
  }

  return { kind: "unknown" };
}

export function lawHomePath(): string {
  return `${LAW_GOVERNANCE_BASE}/home`;
}

export function lawQuestionsPath(): string {
  return `${LAW_GOVERNANCE_BASE}/questions`;
}

export function lawQuestionDetailPath(questionId: string): string {
  return `${LAW_GOVERNANCE_BASE}/questions/${questionId}`;
}

export function lawCataloguePath(): string {
  return `${LAW_GOVERNANCE_BASE}/catalogue`;
}

export function lawCatalogueCapabilityPath(capabilityId: string): string {
  return `${LAW_GOVERNANCE_BASE}/catalogue/${capabilityId}`;
}

export function lawContextPath(): string {
  return `${LAW_GOVERNANCE_BASE}/context`;
}

export function lawHelpPath(): string {
  return `${LAW_GOVERNANCE_BASE}/help`;
}

export function lawSettingsPath(): string {
  return `${LAW_GOVERNANCE_BASE}/settings`;
}
