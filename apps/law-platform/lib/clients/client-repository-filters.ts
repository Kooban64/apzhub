import type { Client, ClientSearchCriteria } from "@apzhub/legal-business-core";

export function matchesClientCriteria(
  client: Client,
  criteria?: ClientSearchCriteria,
): boolean {
  if (!criteria) {
    return true;
  }

  if (
    criteria.status &&
    criteria.status !== "all" &&
    client.status !== criteria.status
  ) {
    return false;
  }

  if (
    criteria.clientType &&
    criteria.clientType !== "all" &&
    client.clientType !== criteria.clientType
  ) {
    return false;
  }

  const query = criteria.query?.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const haystack = [
    client.displayName,
    client.clientReference,
    client.clientType,
    client.status,
    ...client.tags,
    ...Object.values(client.customFields),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function sortClientsByDisplayName(clients: readonly Client[]): Client[] {
  return [...clients].sort((left, right) =>
    left.displayName.localeCompare(right.displayName),
  );
}
