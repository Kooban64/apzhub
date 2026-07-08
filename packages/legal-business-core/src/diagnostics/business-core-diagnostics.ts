import { LEGAL_BUSINESS_CORE_VERSION } from "../constants";
import { DOMAIN_ENTITY_TYPES } from "../domain";

export interface LegalBusinessCoreDiagnostics {
  readonly version: string;
  readonly supportedEntities: readonly string[];
  readonly repositoryInterfaces: readonly string[];
  readonly validators: readonly string[];
  readonly factories: readonly string[];
  readonly formatters: readonly string[];
  readonly referenceGenerators: readonly string[];
  readonly lookups: readonly string[];
}

/** Describes the Legal Business Core surface area (LAW-002-02). */
export function getLegalBusinessCoreDiagnostics(): LegalBusinessCoreDiagnostics {
  return {
    version: LEGAL_BUSINESS_CORE_VERSION,
    supportedEntities: [...DOMAIN_ENTITY_TYPES],
    repositoryInterfaces: [
      "ClientRepository",
      "MatterRepository",
      "DocumentRepository",
      "TaskRepository",
      "InvoiceRepository",
      "CalendarRepository",
      "TimeRepository",
      "KnowledgeRepository",
    ],
    validators: [
      "ClientValidator",
      "MatterValidator",
      "AddressValidator",
      "EmailValidator",
      "PhoneValidator",
      "ReferenceValidator",
    ],
    factories: [
      "ClientFactory",
      "MatterFactory",
      "DocumentFactory",
      "TaskFactory",
      "TimeEntryFactory",
      "CalendarEventFactory",
    ],
    formatters: [
      "formatPersonName",
      "formatClientDisplayName",
      "formatMatterListLabel",
      "formatDocumentTitle",
      "formatAddressLines",
      "formatPhoneNumber",
      "formatClientReference",
      "formatIsoDate",
      "formatCurrency",
      "formatDurationMinutes",
    ],
    referenceGenerators: ["ReferenceNumberGenerator", "MockReferenceSequenceProvider"],
    lookups: [
      "matterStatusLookup",
      "clientStatusLookup",
      "clientTypeLookup",
      "matterTypeLookup",
      "relationshipTypeLookup",
      "practiceAreaLookup",
      "countryLookup",
      "languageLookup",
    ],
  };
}
