/**
 * Header Application selector policy. Uses existing sessionStorage only.
 * Does not create a personalisation subsystem.
 */
export function resolveSelectedApplicationId(input: {
  readonly applications: readonly { readonly id: string }[];
  readonly currentId: string | null;
  readonly storedId: string | null;
}): string | null {
  const apps = input.applications;
  if (apps.length === 0) {
    return input.currentId ?? input.storedId;
  }
  if (input.currentId && apps.some((app) => app.id === input.currentId)) {
    return input.currentId;
  }
  if (input.storedId && apps.some((app) => app.id === input.storedId)) {
    return input.storedId;
  }
  if (apps.length === 1) return apps[0]?.id ?? null;
  return null;
}
