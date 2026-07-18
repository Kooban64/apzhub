/**
 * Module-level Platform Identity Administration client accessor + facades (APZIDENTITY-003).
 */

import { createHttpIdentityClient, type IdentityClient } from "./identity-client";
import { createMockIdentityClient } from "./mock-identity-client";

let identityClient: IdentityClient =
  typeof process !== "undefined" && process.env.NODE_ENV === "test"
    ? createMockIdentityClient()
    : createHttpIdentityClient();

export function setIdentityClient(client: IdentityClient): void {
  identityClient = client;
}

export function getIdentityClient(): IdentityClient {
  return identityClient;
}

export function resetIdentityClient(): void {
  identityClient = createMockIdentityClient();
}

export function listUsers(...args: Parameters<IdentityClient["listUsers"]>) {
  return getIdentityClient().listUsers(...args);
}

export function getUser(...args: Parameters<IdentityClient["getUser"]>) {
  return getIdentityClient().getUser(...args);
}

export function createUser(...args: Parameters<IdentityClient["createUser"]>) {
  return getIdentityClient().createUser(...args);
}

export function updateUser(...args: Parameters<IdentityClient["updateUser"]>) {
  return getIdentityClient().updateUser(...args);
}

export function listGroups(...args: Parameters<IdentityClient["listGroups"]>) {
  return getIdentityClient().listGroups(...args);
}

export function getGroup(...args: Parameters<IdentityClient["getGroup"]>) {
  return getIdentityClient().getGroup(...args);
}

export function createGroup(...args: Parameters<IdentityClient["createGroup"]>) {
  return getIdentityClient().createGroup(...args);
}

export function updateGroup(...args: Parameters<IdentityClient["updateGroup"]>) {
  return getIdentityClient().updateGroup(...args);
}

export function listRoles(...args: Parameters<IdentityClient["listRoles"]>) {
  return getIdentityClient().listRoles(...args);
}

export function getRole(...args: Parameters<IdentityClient["getRole"]>) {
  return getIdentityClient().getRole(...args);
}

export function createRole(...args: Parameters<IdentityClient["createRole"]>) {
  return getIdentityClient().createRole(...args);
}

export function updateRole(...args: Parameters<IdentityClient["updateRole"]>) {
  return getIdentityClient().updateRole(...args);
}

export function listOrganisations(
  ...args: Parameters<IdentityClient["listOrganisations"]>
) {
  return getIdentityClient().listOrganisations(...args);
}

export function getOrganisation(
  ...args: Parameters<IdentityClient["getOrganisation"]>
) {
  return getIdentityClient().getOrganisation(...args);
}

export function createOrganisation(
  ...args: Parameters<IdentityClient["createOrganisation"]>
) {
  return getIdentityClient().createOrganisation(...args);
}

export function updateOrganisation(
  ...args: Parameters<IdentityClient["updateOrganisation"]>
) {
  return getIdentityClient().updateOrganisation(...args);
}

export function listTenants(...args: Parameters<IdentityClient["listTenants"]>) {
  return getIdentityClient().listTenants(...args);
}

export function getTenant(...args: Parameters<IdentityClient["getTenant"]>) {
  return getIdentityClient().getTenant(...args);
}

export function createTenant(...args: Parameters<IdentityClient["createTenant"]>) {
  return getIdentityClient().createTenant(...args);
}

export function updateTenant(...args: Parameters<IdentityClient["updateTenant"]>) {
  return getIdentityClient().updateTenant(...args);
}

export function listDepartments(
  ...args: Parameters<IdentityClient["listDepartments"]>
) {
  return getIdentityClient().listDepartments(...args);
}

export function getDepartment(...args: Parameters<IdentityClient["getDepartment"]>) {
  return getIdentityClient().getDepartment(...args);
}

export function createDepartment(
  ...args: Parameters<IdentityClient["createDepartment"]>
) {
  return getIdentityClient().createDepartment(...args);
}

export function updateDepartment(
  ...args: Parameters<IdentityClient["updateDepartment"]>
) {
  return getIdentityClient().updateDepartment(...args);
}

export function listPositions(...args: Parameters<IdentityClient["listPositions"]>) {
  return getIdentityClient().listPositions(...args);
}

export function getPosition(...args: Parameters<IdentityClient["getPosition"]>) {
  return getIdentityClient().getPosition(...args);
}

export function createPosition(...args: Parameters<IdentityClient["createPosition"]>) {
  return getIdentityClient().createPosition(...args);
}

export function updatePosition(...args: Parameters<IdentityClient["updatePosition"]>) {
  return getIdentityClient().updatePosition(...args);
}

export function listMemberships(
  ...args: Parameters<IdentityClient["listMemberships"]>
) {
  return getIdentityClient().listMemberships(...args);
}

