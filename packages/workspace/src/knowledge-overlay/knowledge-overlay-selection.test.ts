import { describe, expect, it, vi } from "vitest";

import type { KnowledgeDocument } from "@apzhub/knowledge-discovery-framework";

import {
  delegateKnowledgeOverlaySelection,
  createWorkbenchKnowledgeSelectionHandlers,
} from "./knowledge-overlay-selection";
import {
  resolveKnowledgeOverlaySelection,
  resolveKnowledgeSelectionKind,
} from "./resolve-knowledge-selection";

describe("resolveKnowledgeSelectionKind", () => {
  it("classifies action documents", () => {
    const document: KnowledgeDocument = {
      documentId: "platform.actions:theme",
      sourceId: "platform.actions",
      kind: "command",
      title: "Theme",
      actionRef: { actionId: "platform.theme.toggle" },
    };

    expect(resolveKnowledgeSelectionKind(document)).toBe("action");
    expect(resolveKnowledgeOverlaySelection(document).kind).toBe("action");
  });

  it("classifies navigation documents", () => {
    const document: KnowledgeDocument = {
      documentId: "platform.navigation:home",
      sourceId: "platform.navigation",
      kind: "navigation",
      title: "Home",
      navigation: { type: "workbench-route", target: "/home" },
    };

    expect(resolveKnowledgeSelectionKind(document)).toBe("navigation");
  });
});

describe("delegateKnowledgeOverlaySelection", () => {
  it("delegates action selection to injected handler", async () => {
    const onSelectAction = vi.fn();
    const onSelectNavigation = vi.fn();

    await delegateKnowledgeOverlaySelection(
      {
        documentId: "platform.actions:theme",
        sourceId: "platform.actions",
        kind: "command",
        title: "Theme",
        actionRef: { actionId: "platform.theme.toggle" },
      },
      { onSelectAction, onSelectNavigation },
    );

    expect(onSelectAction).toHaveBeenCalledWith(
      "platform.theme.toggle",
      expect.objectContaining({ documentId: "platform.actions:theme" }),
    );
    expect(onSelectNavigation).not.toHaveBeenCalled();
  });

  it("delegates navigation selection to injected handler", async () => {
    const onSelectAction = vi.fn();
    const onSelectNavigation = vi.fn();
    const navigation = { type: "workbench-route" as const, target: "/admin" };

    await delegateKnowledgeOverlaySelection(
      {
        documentId: "platform.navigation:admin",
        sourceId: "platform.navigation",
        kind: "navigation",
        title: "Administration",
        navigation,
      },
      { onSelectAction, onSelectNavigation },
    );

    expect(onSelectNavigation).toHaveBeenCalledWith(
      navigation,
      expect.objectContaining({ documentId: "platform.navigation:admin" }),
    );
    expect(onSelectAction).not.toHaveBeenCalled();
  });

  it("createWorkbenchKnowledgeSelectionHandlers wires execute and navigate", async () => {
    const executeAction = vi.fn();
    const navigate = vi.fn();
    const handlers = createWorkbenchKnowledgeSelectionHandlers({
      executeAction,
      navigate,
    });

    await handlers.onSelectAction("platform.theme.toggle", {
      documentId: "x",
      sourceId: "platform.actions",
      kind: "command",
      title: "Theme",
    });
    await handlers.onSelectNavigation(
      { type: "workbench-route", target: "/home" },
      {
        documentId: "y",
        sourceId: "platform.navigation",
        kind: "navigation",
        title: "Home",
      },
    );

    expect(executeAction).toHaveBeenCalledWith("platform.theme.toggle");
    expect(navigate).toHaveBeenCalledWith({ type: "workbench-route", target: "/home" });
  });
});
