"use client";

import {
  getClientDisplayName,
  getLeadAttorneyLabel,
  getMatterTypeLabel,
  type Matter,
} from "../../lib/matters";
import { LawListTableShell } from "../ux/data-table/law-list-table-shell";
import { LawStatusBadge } from "../ux/law-status-badge";

export interface MatterListTableProps {
  readonly matters: readonly Matter[];
  readonly selectedMatterId?: string;
  readonly onSelect?: (matter: Matter) => void;
  readonly onOpen?: (matter: Matter) => void;
}

const COLUMNS: ReadonlyArray<{
  readonly id: string;
  readonly header: string;
  readonly width?: string;
}> = [
  { id: "matterReference", header: "Reference", width: "10rem" },
  { id: "title", header: "Title" },
  { id: "client", header: "Client", width: "10rem" },
  { id: "matterType", header: "Matter type", width: "9rem" },
  { id: "status", header: "Status", width: "8rem" },
  { id: "priority", header: "Priority", width: "8rem" },
  { id: "attorney", header: "Attorney", width: "10rem" },
  { id: "tags", header: "Tags", width: "12rem" },
] as const;

/** Matter list table — standardised shell with status badges (LAW-013-05). */
export function MatterListTable({
  matters,
  selectedMatterId,
  onSelect,
  onOpen,
}: MatterListTableProps) {
  return (
    <LawListTableShell
      columns={COLUMNS}
      testId="matter-list-table"
      isEmpty={matters.length === 0}
      emptyMessage="No matters match the current filters."
    >
      {matters.map((matter) => {
        const selected = matter.matterId === selectedMatterId;

        return (
          <tr
            key={matter.matterId}
            data-testid={`matter-list-row-${matter.matterReference}`}
            className={selected ? "bg-[var(--color-muted)]/30" : undefined}
            onClick={() => onSelect?.(matter)}
          >
            <td className="px-4 py-3 font-mono text-xs text-[var(--color-foreground)]">
              {matter.matterReference}
            </td>
            <td className="px-4 py-3 text-[var(--color-foreground)]">{matter.title}</td>
            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
              {getClientDisplayName(matter.clientId)}
            </td>
            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
              {getMatterTypeLabel(matter.matterTypeId)}
            </td>
            <td className="px-4 py-3">
              <LawStatusBadge status={matter.matterStatus} />
            </td>
            <td className="px-4 py-3 capitalize text-[var(--color-muted-foreground)]">
              {matter.priority}
            </td>
            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
              {getLeadAttorneyLabel(matter.leadAttorneyId)}
            </td>
            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
              {matter.tags.length > 0 ? matter.tags.join(", ") : "—"}
            </td>
            <td className="px-4 py-3 text-right">
              <button
                type="button"
                className="text-sm font-medium text-[var(--law-accent)] hover:underline"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen?.(matter);
                }}
                data-testid={`matter-open-${matter.matterReference}`}
              >
                Open
              </button>
            </td>
          </tr>
        );
      })}
    </LawListTableShell>
  );
}
