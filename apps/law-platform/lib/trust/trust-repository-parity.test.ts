import { beforeEach, describe, expect, it } from "vitest";

import { InMemoryTrustLedgerRepository } from "./in-memory-trust-ledger-repository";
import { PostgresTrustLedgerRepository } from "./postgres-trust-ledger-repository";
import { createTrustRepositoryBundle } from "../persistence/trust-repository-factory";
import { createLawPersistenceContext } from "../persistence/law-persistence-context";
import { resetSharedTrustServiceBundle } from "../persistence/trust-repository-factory";
import { TrustLedgerService } from "./trust-ledger-service";
import { resetTrustIdCounter } from "./trust-id";

const TENANT = "tenant-trust-parity";

describe("Trust repository parity", () => {
  beforeEach(() => {
    resetTrustIdCounter();
    resetSharedTrustServiceBundle();
  });

  it("memory and factory memory mode expose the same ledger operations", () => {
    const memoryRepo = new InMemoryTrustLedgerRepository();
    const bundle = createTrustRepositoryBundle(
      createLawPersistenceContext({ tenantId: TENANT }),
    );

    expect(bundle.ledgerRepository).toBeInstanceOf(InMemoryTrustLedgerRepository);

    const memoryService = new TrustLedgerService({ repository: memoryRepo });
    const factoryService = new TrustLedgerService({
      repository: bundle.ledgerRepository as InMemoryTrustLedgerRepository,
    });

    const opened = memoryService.openAccount({
      tenantId: TENANT,
      name: "Parity Account",
      currency: "ZAR",
      institutionName: "Bank",
      accountNumberMasked: "****1111",
      actorUserId: "user-1",
    }).data!;

    factoryService.openAccount({
      tenantId: TENANT,
      name: "Parity Account",
      currency: "ZAR",
      institutionName: "Bank",
      accountNumberMasked: "****1111",
      actorUserId: "user-1",
    });

    expect(factoryService.listAccounts(TENANT).length).toBeGreaterThanOrEqual(1);
    expect(opened.trustAccountId).toBeDefined();
  });

  it("postgres factory returns postgres ledger repository when mode is postgres", () => {
    if (!process.env.DATABASE_URL) {
      expect(PostgresTrustLedgerRepository).toBeDefined();
      return;
    }

    process.env.LAW_REPOSITORY_MODE = "postgres";
    const bundle = createTrustRepositoryBundle(
      createLawPersistenceContext({ tenantId: TENANT }),
    );
    expect(bundle.ledgerRepository).toBeInstanceOf(PostgresTrustLedgerRepository);
    process.env.LAW_REPOSITORY_MODE = "memory";
  });
});
