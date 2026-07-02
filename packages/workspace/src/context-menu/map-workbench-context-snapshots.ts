import type {
  ActionContextSnapshot,
  ActionSelectionSnapshot,
} from "@apzhub/command-framework";

export interface WorkbenchContextMenuInput {
  readonly selectionMode?: ActionSelectionSnapshot["mode"];
  readonly contextTypes?: readonly string[];
}

export function toActionSelectionSnapshot(
  input?: WorkbenchContextMenuInput,
): ActionSelectionSnapshot | undefined {
  if (!input?.selectionMode) {
    return undefined;
  }

  return { mode: input.selectionMode };
}

export function toActionContextSnapshot(
  input?: WorkbenchContextMenuInput,
): ActionContextSnapshot | undefined {
  if (!input?.contextTypes || input.contextTypes.length === 0) {
    return undefined;
  }

  return { contextTypes: input.contextTypes };
}
