/** Session-scoped Projects UI preferences (no Preference Service redesign). */

const LAST_PROJECT_KEY = "apzhub.projects.lastProjectId";

export function readLastProjectId(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(LAST_PROJECT_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeLastProjectId(projectId: string): void {
  if (typeof window === "undefined") return;
  try {
    if (!projectId) {
      window.sessionStorage.removeItem(LAST_PROJECT_KEY);
      return;
    }
    window.sessionStorage.setItem(LAST_PROJECT_KEY, projectId);
  } catch {
    // Ignore quota / private-mode failures — UI still works without persistence.
  }
}
