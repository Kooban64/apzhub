import type {
  OperationalFriction,
  OperationalFrictionAuditEntry,
} from "@apzhub/platform-service-contracts";

import type { OperationalFrictionStore } from "./store";

export function createMemoryOperationalFrictionStore(): OperationalFrictionStore {
  const frictions = new Map<string, OperationalFriction>();
  const audits: OperationalFrictionAuditEntry[] = [];

  return {
    async create(friction) {
      const frozen = Object.freeze({
        ...friction,
        productsAffected: Object.freeze([...friction.productsAffected]),
      });
      frictions.set(`${friction.tenantId}:${friction.id}`, frozen);
      return frozen;
    },
    async update(friction) {
      const frozen = Object.freeze({
        ...friction,
        productsAffected: Object.freeze([...friction.productsAffected]),
      });
      frictions.set(`${friction.tenantId}:${friction.id}`, frozen);
      return frozen;
    },
    async get(tenantId, id) {
      return frictions.get(`${tenantId}:${id}`) ?? null;
    },
    async list(tenantId) {
      return [...frictions.values()]
        .filter((item) => item.tenantId === tenantId)
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },
    async appendAudit(entry) {
      audits.push(Object.freeze({ ...entry, detail: { ...entry.detail } }));
    },
    async listAudit(tenantId, frictionId) {
      return audits
        .filter(
          (entry) => entry.tenantId === tenantId && entry.frictionId === frictionId,
        )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
  };
}

let singleton: OperationalFrictionStore | undefined;

export function getMemoryOperationalFrictionStore(): OperationalFrictionStore {
  if (!singleton) singleton = createMemoryOperationalFrictionStore();
  return singleton;
}

export function resetMemoryOperationalFrictionStoreForTests(): void {
  singleton = createMemoryOperationalFrictionStore();
}
