/**
 * PostgreSQL Evidence Unit of Work — APZQEP-120-S05.
 * Catalogue repositories behind EvidenceRepository port (no second catalogue API).
 */

import type { DatabaseExecutor } from "@apzhub/config";

import type { EvidenceUnitOfWork } from "../../domain/ports/repositories";
import { createPostgresEvidenceAccessGrantRepository } from "./access-grant-repository";
import { createPostgresEvidenceAuditRepository } from "./audit-repository";
import { createPostgresEvidenceCollectionRepository } from "./collection-repository";
import { createPostgresEvidenceRepository } from "./evidence-repository";
import { createPostgresEvidenceRelationshipRepository } from "./relationship-repository";
import { createPostgresEvidenceSetRepository } from "./set-repository";
import { createPostgresEvidenceVersionRepository } from "./version-repository";

function buildRepos(
  db: DatabaseExecutor,
): Omit<EvidenceUnitOfWork, "portId" | "execute"> {
  return {
    evidence: createPostgresEvidenceRepository(db),
    collections: createPostgresEvidenceCollectionRepository(db),
    sets: createPostgresEvidenceSetRepository(db),
    relationships: createPostgresEvidenceRelationshipRepository(db),
    versions: createPostgresEvidenceVersionRepository(db),
    accessGrants: createPostgresEvidenceAccessGrantRepository(db),
    audit: createPostgresEvidenceAuditRepository(db),
  };
}

type TransactionalDb = DatabaseExecutor & {
  transaction: <T>(fn: (tx: DatabaseExecutor) => Promise<T>) => Promise<T>;
};

function hasTransaction(db: DatabaseExecutor): db is TransactionalDb {
  return (
    typeof db === "object" &&
    db !== null &&
    "transaction" in db &&
    typeof (db as TransactionalDb).transaction === "function"
  );
}

export function createPostgresEvidenceUnitOfWork(
  db: DatabaseExecutor,
): EvidenceUnitOfWork {
  const ports = buildRepos(db);
  const uow: EvidenceUnitOfWork = {
    portId: "EvidenceUnitOfWork",
    ...ports,
    async execute(work) {
      if (hasTransaction(db)) {
        return db.transaction(async (tx) => {
          const txUow: EvidenceUnitOfWork = {
            portId: "EvidenceUnitOfWork",
            ...buildRepos(tx),
            async execute(inner) {
              return inner(txUow);
            },
          };
          return work(txUow);
        });
      }
      return work(uow);
    },
  };
  return uow;
}
