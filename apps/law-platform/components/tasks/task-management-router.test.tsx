import "@testing-library/jest-dom/vitest";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TaskManagementRouter } from "./task-management-router";
import { SEED_TASKS, resetSharedTaskRepository } from "../../lib/tasks";
import { renderWithTaskWorkflow } from "../../lib/tasks/test-utils";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("TaskManagementRouter", () => {
  beforeEach(() => {
    resetSharedTaskRepository();
  });

  it("routes to list, detail, create, and edit pages", async () => {
    const { rerender } = renderWithTaskWorkflow(
      <TaskManagementRouter pathname="/workspace/law/tasks" />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("law-list-page-layout")).toBeInTheDocument();
    });

    rerender(<TaskManagementRouter pathname="/workspace/law/tasks/new" />);
    expect(screen.getByTestId("law-form-page-layout")).toBeInTheDocument();

    const task = SEED_TASKS[0]!;
    rerender(<TaskManagementRouter pathname={`/workspace/law/tasks/${task.taskId}`} />);
    expect(screen.getByRole("heading", { name: task.title })).toBeInTheDocument();

    rerender(
      <TaskManagementRouter pathname={`/workspace/law/tasks/${task.taskId}/edit`} />,
    );
    expect(screen.getByDisplayValue(task.title)).toBeInTheDocument();
  });
});
