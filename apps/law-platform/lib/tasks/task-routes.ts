export const TASK_MODULE_BASE_ROUTE = "/workspace/law/tasks";

export type TaskRoute =
  | { readonly kind: "list" }
  | { readonly kind: "detail"; readonly taskId: string }
  | { readonly kind: "create" }
  | { readonly kind: "edit"; readonly taskId: string };

export function isTaskModuleRoute(pathname: string): boolean {
  return (
    pathname === TASK_MODULE_BASE_ROUTE ||
    pathname.startsWith(`${TASK_MODULE_BASE_ROUTE}/`)
  );
}

export function parseTaskRoute(pathname: string): TaskRoute | null {
  if (!isTaskModuleRoute(pathname)) {
    return null;
  }

  if (
    pathname === TASK_MODULE_BASE_ROUTE ||
    pathname === `${TASK_MODULE_BASE_ROUTE}/`
  ) {
    return { kind: "list" };
  }

  const suffix = pathname.slice(TASK_MODULE_BASE_ROUTE.length + 1);
  if (suffix === "new") {
    return { kind: "create" };
  }

  const segments = suffix.split("/").filter(Boolean);
  if (segments.length === 1) {
    return { kind: "detail", taskId: segments[0]! };
  }

  if (segments.length === 2 && segments[1] === "edit") {
    return { kind: "edit", taskId: segments[0]! };
  }

  return null;
}

export function taskDetailRoute(taskId: string): string {
  return `${TASK_MODULE_BASE_ROUTE}/${taskId}`;
}

export function taskEditRoute(taskId: string): string {
  return `${TASK_MODULE_BASE_ROUTE}/${taskId}/edit`;
}

export function taskCreateRoute(matterId?: string): string {
  if (!matterId) {
    return `${TASK_MODULE_BASE_ROUTE}/new`;
  }

  return `${TASK_MODULE_BASE_ROUTE}/new?matterId=${encodeURIComponent(matterId)}`;
}

export function taskListRoute(): string {
  return TASK_MODULE_BASE_ROUTE;
}
