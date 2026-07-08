import type {
  AddressType,
  ClientStatus,
  ClientType,
  CommunicationDirection,
  CommunicationType,
  PhoneType,
  RelationshipType,
} from "./enums";

export interface Client {
  readonly clientId: string;
  readonly clientReference: string;
  readonly displayName: string;
  readonly clientType: ClientType;
  readonly status: ClientStatus;
  readonly primaryContactId?: string;
  readonly billingAddressId?: string;
  readonly tags: readonly string[];
  readonly customFields: Readonly<Record<string, string>>;
}

export interface Organisation {
  readonly organisationId: string;
  readonly organisationReference: string;
  readonly legalName: string;
  readonly tradingName?: string;
  readonly registrationNumber?: string;
  readonly taxIdentifier?: string;
  readonly organisationType?: string;
  readonly addressIds: readonly string[];
  readonly contactIds: readonly string[];
}

export interface Contact {
  readonly contactId: string;
  readonly contactReference: string;
  readonly givenName: string;
  readonly familyName: string;
  readonly displayName: string;
  readonly title?: string;
  readonly roleTitle?: string;
  readonly emailIds: readonly string[];
  readonly phoneIds: readonly string[];
  readonly addressIds: readonly string[];
  readonly preferredCommunicationType?: CommunicationType;
}

export interface Relationship {
  readonly relationshipId: string;
  readonly relationshipType: RelationshipType;
  readonly sourceEntityType: string;
  readonly sourceEntityId: string;
  readonly targetEntityType: string;
  readonly targetEntityId: string;
  readonly effectiveFrom?: string;
  readonly effectiveTo?: string;
  readonly notes?: string;
}

export interface Address {
  readonly addressId: string;
  readonly addressType: AddressType;
  readonly line1: string;
  readonly line2?: string;
  readonly city: string;
  readonly region?: string;
  readonly postalCode?: string;
  readonly countryCode: string;
  readonly isPrimary: boolean;
}

export interface Communication {
  readonly communicationId: string;
  readonly communicationReference: string;
  readonly communicationType: CommunicationType;
  readonly subject: string;
  readonly body: string;
  readonly occurredAt: string;
  readonly direction: CommunicationDirection;
  readonly participantIds: readonly string[];
  readonly matterId?: string;
  readonly clientId?: string;
  readonly attachmentIds: readonly string[];
}

export interface EmailAddress {
  readonly emailId: string;
  readonly address: string;
  readonly label?: string;
  readonly isPrimary: boolean;
}

export interface EmailMessage {
  readonly emailId: string;
  readonly messageId: string;
  readonly from: string;
  readonly to: readonly string[];
  readonly subject: string;
  readonly sentAt: string;
  readonly communicationId?: string;
}

export type Email = EmailAddress | EmailMessage;

export interface Phone {
  readonly phoneId: string;
  readonly number: string;
  readonly extension?: string;
  readonly phoneType: PhoneType;
  readonly isPrimary: boolean;
  readonly countryCode?: string;
}

export interface ClientSearchCriteria {
  readonly query?: string;
  readonly status?: ClientStatus | "all";
  readonly clientType?: ClientType | "all";
}
