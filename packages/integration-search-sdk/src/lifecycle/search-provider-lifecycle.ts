/**
 * Search provider lifecycle helpers — wrap integration lifecycle; no engine bind.
 */

import type { IntegrationLifecycleState } from "@apzhub/integration-sdk";

export const SEARCH_PROVIDER_LIFECYCLE_STATES = [
  "uninitialised",
  "initialising",
  "ready",
  "degraded",
  "disposing",
  "disposed",
] as const;

export type SearchProviderLifecycleState =
  (typeof SEARCH_PROVIDER_LIFECYCLE_STATES)[number];

export type SearchProviderLifecycleSnapshot = {
  readonly state: SearchProviderLifecycleState;
  readonly integrationState?: IntegrationLifecycleState;
  readonly executionEnabled: false;
  readonly message: string;
};

export class SearchProviderLifecycle {
  private state: SearchProviderLifecycleState = "uninitialised";

  get current(): SearchProviderLifecycleState {
    return this.state;
  }

  snapshot(
    integrationState?: IntegrationLifecycleState,
  ): SearchProviderLifecycleSnapshot {
    return {
      state: this.state,
      integrationState,
      executionEnabled: false,
      message: `Search provider lifecycle is "${this.state}" (SDK only — no engine)`,
    };
  }

  beginInitialise(): SearchProviderLifecycleSnapshot {
    this.assertNotDisposed();
    this.state = "initialising";
    return this.snapshot();
  }

  markReady(
    integrationState?: IntegrationLifecycleState,
  ): SearchProviderLifecycleSnapshot {
    this.assertNotDisposed();
    this.state = "ready";
    return this.snapshot(integrationState);
  }

  markDegraded(
    integrationState?: IntegrationLifecycleState,
  ): SearchProviderLifecycleSnapshot {
    this.assertNotDisposed();
    this.state = "degraded";
    return this.snapshot(integrationState);
  }

  beginDispose(): SearchProviderLifecycleSnapshot {
    this.state = "disposing";
    return this.snapshot();
  }

  markDisposed(): SearchProviderLifecycleSnapshot {
    this.state = "disposed";
    return this.snapshot();
  }

  reset(): void {
    this.state = "uninitialised";
  }

  private assertNotDisposed(): void {
    if (this.state === "disposed") {
      throw new Error("Search provider lifecycle has been disposed");
    }
  }
}

export function createSearchProviderLifecycle(): SearchProviderLifecycle {
  return new SearchProviderLifecycle();
}
