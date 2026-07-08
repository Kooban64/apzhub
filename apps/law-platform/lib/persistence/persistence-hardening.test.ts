import { beforeEach, describe, expect, it } from "vitest";
import type { Database } from "@apzhub/config";

import {
  createLawPersistenceContextFromSession,
  resolveLawTenantBinding,
  DEFAULT_LAW_TENANT_ID,
  setSessionLawPersistenceContext,
  getActiveLawPersistenceContext,
  resetLawPersistenceScope,
  createClientRepositoryForContext,
  isOutboxEnabled,
  loadLawPersistenceDiagnosticsSync,
} from "./index";
import { InMemoryClientRepository } from "../clients/in-memory-client-repository";
import { PostgresClientRepository } from "../clients/postgres-client-repository";

describe("resolveLawTenantBinding", () => {
  beforeEach(() => {
    resetLawPersistenceScope();
  });

  it("uses explicit tenant id when provided", () => {
    const binding = resolveLawTenantBinding({ explicitTenantId: "tenant-explicit" });
    expect(binding).toEqual({ tenantId: "tenant-explicit", source: "explicit" });
  });

  it("uses env override when LAW_TENANT_ID is set and no session user", () => {
    const previous = process.env.LAW_TENANT_ID;
    process.env.LAW_TENANT_ID = "tenant-from-env";

    expect(resolveLawTenantBinding().source).toBe("env-override");
    expect(resolveLawTenantBinding().tenantId).toBe("tenant-from-env");

    process.env.LAW_TENANT_ID = previous;
  });

  it("uses session single-firm fallback for authenticated users", () => {
    const previous = process.env.LAW_TENANT_ID;
    delete process.env.LAW_TENANT_ID;

    const binding = resolveLawTenantBinding({ userId: "user-123" });
    expect(binding.source).toBe("session-single-firm-fallback");
    expect(binding.tenantId).toBe(DEFAULT_LAW_TENANT_ID);

    process.env.LAW_TENANT_ID = previous;
  });
});

describe("session persistence context", () => {
  beforeEach(() => {
    resetLawPersistenceScope();
  });

  it("binds repositories to session tenant context", () => {
    const { context } = createLawPersistenceContextFromSession({ userId: "user-abc" });
    setSessionLawPersistenceContext(context);

    expect(getActiveLawPersistenceContext().tenantId).toBe(DEFAULT_LAW_TENANT_ID);
    expect(getActiveLawPersistenceContext().actorId).toBe("user-abc");

    const previous = process.env.LAW_REPOSITORY_MODE;
    process.env.LAW_REPOSITORY_MODE = "memory";
    expect(createClientRepositoryForContext(context)).toBeInstanceOf(
      InMemoryClientRepository,
    );
    process.env.LAW_REPOSITORY_MODE = previous;
  });
});

describe("persistence diagnostics", () => {
  it("reports repository mode and outbox state", () => {
    const previousMode = process.env.LAW_REPOSITORY_MODE;
    process.env.LAW_REPOSITORY_MODE = "memory";

    const diagnostics = loadLawPersistenceDiagnosticsSync();
    expect(diagnostics.repositoryMode).toBe("memory");
    expect(diagnostics.outboxEnabled).toBe(false);

    process.env.LAW_REPOSITORY_MODE = previousMode;
  });

  it("enables outbox only in postgres mode by default", () => {
    const previousMode = process.env.LAW_REPOSITORY_MODE;
    process.env.LAW_REPOSITORY_MODE = "postgres";
    expect(isOutboxEnabled()).toBe(true);
    process.env.LAW_REPOSITORY_MODE = previousMode;
  });
});

describe("repository factory tenant binding", () => {
  it("creates postgres repositories for explicit tenant contexts", () => {
    const previous = process.env.LAW_REPOSITORY_MODE;
    process.env.LAW_REPOSITORY_MODE = "postgres";

    const { context } = createLawPersistenceContextFromSession({
      explicitTenantId: DEFAULT_LAW_TENANT_ID,
    });
    expect(
      createClientRepositoryForContext({ ...context, db: {} as Database }),
    ).toBeInstanceOf(PostgresClientRepository);

    process.env.LAW_REPOSITORY_MODE = previous;
  });
});
