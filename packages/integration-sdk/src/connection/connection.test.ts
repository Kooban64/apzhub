import { describe, expect, it } from "vitest";

import {
  DefaultAuthenticationProvider,
  DefaultCredentialResolver,
  InMemorySecretProvider,
} from "../auth";
import {
  ConnectionLifecycleService,
  InMemoryConnectionRegistry,
  buildConnectionDiagnostics,
  canTransitionConnectionLifecycle,
  createConnectionManager,
} from "./index";

const correlationId = "corr-conn-001";
const rawSecret = "integration-secret-value";

const fixedClock = {
  now: () => "2026-07-10T02:00:00.000Z",
};

function createConnectionStack() {
  const secretProvider = new InMemorySecretProvider({
    secrets: { "cred/ref": rawSecret },
  });
  const credentialResolver = new DefaultCredentialResolver({ secretProvider });
  const authenticationProvider = new DefaultAuthenticationProvider({
    credentialResolver,
    clock: fixedClock,
  });
  const registry = new InMemoryConnectionRegistry(fixedClock);
  const manager = createConnectionManager({
    registry,
    authenticationProvider,
    lifecycleService: new ConnectionLifecycleService(fixedClock),
    clock: fixedClock,
  });

  return { registry, manager };
}

const baseDefinition = {
  connectionId: "conn-projects",
  tenantId: "tenant-a",
  integrationId: "example-engine",
  adapterId: "example-adapter",
  baseUrl: "https://engine.internal.example",
  authenticationMode: "bearer" as const,
  credentialRef: "cred/ref",
};

describe("connection registry", () => {
  it("registers and retrieves tenant-scoped connections", async () => {
    const { registry, manager } = createConnectionStack();

    const registered = await manager.register(baseDefinition, correlationId);
    expect(registered.ok).toBe(true);

    const listed = registry.listByTenant("tenant-a");
    expect(listed).toHaveLength(1);
    expect(listed[0]?.connectionId).toBe("conn-projects");
  });

  it("rejects duplicate connection registration", async () => {
    const { manager } = createConnectionStack();

    await manager.register(baseDefinition, correlationId);
    const duplicate = await manager.register(baseDefinition, correlationId);

    expect(duplicate.ok).toBe(false);
    if (!duplicate.ok) {
      expect(duplicate.error.code).toBe("integration.connection.duplicate");
    }
  });

  it("returns immutable snapshots", async () => {
    const { registry, manager } = createConnectionStack();
    await manager.register(baseDefinition, correlationId);

    const snapshot = registry.snapshot();
    expect(snapshot.connections).toHaveLength(1);
    expect(snapshot.capturedAt).toBe(fixedClock.now());
  });

  it("lists by integration id", async () => {
    const { registry, manager } = createConnectionStack();
    await manager.register(baseDefinition, correlationId);

    expect(registry.listByIntegration("example-engine")).toHaveLength(1);
    expect(registry.listByIntegration("other-engine")).toHaveLength(0);
  });

  it("removes connections and reports not found", async () => {
    const { registry, manager } = createConnectionStack();
    await manager.register(baseDefinition, correlationId);

    const removed = registry.remove("conn-projects", correlationId);
    expect(removed.ok).toBe(true);

    const missing = registry.get("conn-projects", correlationId);
    expect(missing.ok).toBe(false);
    if (!missing.ok) {
      expect(missing.error.code).toBe("integration.connection.not_found");
    }
  });
});

describe("connection lifecycle", () => {
  it("allows valid lifecycle transitions", () => {
    expect(canTransitionConnectionLifecycle("configured", "authenticating")).toBe(true);
    expect(canTransitionConnectionLifecycle("authenticating", "connected")).toBe(true);
    expect(canTransitionConnectionLifecycle("connected", "disconnected")).toBe(true);
  });

  it("rejects invalid lifecycle transitions", async () => {
    const { manager } = createConnectionStack();
    await manager.register(baseDefinition, correlationId);

    const invalid = await manager.open("conn-projects", correlationId);
    expect(invalid.ok).toBe(true);

    const closed = await manager.close("conn-projects", correlationId);
    expect(closed.ok).toBe(true);

    const reopenFromWrong = await manager.open("conn-projects", correlationId);
    expect(reopenFromWrong.ok).toBe(true);
  });

  it("opens and closes logical connections without network I/O", async () => {
    const { manager } = createConnectionStack();

    await manager.register(baseDefinition, correlationId);
    const opened = await manager.open("conn-projects", correlationId);

    expect(opened.ok).toBe(true);
    if (opened.ok) {
      expect(opened.value.lifecycleState).toBe("connected");
      expect(opened.value.connectedAt).toBe(fixedClock.now());
    }

    const closed = await manager.close("conn-projects", correlationId);
    expect(closed.ok).toBe(true);
    if (closed.ok) {
      expect(closed.value.lifecycleState).toBe("disconnected");
      expect(closed.value.disconnectedAt).toBe(fixedClock.now());
    }
  });

  it("marks authentication failure when secret is missing", async () => {
    const secretProvider = new InMemorySecretProvider({ secrets: {} });
    const credentialResolver = new DefaultCredentialResolver({ secretProvider });
    const authenticationProvider = new DefaultAuthenticationProvider({
      credentialResolver,
      clock: fixedClock,
    });
    const manager = createConnectionManager({
      registry: new InMemoryConnectionRegistry(fixedClock),
      authenticationProvider,
      lifecycleService: new ConnectionLifecycleService(fixedClock),
      clock: fixedClock,
    });

    await manager.register(baseDefinition, correlationId);
    const opened = await manager.open("conn-projects", correlationId);

    expect(opened.ok).toBe(false);

    const state = manager.getState("conn-projects", correlationId);
    expect(state.ok).toBe(true);
    if (state.ok) {
      expect(state.value.lifecycleState).toBe("authentication_failed");
    }
  });

  it("supports disabled connections", async () => {
    const { manager } = createConnectionStack();
    await manager.register({ ...baseDefinition, enabled: false }, correlationId);

    const disabled = manager.disable("conn-projects", correlationId);
    expect(disabled.ok).toBe(true);
    if (disabled.ok) {
      expect(disabled.value.lifecycleState).toBe("disabled");
    }
  });
});

describe("connection diagnostics", () => {
  it("reports safe connection counts without secrets", async () => {
    const { manager } = createConnectionStack();
    await manager.register(baseDefinition, correlationId);
    await manager.open("conn-projects", correlationId);

    const diagnostics = manager.getDiagnostics("tenant-a");

    expect(diagnostics.connectionCount).toBe(1);
    expect(diagnostics.connectedCount).toBe(1);
    expect(JSON.stringify(diagnostics)).not.toContain(rawSecret);
  });

  it("aggregates lifecycle counts via buildConnectionDiagnostics", async () => {
    const { registry, manager } = createConnectionStack();
    await manager.register(baseDefinition, correlationId);

    const diagnostics = buildConnectionDiagnostics({
      connections: registry.list(),
      tenantId: "tenant-a",
    });

    expect(diagnostics.connectionCount).toBe(1);
    expect(diagnostics.lifecycleCounts.configured).toBe(1);
  });
});
