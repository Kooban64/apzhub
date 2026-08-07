import type {
  OperationalFriction,
  OperationalFrictionAuditEntry,
} from "@apzhub/platform-service-contracts";

export interface OperationalFrictionStore {
  create(friction: OperationalFriction): Promise<OperationalFriction>;
  update(friction: OperationalFriction): Promise<OperationalFriction>;
  get(tenantId: string, id: string): Promise<OperationalFriction | null>;
  list(tenantId: string): Promise<readonly OperationalFriction[]>;
  appendAudit(entry: OperationalFrictionAuditEntry): Promise<void>;
  listAudit(
    tenantId: string,
    frictionId: string,
  ): Promise<readonly OperationalFrictionAuditEntry[]>;
}
