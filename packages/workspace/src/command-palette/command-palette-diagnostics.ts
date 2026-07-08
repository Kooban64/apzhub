import type { CommandPaletteDiagnostics } from "@apzhub/ui";
import type { ClientActionRegistryDiagnostics } from "@apzhub/command-framework/react";
import type { ClientKnowledgeQueryDiagnostics } from "@apzhub/knowledge-discovery-framework/react";
import type { KnowledgeQueryStatus } from "@apzhub/knowledge-discovery-framework/react";

import type { CommandPaletteMode } from "./command-palette-mode";

export interface CommandPaletteSurfaceDiagnostics extends CommandPaletteDiagnostics {
  readonly surface: "command-palette";
  readonly mode: CommandPaletteMode;
  readonly knowledgeQueryStatus?: KnowledgeQueryStatus;
  readonly knowledgeDocumentCount?: number;
  readonly knowledgeGroupCount?: number;
  readonly lastSelectedDocumentId?: string;
  readonly knowledgeQueryDiagnostics?: ClientKnowledgeQueryDiagnostics;
}

export function buildCommandPaletteDiagnostics(input: {
  readonly open: boolean;
  readonly query: string;
  readonly selectedIndex: number;
  readonly visibleCommandCount: number;
  readonly registryDiagnostics: ClientActionRegistryDiagnostics;
  readonly executionCount: number;
  readonly lastExecutionAt?: string;
  readonly lastExecutionOk?: boolean;
  readonly lastSelectedId?: string;
  readonly mode?: CommandPaletteMode;
  readonly knowledgeQueryStatus?: KnowledgeQueryStatus;
  readonly knowledgeDocumentCount?: number;
  readonly knowledgeGroupCount?: number;
  readonly lastSelectedDocumentId?: string;
  readonly knowledgeQueryDiagnostics?: ClientKnowledgeQueryDiagnostics;
}): CommandPaletteSurfaceDiagnostics {
  return {
    surface: "command-palette",
    mode: input.mode ?? "commands",
    open: input.open,
    query: input.query,
    selectedIndex: input.selectedIndex,
    visibleCommandCount: input.visibleCommandCount,
    registryReady:
      input.registryDiagnostics.status === "hydrated" ||
      input.registryDiagnostics.status === "empty",
    registryActionCount: input.registryDiagnostics.actionCount,
    executionCount: input.executionCount,
    lastExecutionAt: input.lastExecutionAt,
    lastExecutionOk: input.lastExecutionOk,
    lastSelectedId: input.lastSelectedId,
    knowledgeQueryStatus: input.knowledgeQueryStatus,
    knowledgeDocumentCount: input.knowledgeDocumentCount,
    knowledgeGroupCount: input.knowledgeGroupCount,
    lastSelectedDocumentId: input.lastSelectedDocumentId,
    knowledgeQueryDiagnostics: input.knowledgeQueryDiagnostics,
  };
}
