/**
 * Module-level Platform Administration client accessor + facades (APZADMIN-003).
 */

import {
  createHttpAdministrationClient,
  type AdministrationClient,
} from "./administration-client";
import { createMockAdministrationClient } from "./mock-administration-client";

let administrationClient: AdministrationClient =
  typeof process !== "undefined" && process.env.NODE_ENV === "test"
    ? createMockAdministrationClient()
    : createHttpAdministrationClient();

export function setAdministrationClient(client: AdministrationClient): void {
  administrationClient = client;
}

export function getAdministrationClient(): AdministrationClient {
  return administrationClient;
}

export function resetAdministrationClient(): void {
  administrationClient = createMockAdministrationClient();
}

export function listModules(...args: Parameters<AdministrationClient["listModules"]>) {
  return getAdministrationClient().listModules(...args);
}

export function getModule(...args: Parameters<AdministrationClient["getModule"]>) {
  return getAdministrationClient().getModule(...args);
}

export function createModule(
  ...args: Parameters<AdministrationClient["createModule"]>
) {
  return getAdministrationClient().createModule(...args);
}

export function updateModule(
  ...args: Parameters<AdministrationClient["updateModule"]>
) {
  return getAdministrationClient().updateModule(...args);
}

export function archiveModule(
  ...args: Parameters<AdministrationClient["archiveModule"]>
) {
  return getAdministrationClient().archiveModule(...args);
}

export function restoreModule(
  ...args: Parameters<AdministrationClient["restoreModule"]>
) {
  return getAdministrationClient().restoreModule(...args);
}

export function transitionModule(
  ...args: Parameters<AdministrationClient["transitionModule"]>
) {
  return getAdministrationClient().transitionModule(...args);
}

export function listModuleAudit(
  ...args: Parameters<AdministrationClient["listModuleAudit"]>
) {
  return getAdministrationClient().listModuleAudit(...args);
}

export function listModuleHistory(
  ...args: Parameters<AdministrationClient["listModuleHistory"]>
) {
  return getAdministrationClient().listModuleHistory(...args);
}

export function listModuleMetadata(
  ...args: Parameters<AdministrationClient["listModuleMetadata"]>
) {
  return getAdministrationClient().listModuleMetadata(...args);
}

export function listModuleReferences(
  ...args: Parameters<AdministrationClient["listModuleReferences"]>
) {
  return getAdministrationClient().listModuleReferences(...args);
}

export function listCategories(
  ...args: Parameters<AdministrationClient["listCategories"]>
) {
  return getAdministrationClient().listCategories(...args);
}

export function getCategory(...args: Parameters<AdministrationClient["getCategory"]>) {
  return getAdministrationClient().getCategory(...args);
}

export function createCategory(
  ...args: Parameters<AdministrationClient["createCategory"]>
) {
  return getAdministrationClient().createCategory(...args);
}

export function updateCategory(
  ...args: Parameters<AdministrationClient["updateCategory"]>
) {
  return getAdministrationClient().updateCategory(...args);
}

export function listSections(
  ...args: Parameters<AdministrationClient["listSections"]>
) {
  return getAdministrationClient().listSections(...args);
}

export function getSection(...args: Parameters<AdministrationClient["getSection"]>) {
  return getAdministrationClient().getSection(...args);
}

export function createSection(
  ...args: Parameters<AdministrationClient["createSection"]>
) {
  return getAdministrationClient().createSection(...args);
}

export function updateSection(
  ...args: Parameters<AdministrationClient["updateSection"]>
) {
  return getAdministrationClient().updateSection(...args);
}

export function listActions(...args: Parameters<AdministrationClient["listActions"]>) {
  return getAdministrationClient().listActions(...args);
}

export function getAction(...args: Parameters<AdministrationClient["getAction"]>) {
  return getAdministrationClient().getAction(...args);
}

export function createAction(
  ...args: Parameters<AdministrationClient["createAction"]>
) {
  return getAdministrationClient().createAction(...args);
}

export function updateAction(
  ...args: Parameters<AdministrationClient["updateAction"]>
) {
  return getAdministrationClient().updateAction(...args);
}

export function listPermissions(
  ...args: Parameters<AdministrationClient["listPermissions"]>
) {
  return getAdministrationClient().listPermissions(...args);
}

export function getPermission(
  ...args: Parameters<AdministrationClient["getPermission"]>
) {
  return getAdministrationClient().getPermission(...args);
}

export function createPermission(
  ...args: Parameters<AdministrationClient["createPermission"]>
) {
  return getAdministrationClient().createPermission(...args);
}

export function updatePermission(
  ...args: Parameters<AdministrationClient["updatePermission"]>
) {
  return getAdministrationClient().updatePermission(...args);
}

export function listRegistrations(
  ...args: Parameters<AdministrationClient["listRegistrations"]>
) {
  return getAdministrationClient().listRegistrations(...args);
}

export function getRegistration(
  ...args: Parameters<AdministrationClient["getRegistration"]>
) {
  return getAdministrationClient().getRegistration(...args);
}

export function createRegistration(
  ...args: Parameters<AdministrationClient["createRegistration"]>
) {
  return getAdministrationClient().createRegistration(...args);
}

export function updateRegistration(
  ...args: Parameters<AdministrationClient["updateRegistration"]>
) {
  return getAdministrationClient().updateRegistration(...args);
}

export function listPolicies(
  ...args: Parameters<AdministrationClient["listPolicies"]>
) {
  return getAdministrationClient().listPolicies(...args);
}

export function getPolicy(...args: Parameters<AdministrationClient["getPolicy"]>) {
  return getAdministrationClient().getPolicy(...args);
}

