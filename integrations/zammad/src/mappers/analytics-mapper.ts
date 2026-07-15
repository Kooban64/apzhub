import type {
  SupportDistributionBucket,
  SupportIntelligenceSnapshot,
  SupportTicket,
} from "../models/canonical";

function bucketize(
  items: readonly SupportTicket[],
  getKey: (ticket: SupportTicket) => string,
  getLabel?: (key: string, ticket: SupportTicket) => string,
): readonly SupportDistributionBucket[] {
  const counts = new Map<string, { count: number; label?: string }>();
  for (const ticket of items) {
    const key = getKey(ticket);
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(key, {
        count: 1,
        label: getLabel?.(key, ticket),
      });
    }
  }
  return [...counts.entries()]
    .map(([key, value]) => ({
      key,
      label: value.label,
      count: value.count,
    }))
    .sort((left, right) => right.count - left.count || left.key.localeCompare(right.key));
}

function isOverdue(ticket: SupportTicket, nowMs: number): boolean {
  if (ticket.status === "closed" || ticket.status === "merged") return false;
  const updated = Date.parse(ticket.updatedAt);
  if (!Number.isFinite(updated)) return false;
  // Heuristic: open tickets untouched for > 7 days count as overdue when engine has no SLA API.
  return nowMs - updated > 7 * 24 * 60 * 60 * 1000;
}

export function mapSupportIntelligenceSnapshot(input: {
  readonly tickets: readonly SupportTicket[];
  readonly articleCount?: number;
  readonly capturedAt: string;
  readonly averageFirstResponseMinutes?: number;
}): SupportIntelligenceSnapshot {
  const nowMs = Date.parse(input.capturedAt) || Date.now();
  const tickets = input.tickets;

  const openTickets = tickets.filter(
    (ticket) => ticket.status === "open" || ticket.status === "new",
  ).length;
  const closedTickets = tickets.filter((ticket) => ticket.status === "closed").length;
  const pendingTickets = tickets.filter((ticket) => ticket.status === "pending").length;
  const newTickets = tickets.filter((ticket) => ticket.status === "new").length;
  const unassignedTickets = tickets.filter((ticket) => !ticket.assigneeId).length;
  const overdueTickets = tickets.filter((ticket) => isOverdue(ticket, nowMs)).length;

  return {
    capturedAt: input.capturedAt,
    totalTickets: tickets.length,
    openTickets,
    closedTickets,
    pendingTickets,
    newTickets,
    overdueTickets,
    unassignedTickets,
    articleCount: input.articleCount,
    byPriority: bucketize(tickets, (ticket) => ticket.priority),
    byState: bucketize(tickets, (ticket) => ticket.status),
    byOrganization: bucketize(
      tickets.filter((ticket) => ticket.organizationId),
      (ticket) => ticket.organizationId ?? "none",
    ),
    byGroup: bucketize(tickets, (ticket) => ticket.groupId),
    byOwner: bucketize(
      tickets,
      (ticket) => ticket.assigneeId ?? "unassigned",
      (key) => (key === "unassigned" ? "Unassigned" : key),
    ),
    averageFirstResponseMinutes: input.averageFirstResponseMinutes,
  };
}
