import type { IntegrationRequestContext } from "../../types";
import type { AdapterFixtureSet } from "../types";

export interface FixtureFramework extends AdapterFixtureSet {
  getRequestContext(name: string): IntegrationRequestContext;
  getPayload<T = unknown>(name: string): T;
  registerPayload(name: string, value: unknown): void;
  listPayloadKeys(): readonly string[];
}

class InMemoryFixtureFramework implements FixtureFramework {
  readonly requestContexts: Record<string, IntegrationRequestContext>;
  payloads: Record<string, unknown>;
  readonly metadata: Record<string, unknown>;

  constructor(seed?: Partial<AdapterFixtureSet>) {
    this.requestContexts = {
      default: {
        correlationId: "corr-fixture-default",
        tenantId: "tenant-fixture",
        locale: "en-ZA",
        timezone: "Africa/Johannesburg",
      },
      admin: {
        correlationId: "corr-fixture-admin",
        tenantId: "tenant-fixture",
        userId: "user-admin",
        permissionSnapshot: ["integration:admin"],
      },
      ...(seed?.requestContexts ?? {}),
    };
    this.payloads = {
      emptyPage: { items: [], nextCursor: null },
      sampleResource: { id: "res-1", name: "Sample" },
      webhookCreated: { action: "created", resourceType: "task", resourceId: "res-1" },
      ...(seed?.payloads ?? {}),
    };
    this.metadata = {
      fixtureVersion: "1.0.0",
      ...(seed?.metadata ?? {}),
    };
  }

  getRequestContext(name: string): IntegrationRequestContext {
    const ctx = this.requestContexts[name];
    if (!ctx) {
      throw new Error(`Unknown request context fixture: ${name}`);
    }
    return ctx;
  }

  getPayload<T = unknown>(name: string): T {
    if (!(name in this.payloads)) {
      throw new Error(`Unknown payload fixture: ${name}`);
    }
    return this.payloads[name] as T;
  }

  registerPayload(name: string, value: unknown): void {
    this.payloads[name] = value;
  }

  listPayloadKeys(): readonly string[] {
    return Object.keys(this.payloads);
  }
}

export function createDefaultFixtures(
  seed?: Partial<AdapterFixtureSet>,
): FixtureFramework {
  return new InMemoryFixtureFramework(seed);
}

export function createFixtureFramework(
  seed?: Partial<AdapterFixtureSet>,
): FixtureFramework {
  return createDefaultFixtures(seed);
}