export function createPolicy(
  ...args: Parameters<AdministrationClient["createPolicy"]>
) {
  return getAdministrationClient().createPolicy(...args);
}

export function updatePolicy(
  ...args: Parameters<AdministrationClient["updatePolicy"]>
) {
  return getAdministrationClient().updatePolicy(...args);
}

export function listCapabilities(
  ...args: Parameters<AdministrationClient["listCapabilities"]>
) {
  return getAdministrationClient().listCapabilities(...args);
}

export function getCapability(
  ...args: Parameters<AdministrationClient["getCapability"]>
) {
  return getAdministrationClient().getCapability(...args);
}

export function createCapability(
  ...args: Parameters<AdministrationClient["createCapability"]>
) {
  return getAdministrationClient().createCapability(...args);
}

export function updateCapability(
  ...args: Parameters<AdministrationClient["updateCapability"]>
) {
  return getAdministrationClient().updateCapability(...args);
}

export function listNavigations(
  ...args: Parameters<AdministrationClient["listNavigations"]>
) {
  return getAdministrationClient().listNavigations(...args);
}

export function getNavigation(
  ...args: Parameters<AdministrationClient["getNavigation"]>
) {
  return getAdministrationClient().getNavigation(...args);
}

export function createNavigation(
  ...args: Parameters<AdministrationClient["createNavigation"]>
) {
  return getAdministrationClient().createNavigation(...args);
}

export function updateNavigation(
  ...args: Parameters<AdministrationClient["updateNavigation"]>
) {
  return getAdministrationClient().updateNavigation(...args);
}

export function listShortcuts(
  ...args: Parameters<AdministrationClient["listShortcuts"]>
) {
  return getAdministrationClient().listShortcuts(...args);
}

export function getShortcut(...args: Parameters<AdministrationClient["getShortcut"]>) {
  return getAdministrationClient().getShortcut(...args);
}

export function createShortcut(
  ...args: Parameters<AdministrationClient["createShortcut"]>
) {
  return getAdministrationClient().createShortcut(...args);
}

export function updateShortcut(
  ...args: Parameters<AdministrationClient["updateShortcut"]>
) {
  return getAdministrationClient().updateShortcut(...args);
}

export function listDashboards(
  ...args: Parameters<AdministrationClient["listDashboards"]>
) {
  return getAdministrationClient().listDashboards(...args);
}

export function getDashboard(
  ...args: Parameters<AdministrationClient["getDashboard"]>
) {
  return getAdministrationClient().getDashboard(...args);
}

export function createDashboard(
  ...args: Parameters<AdministrationClient["createDashboard"]>
) {
  return getAdministrationClient().createDashboard(...args);
}

export function updateDashboard(
  ...args: Parameters<AdministrationClient["updateDashboard"]>
) {
  return getAdministrationClient().updateDashboard(...args);
}

export function listWidgets(...args: Parameters<AdministrationClient["listWidgets"]>) {
  return getAdministrationClient().listWidgets(...args);
}

export function getWidget(...args: Parameters<AdministrationClient["getWidget"]>) {
  return getAdministrationClient().getWidget(...args);
}

export function createWidget(
  ...args: Parameters<AdministrationClient["createWidget"]>
) {
  return getAdministrationClient().createWidget(...args);
}

export function updateWidget(
  ...args: Parameters<AdministrationClient["updateWidget"]>
) {
  return getAdministrationClient().updateWidget(...args);
}

export function listMetadata(
  ...args: Parameters<AdministrationClient["listMetadata"]>
) {
  return getAdministrationClient().listMetadata(...args);
}

export function getMetadata(...args: Parameters<AdministrationClient["getMetadata"]>) {
  return getAdministrationClient().getMetadata(...args);
}

export function createMetadata(
  ...args: Parameters<AdministrationClient["createMetadata"]>
) {
  return getAdministrationClient().createMetadata(...args);
}

export function updateMetadata(
  ...args: Parameters<AdministrationClient["updateMetadata"]>
) {
  return getAdministrationClient().updateMetadata(...args);
}

export function listReferences(
  ...args: Parameters<AdministrationClient["listReferences"]>
) {
  return getAdministrationClient().listReferences(...args);
}

export function getReference(
  ...args: Parameters<AdministrationClient["getReference"]>
) {
  return getAdministrationClient().getReference(...args);
}

export function createReference(
  ...args: Parameters<AdministrationClient["createReference"]>
) {
  return getAdministrationClient().createReference(...args);
}

export function listAudit(...args: Parameters<AdministrationClient["listAudit"]>) {
  return getAdministrationClient().listAudit(...args);
}

export function getAudit(...args: Parameters<AdministrationClient["getAudit"]>) {
  return getAdministrationClient().getAudit(...args);
}

export function getHistory(...args: Parameters<AdministrationClient["getHistory"]>) {
  return getAdministrationClient().getHistory(...args);
}

export function getDiagnostics(
  ...args: Parameters<AdministrationClient["getDiagnostics"]>
) {
  return getAdministrationClient().getDiagnostics(...args);
}

export function getDiagnostic(
  ...args: Parameters<AdministrationClient["getDiagnostic"]>
) {
  return getAdministrationClient().getDiagnostic(...args);
}

export function getHealth(...args: Parameters<AdministrationClient["getHealth"]>) {
  return getAdministrationClient().getHealth(...args);
}

export function getReadiness(
  ...args: Parameters<AdministrationClient["getReadiness"]>
) {
  return getAdministrationClient().getReadiness(...args);
}

export function getManagementCapabilities(
  ...args: Parameters<AdministrationClient["getManagementCapabilities"]>
) {
  return getAdministrationClient().getManagementCapabilities(...args);
}
