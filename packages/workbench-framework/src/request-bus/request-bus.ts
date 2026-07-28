import { createWorkbenchAPI } from "../api/create-workbench-api";
import type {
  CreateWorkbenchOptions,
  WorkbenchCapabilityContext,
  WorkbenchCapabilityRegistrationContext,
  WorkbenchRequestBus,
} from "../interfaces/dependencies";
import type { WorkbenchAPI } from "../api/workbench-api";
import type { WorkbenchRequest, WorkbenchRequestResult } from "../interfaces/requests";
import type {
  Unsubscribe,
  WorkbenchState,
  WorkbenchStateListener,
} from "../interfaces/types";
import type { NavigationModel } from "../navigation/platform-navigation-model";
import {
  createWorkbenchManager,
  type DefaultWorkbenchManager,
} from "../workbench-manager/workbench-manager";

export class WorkbenchRequestBusImpl implements WorkbenchRequestBus {
  private readonly manager: DefaultWorkbenchManager;

  private readonly api: WorkbenchAPI;

  private readonly apiOptions: import("../api/create-workbench-api").CreateWorkbenchAPIOptions;

  constructor(options: CreateWorkbenchOptions = {}) {
    this.manager = createWorkbenchManager(options);
    this.apiOptions = {
      actionExecutor: options.actionExecutor,
      actionInvocation: options.actionInvocation,
    };
    this.api = createWorkbenchAPI(this.createAPIHost(), this.apiOptions);
  }

  private createAPIHost() {
    const manager = this.manager;
    const permissionAdapter = manager.getPermissionAdapter();

    return {
      publish: (request: WorkbenchRequest): WorkbenchRequestResult =>
        manager.handleRequest(request),
      getState: (): WorkbenchState => manager.getState(),
      subscribe: (listener: WorkbenchStateListener): Unsubscribe =>
        manager.subscribe(listener),
      getNavigationDiagnostics: () => manager.getNavigationDiagnostics(),
      getViewDiagnostics: () => manager.getViewDiagnostics(),
      getSessionDiagnostics: () => manager.getSessionDiagnostics(),
      getContextDiagnostics: () => manager.getContextDiagnostics(),
      getSelectionDiagnostics: () => manager.getSelectionDiagnostics(),
      getPermissionDiagnostics: () => manager.getPermissionDiagnostics(),
      can: (permission?: string) => permissionAdapter.can(permission),
      recordDeniedRequest: () => permissionAdapter.recordDeniedRequest?.(),
    };
  }

  getWorkbenchAPI(): WorkbenchAPI {
    return this.api;
  }

  createCapabilityRegistrationContext(): WorkbenchCapabilityRegistrationContext {
    return { workbench: this.api };
  }

  /** @deprecated Use createCapabilityRegistrationContext().workbench */
  createCapabilityContext(): WorkbenchCapabilityContext {
    const { workbench } = this.createCapabilityRegistrationContext();
    return {
      workbench: {
        publish: (request) => workbench.execute(request),
        getState: () => workbench.getState(),
        subscribe: (listener) => workbench.subscribe(listener),
      },
    };
  }

  publish(request: WorkbenchRequest): WorkbenchRequestResult {
    return this.manager.handleRequest(request);
  }

  getState(): WorkbenchState {
    return this.manager.getState();
  }

  subscribe(listener: WorkbenchStateListener): Unsubscribe {
    return this.manager.subscribe(listener);
  }

  loadNavigationContributions(
    contributions: Parameters<
      DefaultWorkbenchManager["loadNavigationContributions"]
    >[0],
  ): void {
    this.manager.loadNavigationContributions(contributions);
  }

  loadViewDescriptors(
    descriptors: Parameters<DefaultWorkbenchManager["loadViewDescriptors"]>[0],
  ): void {
    this.manager.loadViewDescriptors(descriptors);
  }

  getNavigationDiagnostics() {
    return this.manager.getNavigationDiagnostics();
  }

  getViewDiagnostics() {
    return this.manager.getViewDiagnostics();
  }

  getNavigationModel(): NavigationModel {
    return this.manager.getNavigationModel();
  }

  getViewState() {
    return this.manager.getViewState();
  }

  activateDefaultViewForActiveWorkspace(): WorkbenchRequestResult {
    return this.manager.activateDefaultViewForActiveWorkspace();
  }

  activateViewForRoute(route: string): WorkbenchRequestResult {
    return this.manager.activateViewForRoute(route);
  }

  selectActivityBarNavigationItem(navId: string): WorkbenchRequestResult {
    return this.manager.selectActivityBarNavigationItem(navId);
  }

  selectSidebarNavigationItem(navId: string): WorkbenchRequestResult {
    return this.manager.selectSidebarNavigationItem(navId);
  }

  getSessionDiagnostics() {
    return this.manager.getSessionDiagnostics();
  }

  getContextDiagnostics() {
    return this.manager.getContextDiagnostics();
  }

  getSelectionDiagnostics() {
    return this.manager.getSelectionDiagnostics();
  }

  getPermissionDiagnostics() {
    return this.manager.getPermissionDiagnostics();
  }

  restoreSession(userId: string) {
    return this.manager.restoreSession(userId);
  }

  enableSessionPersistence(userId: string): void {
    this.manager.enableSessionPersistence(userId);
  }

  disableSessionPersistence(): void {
    this.manager.disableSessionPersistence();
  }

  flushPendingPersist(): Promise<void> {
    return this.manager.flushPendingPersist();
  }

  clearSession(userId: string): Promise<void> {
    return this.manager.clearSession(userId);
  }

  /** Internal access for tests and shell integration — not for capabilities. */
  getManager(): DefaultWorkbenchManager {
    return this.manager;
  }
}

export function createWorkbenchRequestBus(
  options?: CreateWorkbenchOptions,
): WorkbenchRequestBusImpl {
  return new WorkbenchRequestBusImpl(options);
}
