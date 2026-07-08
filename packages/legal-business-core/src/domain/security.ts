export interface User {
  readonly userId: string;
  readonly userReference: string;
  readonly email: string;
  readonly displayName: string;
  readonly roleIds: readonly string[];
  readonly isActive: boolean;
  readonly lastLoginAt?: string;
}

export interface Role {
  readonly roleId: string;
  readonly roleCode: string;
  readonly name: string;
  readonly description?: string;
  readonly permissionIds: readonly string[];
  readonly isSystem: boolean;
}

export interface Permission {
  readonly permissionKey: string;
  readonly label: string;
  readonly description?: string;
  readonly module: string;
  readonly isSystem: boolean;
}

export interface AuditRecord {
  readonly auditRecordId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly action: string;
  readonly actorUserId: string;
  readonly occurredAt: string;
  readonly beforeState?: Readonly<Record<string, unknown>>;
  readonly afterState?: Readonly<Record<string, unknown>>;
  readonly correlationId?: string;
}
