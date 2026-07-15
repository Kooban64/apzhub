import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { clearSupportQueries, supportQueryKeys } from "./query-keys";

describe("support query keys", () => {
  it("builds stable list keys regardless of param order", () => {
    const a = supportQueryKeys.requests.list({ status: "open", page: 1 });
    const b = supportQueryKeys.requests.list({ page: 1, status: "open" });
    expect(a).toEqual(b);
  });

  it("nests detail/articles/history under requests", () => {
    expect(supportQueryKeys.requests.detail("sreq_1")[0]).toBe("support");
    expect(supportQueryKeys.requests.articles("sreq_1")).toContain("articles");
    expect(supportQueryKeys.search({ q: "x" })[1]).toBe("search");
    expect(supportQueryKeys.analytics()[1]).toBe("analytics");
  });

  it("clearSupportQueries removes all support caches", () => {
    const client = new QueryClient();
    client.setQueryData(supportQueryKeys.requests.list({}), []);
    client.setQueryData(supportQueryKeys.users.list({}), []);
    clearSupportQueries(client);
    expect(client.getQueryData(supportQueryKeys.requests.list({}))).toBeUndefined();
    expect(client.getQueryData(supportQueryKeys.users.list({}))).toBeUndefined();
  });
});
