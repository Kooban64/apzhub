import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { EnterpriseContextComposition } from "@apzhub/platform-service-contracts";

import { EnterpriseContextPanel } from "./enterprise-context-panel";

const composition: EnterpriseContextComposition = {
  focus: { type: "project", id: "proj_1", identifier: "ALPHA" },
  composedAt: "2026-08-06T12:00:00.000Z",
  compositionOnly: true,
  ownsBusinessState: false,
  question: "What do I need to know before I continue?",
  partial: false,
  operational: {
    totalMs: 42,
    providers: [
      { providerId: "workflow", durationMs: 10, status: "ok" },
      { providerId: "support", durationMs: 8, status: "empty" },
      { providerId: "documents", durationMs: 7, status: "empty" },
      { providerId: "law", durationMs: 5, status: "ok" },
      { providerId: "knowledge", durationMs: 5, status: "ok" },
    ],
  },
  slices: [
    {
      providerId: "projects",
      sectionId: "projects",
      productLabel: "APZ Projects",
      fragments: [
        {
          id: "projects:focus:proj_1",
          providerId: "projects",
          productLabel: "APZ Projects",
          sectionHint: "focus",
          title: "Delivery Alpha",
          href: "/workspace/projects/proj_1",
          sourceEntityRef: "proj_1",
          fragmentClass: "entity",
        },
      ],
    },
    {
      providerId: "workflow",
      sectionId: "workflow",
      productLabel: "APZ Workflow",
      fragments: [
        {
          id: "workflow:approval:1",
          providerId: "workflow",
          productLabel: "APZ Workflow",
          sectionHint: "approvals",
          title: "Approve ALPHA release",
          href: "/workspace/workflow/tasks/1",
          sourceEntityRef: "wtk_1",
          fragmentClass: "entity",
        },
      ],
    },
    {
      providerId: "support",
      sectionId: "support",
      productLabel: "APZ Support",
      fragments: [],
      absenceReason: "none",
    },
    {
      providerId: "documents",
      sectionId: "documents",
      productLabel: "APZ Documents",
      fragments: [],
      absenceReason: "none",
    },
    {
      providerId: "law",
      sectionId: "law",
      productLabel: "APZ Law",
      fragments: [
        {
          id: "law:1",
          providerId: "law",
          productLabel: "APZ Law",
          sectionHint: "obligations",
          title: "Applicable delivery obligations",
          href: "/workspace/law",
          sourceEntityRef: "GQ-02",
          fragmentClass: "entity",
        },
      ],
    },
    {
      providerId: "knowledge",
      sectionId: "knowledge",
      productLabel: "APZ Knowledge",
      fragments: [
        {
          id: "knowledge:1",
          providerId: "knowledge",
          productLabel: "APZ Knowledge",
          sectionHint: "lessons",
          title: "Handover gaps cause rework",
          href: "/workspace/knowledge",
          fragmentClass: "entity",
        },
      ],
    },
  ],
};

vi.mock("@/lib/context/context-api", () => ({
  fetchEnterpriseContext: vi.fn(async () => composition),
  isContextApiError: () => false,
}));

vi.mock("@/lib/context/learning-telemetry", () => ({
  recordContextLearningEvent: vi.fn(),
  targetProductFromHref: (href: string) =>
    href.includes("support") ? "support" : "other",
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    readonly children: unknown;
    readonly href: string;
  }) => <a href={href}>{children as never}</a>,
}));

function renderPanel() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <EnterpriseContextPanel
        projectId="proj_1"
        projectName="Delivery Alpha"
        projectIdentifier="ALPHA"
      />
    </QueryClientProvider>,
  );
}

describe("EnterpriseContextPanel", () => {
  it("renders attributed slices and learning feedback controls", async () => {
    renderPanel();

    expect(await screen.findByTestId("context-slice-workflow")).toBeInTheDocument();
    expect(screen.getByTestId("enterprise-context-feedback")).toBeInTheDocument();
    expect(screen.getByTestId("enterprise-context-collapse")).toBeInTheDocument();
    expect(screen.getByText("Approve ALPHA release")).toBeInTheDocument();
  });
});
