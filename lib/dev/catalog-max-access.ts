import { getMockAccessData } from "@/lib/admin/mock-access-data";

/**
 * Maximum (highest-privilege) role token per catalog service id for demo/testing seeds.
 * Must include every service id in `getMockAccessData().services.services`.
 */
export const MAX_ROLE_BY_SERVICE_ID: Record<string, string> = {
  mail: "r-mail-admin",
  calendar: "r-cal-admin",
  drive: "r-drive-view",
  plane: "r-plane-admin",
  zammad: "r-zammad-admin",
  kimai: "r-kimai-admin",
  kiwi: "r-kiwi-admin",
  paperless: "r-paperless-admin",
  n8n: "r-n8n-owner",
  reminders: "r-reminders-user",
  chat: "r-chat-user",
};

export function listCatalogServiceIds(): string[] {
  return getMockAccessData().services.services.map((s) => s.id);
}

export function maxRoleTokenForService(serviceId: string): string {
  const token = MAX_ROLE_BY_SERVICE_ID[serviceId];
  if (!token) {
    throw new Error(`No max role token configured for service id: ${serviceId}`);
  }
  return token;
}

/**
 * Throws if any catalog service is missing from MAX_ROLE_BY_SERVICE_ID.
 * Used from tests (and optionally CI) when the catalog grows.
 */
export function assertMaxAccessMapComplete(): void {
  const catalogIds = listCatalogServiceIds();
  const missing = catalogIds.filter((id) => !(id in MAX_ROLE_BY_SERVICE_ID));
  if (missing.length > 0) {
    throw new Error(
      `MAX_ROLE_BY_SERVICE_ID is missing catalog service ids: ${missing.join(", ")}`,
    );
  }
}
