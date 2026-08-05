import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { MyWorkComposition } from "@apzhub/platform-service-contracts";

import { MyWorkView } from "./my-work-view";

vi.mock("@apzhub/auth", () => ({
  useSession: () => ({
    data: { user: { id: "u1", name: "Kooban", email: "k@example.com" } },
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const composition: MyWorkComposition = {
  composedAt: "2026-08-05T12:00:00.000Z",
  displayName: "Kooban",
  compositionOnly: true,
  ownsBusinessState: false,
  partial: false,
  providers: [],
  queues: {
    needsMyAttention: [
      {
        id: "projects:task:t1",
        product: "projects",
        kind: "task",
        sourceId: "t1",
        title: "Complete Sprint task",
        lifecycle: "active",
        href: "/workspace/projects/p1/tasks/t1",
        queueHints: ["needsMyAttention"],
        productLabel: "APZ Projects",
      },
    ],
    dueToday: [],
    waitingForOthers: [],
    recentlyCompleted: [],
  },
};

vi.mock("@/lib/my-work/my-work-api", () => ({
  fetchMyWorkComposition: vi.fn(async () => composition),
  isMyWorkApiError: () => false,
}));

function renderView() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MyWorkView />
    </QueryClientProvider>,
  );
}

describe("MyWorkView", () => {
  it("renders greeting and work cards with product as secondary metadata", async () => {
    renderView();
    expect(await screen.findByTestId("my-work-greeting")).toHaveTextContent(
      "Good morning, Kooban.",
    );
    expect(await screen.findByTestId("my-work-needs-attention")).toBeInTheDocument();
    expect(screen.getByText("Complete Sprint task")).toBeInTheDocument();
    expect(screen.getByText("APZ Projects")).toBeInTheDocument();
    expect(screen.getByTestId("my-work-due-today-empty")).toBeInTheDocument();
  });
});