export function getMembership(...args: Parameters<IdentityClient["getMembership"]>) {
  return getIdentityClient().getMembership(...args);
}

export function createMembership(
  ...args: Parameters<IdentityClient["createMembership"]>
) {
  return getIdentityClient().createMembership(...args);
}

export function updateMembership(
  ...args: Parameters<IdentityClient["updateMembership"]>
) {
  return getIdentityClient().updateMembership(...args);
}

export function listServiceAssignments(
  ...args: Parameters<IdentityClient["listServiceAssignments"]>
) {
  return getIdentityClient().listServiceAssignments(...args);
}

export function getServiceAssignment(
  ...args: Parameters<IdentityClient["getServiceAssignment"]>
) {
  return getIdentityClient().getServiceAssignment(...args);
}

export function createServiceAssignment(
  ...args: Parameters<IdentityClient["createServiceAssignment"]>
) {
  return getIdentityClient().createServiceAssignment(...args);
}

export function updateServiceAssignment(
  ...args: Parameters<IdentityClient["updateServiceAssignment"]>
) {
  return getIdentityClient().updateServiceAssignment(...args);
}

export function listInvitations(
  ...args: Parameters<IdentityClient["listInvitations"]>
) {
  return getIdentityClient().listInvitations(...args);
}

export function getInvitation(...args: Parameters<IdentityClient["getInvitation"]>) {
  return getIdentityClient().getInvitation(...args);
}

export function createInvitation(
  ...args: Parameters<IdentityClient["createInvitation"]>
) {
  return getIdentityClient().createInvitation(...args);
}

export function updateInvitation(
  ...args: Parameters<IdentityClient["updateInvitation"]>
) {
  return getIdentityClient().updateInvitation(...args);
}

export function listActivations(
  ...args: Parameters<IdentityClient["listActivations"]>
) {
  return getIdentityClient().listActivations(...args);
}

export function getActivation(...args: Parameters<IdentityClient["getActivation"]>) {
  return getIdentityClient().getActivation(...args);
}

export function createActivation(
  ...args: Parameters<IdentityClient["createActivation"]>
) {
  return getIdentityClient().createActivation(...args);
}

export function listDeactivations(
  ...args: Parameters<IdentityClient["listDeactivations"]>
) {
  return getIdentityClient().listDeactivations(...args);
}

export function getDeactivation(
  ...args: Parameters<IdentityClient["getDeactivation"]>
) {
  return getIdentityClient().getDeactivation(...args);
}

export function createDeactivation(
  ...args: Parameters<IdentityClient["createDeactivation"]>
) {
  return getIdentityClient().createDeactivation(...args);
}

export function listPolicies(...args: Parameters<IdentityClient["listPolicies"]>) {
  return getIdentityClient().listPolicies(...args);
}

export function getPolicy(...args: Parameters<IdentityClient["getPolicy"]>) {
  return getIdentityClient().getPolicy(...args);
}

export function createPolicy(...args: Parameters<IdentityClient["createPolicy"]>) {
  return getIdentityClient().createPolicy(...args);
}

export function updatePolicy(...args: Parameters<IdentityClient["updatePolicy"]>) {
  return getIdentityClient().updatePolicy(...args);
}

export function listAudit(...args: Parameters<IdentityClient["listAudit"]>) {
  return getIdentityClient().listAudit(...args);
}

export function getAudit(...args: Parameters<IdentityClient["getAudit"]>) {
  return getIdentityClient().getAudit(...args);
}

export function listHistory(...args: Parameters<IdentityClient["listHistory"]>) {
  return getIdentityClient().listHistory(...args);
}

export function getHistory(...args: Parameters<IdentityClient["getHistory"]>) {
  return getIdentityClient().getHistory(...args);
}

export function listReferences(...args: Parameters<IdentityClient["listReferences"]>) {
  return getIdentityClient().listReferences(...args);
}

export function getReference(...args: Parameters<IdentityClient["getReference"]>) {
  return getIdentityClient().getReference(...args);
}

export function createReference(
  ...args: Parameters<IdentityClient["createReference"]>
) {
  return getIdentityClient().createReference(...args);
}

export function updateReference(
  ...args: Parameters<IdentityClient["updateReference"]>
) {
  return getIdentityClient().updateReference(...args);
}

export function getHealth(...args: Parameters<IdentityClient["getHealth"]>) {
  return getIdentityClient().getHealth(...args);
}

export function getReadiness(...args: Parameters<IdentityClient["getReadiness"]>) {
  return getIdentityClient().getReadiness(...args);
}

export function getCapabilities(
  ...args: Parameters<IdentityClient["getCapabilities"]>
) {
  return getIdentityClient().getCapabilities(...args);
}

export function getManagementCapabilities(
  ...args: Parameters<IdentityClient["getManagementCapabilities"]>
) {
  return getIdentityClient().getManagementCapabilities(...args);
}
