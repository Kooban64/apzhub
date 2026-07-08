import {
  CLIENT_STATUSES,
  CLIENT_TYPES,
  MATTER_STATUSES,
  MATTER_TYPE_CODES,
  RELATIONSHIP_TYPES,
  type ClientStatus,
  type ClientType,
  type MatterStatus,
  type MatterTypeCode,
  type RelationshipType,
} from "../domain";
import { StaticLookupService, type LookupItem } from "./lookup-service";

function toLookupItems<T extends string>(
  values: readonly T[],
  labels: Record<T, string>,
): LookupItem<T>[] {
  return values.map((value) => ({ value, label: labels[value] }));
}

const MATTER_STATUS_LABELS: Record<MatterStatus, string> = {
  prospect: "Prospect",
  open: "Open",
  pending: "Pending",
  on_hold: "On Hold",
  closed: "Closed",
  archived: "Archived",
};

const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  prospect: "Prospect",
  active: "Active",
  inactive: "Inactive",
  archived: "Archived",
};

const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  individual: "Individual",
  organisation: "Organisation",
};

const MATTER_TYPE_LABELS: Record<MatterTypeCode, string> = {
  litigation: "Litigation",
  transactional: "Transactional",
  advisory: "Advisory",
  regulatory: "Regulatory",
  family: "Family Law",
  criminal: "Criminal",
  other: "Other",
};

const RELATIONSHIP_TYPE_LABELS: Record<RelationshipType, string> = {
  spouse: "Spouse / Partner",
  director: "Director",
  employee: "Employee",
  opposing_party: "Opposing Party",
  opposing_counsel: "Opposing Counsel",
  witness: "Witness",
  billing_contact: "Billing Contact",
  emergency_contact: "Emergency Contact",
  other: "Other",
};

export const matterStatusLookup = new StaticLookupService<MatterStatus>(
  toLookupItems(MATTER_STATUSES, MATTER_STATUS_LABELS),
);

export const clientStatusLookup = new StaticLookupService<ClientStatus>(
  toLookupItems(CLIENT_STATUSES, CLIENT_STATUS_LABELS),
);

export const clientTypeLookup = new StaticLookupService<ClientType>(
  toLookupItems(CLIENT_TYPES, CLIENT_TYPE_LABELS),
);

export const matterTypeLookup = new StaticLookupService<MatterTypeCode>(
  toLookupItems(MATTER_TYPE_CODES, MATTER_TYPE_LABELS),
);

export const relationshipTypeLookup = new StaticLookupService<RelationshipType>(
  toLookupItems(RELATIONSHIP_TYPES, RELATIONSHIP_TYPE_LABELS),
);

export const practiceAreaLookup = new StaticLookupService<string>([
  { value: "litigation", label: "Litigation" },
  { value: "corporate", label: "Corporate" },
  { value: "family", label: "Family Law" },
  { value: "property", label: "Property" },
  { value: "employment", label: "Employment" },
]);

export const countryLookup = new StaticLookupService<string>([
  { value: "AU", label: "Australia" },
  { value: "NZ", label: "New Zealand" },
  { value: "GB", label: "United Kingdom" },
  { value: "US", label: "United States" },
  { value: "SG", label: "Singapore" },
]);

export const languageLookup = new StaticLookupService<string>([
  { value: "en-AU", label: "English (Australia)" },
  { value: "en-GB", label: "English (United Kingdom)" },
  { value: "en-US", label: "English (United States)" },
]);

export const legalLookups = {
  matterStatus: matterStatusLookup,
  clientStatus: clientStatusLookup,
  clientType: clientTypeLookup,
  matterType: matterTypeLookup,
  relationshipType: relationshipTypeLookup,
  practiceArea: practiceAreaLookup,
  country: countryLookup,
  language: languageLookup,
} as const;
