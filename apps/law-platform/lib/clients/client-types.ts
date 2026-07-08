/** UI form model for Client Management screens — LAW-002-01. */
import type { Client, ClientStatus, ClientType } from "@apzhub/legal-business-core";

export type {
  Client,
  ClientSearchCriteria,
  ClientStatus,
  ClientType,
} from "@apzhub/legal-business-core";
export { CLIENT_STATUSES, CLIENT_TYPES } from "@apzhub/legal-business-core";

export interface ClientFormValues {
  readonly clientReference: string;
  readonly displayName: string;
  readonly clientType: ClientType;
  readonly status: ClientStatus;
  readonly primaryContactId: string;
  readonly billingAddressId: string;
  readonly tags: string;
  readonly customFields: string;
}

export function clientToFormValues(client: Client): ClientFormValues {
  return {
    clientReference: client.clientReference,
    displayName: client.displayName,
    clientType: client.clientType,
    status: client.status,
    primaryContactId: client.primaryContactId ?? "",
    billingAddressId: client.billingAddressId ?? "",
    tags: client.tags.join(", "),
    customFields: Object.entries(client.customFields)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n"),
  };
}

export function createEmptyClientFormValues(): ClientFormValues {
  return {
    clientReference: "",
    displayName: "",
    clientType: "individual",
    status: "prospect",
    primaryContactId: "",
    billingAddressId: "",
    tags: "",
    customFields: "",
  };
}
