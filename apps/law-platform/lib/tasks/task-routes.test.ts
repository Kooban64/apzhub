import { describe, expect, it } from "vitest";

import {
  taskCreateRoute,
  taskDetailRoute,
  taskEditRoute,
  taskListRoute,
  parseTaskRoute,
} from "./task-routes";

describe("task routes", () => {
  it("parses list, detail, create, and edit routes", () => {
    expect(parseTaskRoute(taskListRoute())).toEqual({ kind: "list" });
    expect(parseTaskRoute(taskCreateRoute())).toEqual({ kind: "create" });
    expect(parseTaskRoute(taskDetailRoute("t1"))).toEqual({
      kind: "detail",
      taskId: "t1",
    });
    expect(parseTaskRoute(taskEditRoute("t1"))).toEqual({
      kind: "edit",
      taskId: "t1",
    });
  });
});
