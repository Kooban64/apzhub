/** Provisional canonical ID helpers — SDK IdentityMapper with zammad slug. */

import { createIdentityMapper } from "@apzhub/integration-sdk/mapping";

export interface MapperContext {
  readonly tenantId: string;
}

const ids = createIdentityMapper("zammad");

export function toSupportTicketId(zammadId: string | number): string {
  return ids.toProvisionalId("sreq", zammadId);
}

export function toSupportOrganizationId(zammadId: string | number): string {
  return ids.toProvisionalId("sorg", zammadId);
}

export function toSupportGroupId(zammadId: string | number): string {
  return ids.toProvisionalId("sgrp", zammadId);
}

export function toSupportUserId(zammadId: string | number): string {
  return ids.toProvisionalId("suser", zammadId);
}

export function toSupportArticleId(zammadId: string | number): string {
  return ids.toProvisionalId("sart", zammadId);
}

export function toSupportArticleAttachmentId(zammadId: string | number): string {
  return ids.toProvisionalId("satt", zammadId);
}

export function toSupportHistoryEventId(zammadId: string | number): string {
  return ids.toProvisionalId("shist", zammadId);
}

export function toSupportSearchHitId(kind: string, zammadId: string | number): string {
  return `shit_${kind}_zammad_${zammadId}`;
}

export function extractZammadId(canonicalId: string, prefix: string): string {
  return ids.extractNativeId(canonicalId, prefix);
}

export function extractSupportTicketZammadId(id: string): string {
  return extractZammadId(id, "sreq");
}

export function extractSupportOrganizationZammadId(id: string): string {
  return extractZammadId(id, "sorg");
}

export function extractSupportGroupZammadId(id: string): string {
  return extractZammadId(id, "sgrp");
}

export function extractSupportUserZammadId(id: string): string {
  return extractZammadId(id, "suser");
}

export function extractSupportArticleZammadId(id: string): string {
  return extractZammadId(id, "sart");
}

export function extractSupportArticleAttachmentZammadId(id: string): string {
  return extractZammadId(id, "satt");
}
