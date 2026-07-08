"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  LawBreadcrumbs,
  LawFormPageLayout,
  LawPageHeader,
  LawSuccessDialog,
} from "../ux";
import { TaskFormFields } from "./task-form-fields";
import { useTaskWorkflow } from "../../lib/tasks/task-workflow-context";
import {
  createEmptyTaskFormValues,
  getSharedTaskRepository,
  taskDetailRoute,
  taskListRoute,
  taskToFormValues,
  validateTaskForm,
  type TaskFormValues,
} from "../../lib/tasks";

export interface TaskFormPageProps {
  readonly mode: "create" | "edit";
  readonly taskId?: string;
  readonly initialMatterId?: string;
}

/** Task create/edit form — full in-memory workflow (LAW-005-01). */
export function TaskFormPage({ mode, taskId, initialMatterId }: TaskFormPageProps) {
  const router = useRouter();
  const workflow = useTaskWorkflow();
  const repository = getSharedTaskRepository();
  const existingTask = useMemo(
    () => (mode === "edit" && taskId ? repository.getById(taskId) : undefined),
    [mode, taskId, repository],
  );

  const [values, setValues] = useState<TaskFormValues>(() => {
    if (existingTask) {
      return taskToFormValues(existingTask);
    }

    return createEmptyTaskFormValues(initialMatterId ?? "");
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedTaskId, setSavedTaskId] = useState<string | undefined>();
  const validation = useMemo(() => validateTaskForm(values), [values]);

  const title = mode === "create" ? "Create Task" : "Edit Task";
  const subtitle =
    mode === "create"
      ? "Complete task details linked to a matter. Saved to the in-memory repository for workflow validation."
      : existingTask
        ? `Editing ${existingTask.title}. Changes are stored in-memory only.`
        : "Task not found in the in-memory repository.";

  function handleFieldChange(field: keyof TaskFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSave() {
    const result =
      mode === "create"
        ? workflow.createTask(values)
        : taskId
          ? workflow.updateTask(taskId, values)
          : { ok: false, run: workflow.searchTasks({}, "legal.task.edit").run };

    if (!result.ok || !result.task || Array.isArray(result.task)) {
      return;
    }

    setSavedTaskId(result.task.taskId);
    setShowSuccess(true);
  }

  function handleCancel() {
    if (mode === "edit" && taskId) {
      router.push(taskDetailRoute(taskId));
      return;
    }

    router.push(taskListRoute());
  }

  if (mode === "edit" && taskId && !existingTask) {
    return (
      <LawFormPageLayout
        header={
          <LawPageHeader
            eyebrow="Task Management"
            title="Task not found"
            subtitle="Cannot edit a task that is not in the in-memory repository."
          />
        }
        sections={null}
        onCancel={() => router.push(taskListRoute())}
      />
    );
  }

  return (
    <>
      <LawFormPageLayout
        header={
          <>
            <LawBreadcrumbs
              items={[
                { label: "Tasks", href: taskListRoute() },
                ...(existingTask
                  ? [
                      {
                        label: existingTask.title,
                        href: taskDetailRoute(existingTask.taskId),
                      },
                    ]
                  : []),
                { label: title },
              ]}
            />
            <LawPageHeader
              eyebrow="Task Management"
              title={title}
              subtitle={subtitle}
            />
          </>
        }
        sections={
          <TaskFormFields
            values={values}
            errors={validation.errors}
            onChange={handleFieldChange}
          />
        }
        validationSummary={
          validation.valid ? null : (
            <ul className="list-disc pl-5">
              {Object.entries(validation.errors).map(([field, message]) => (
                <li key={field}>{message}</li>
              ))}
            </ul>
          )
        }
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <LawSuccessDialog
        open={showSuccess}
        title={mode === "create" ? "Task created" : "Task updated"}
        description="Task workflow completed. Domain event, notification, and activity placeholders were triggered."
        onClose={() => {
          setShowSuccess(false);
          if (savedTaskId) {
            router.push(taskDetailRoute(savedTaskId));
            return;
          }
          if (mode === "edit" && taskId) {
            router.push(taskDetailRoute(taskId));
            return;
          }
          router.push(taskListRoute());
        }}
      />
    </>
  );
}
