"use client";

import { useSearchParams } from "next/navigation";

import { TaskDetailPage } from "./task-detail-page";
import { TaskFormPage } from "./task-form-page";
import { TaskListPage } from "./task-list-page";
import { parseTaskRoute } from "../../lib/tasks";

export interface TaskManagementRouterProps {
  readonly pathname: string;
  readonly initialSearchQuery?: string;
}

/** Routes Task Management screens from the workbench pathname (LAW-005-01). */
export function TaskManagementRouter({
  pathname,
  initialSearchQuery,
}: TaskManagementRouterProps) {
  const searchParams = useSearchParams();
  const route = parseTaskRoute(pathname);

  if (!route) {
    return <TaskListPage />;
  }

  switch (route.kind) {
    case "list":
      return <TaskListPage initialQuery={initialSearchQuery} />;
    case "detail":
      return <TaskDetailPage taskId={route.taskId} />;
    case "create":
      return (
        <TaskFormPage
          mode="create"
          initialMatterId={searchParams.get("matterId") ?? undefined}
        />
      );
    case "edit":
      return <TaskFormPage mode="edit" taskId={route.taskId} />;
    default: {
      const exhaustive: never = route;
      return exhaustive;
    }
  }
}
