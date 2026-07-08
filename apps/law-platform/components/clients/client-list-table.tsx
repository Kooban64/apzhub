"use client";

import type { Client } from "../../lib/clients";
import { LawListTableShell } from "../ux/data-table/law-list-table-shell";
import { LawStatusBadge } from "../ux/law-status-badge";

export interface ClientListTableProps {
  readonly clients: readonly Client[];
  readonly selectedClientId?: string;
  readonly onSelect?: (client: Client) => void;
  readonly onOpen?: (client: Client) => void;
}

const COLUMNS = [
  { id: "clientReference", header: "Reference", width: "10rem" },
  { id: "displayName", header: "Display Name" },
  { id: "clientType", header: "Type", width: "8rem" },
  { id: "status", header: "Status", width: "8rem" },
  { id: "tags", header: "Tags", width: "12rem" },
] as const;

/** Client list table — standardised shell with status badges (LAW-013-05). */
export function ClientListTable({
  clients,
  selectedClientId,
  onSelect,
  onOpen,
}: ClientListTableProps) {
  return (
    <LawListTableShell
      columns={COLUMNS}
      testId="client-list-table"
      isEmpty={clients.length === 0}
      emptyMessage="No clients match the current filters."
    >
      {clients.map((client) => {
        const selected = client.clientId === selectedClientId;

        return (
          <tr
            key={client.clientId}
            data-testid={`client-list-row-${client.clientReference}`}
            className={selected ? "bg-[var(--color-muted)]/30" : undefined}
            onClick={() => onSelect?.(client)}
          >
            <td className="px-4 py-3 font-mono text-xs text-[var(--color-foreground)]">
              {client.clientReference}
            </td>
            <td className="px-4 py-3 text-[var(--color-foreground)]">
              {client.displayName}
            </td>
            <td className="px-4 py-3 capitalize text-[var(--color-muted-foreground)]">
              {client.clientType}
            </td>
            <td className="px-4 py-3">
              <LawStatusBadge status={client.status} />
            </td>
            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
              {client.tags.length > 0 ? client.tags.join(", ") : "—"}
            </td>
            <td className="px-4 py-3 text-right">
              <button
                type="button"
                className="text-sm font-medium text-[var(--law-accent)] hover:underline"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen?.(client);
                }}
                data-testid={`client-open-${client.clientReference}`}
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
