/**
 * Outbound port contracts — APZQEP-OES-ENG-090A PART-03 §3.
 * Method surfaces authorised under ENG-100C. Implementations are ENG-100D
 * (or in-memory fakes for Application tests).
 */

import type { ExecutionDomainEvent } from "../../domain/test-execution/events";
import type { ExecutionHistoryEntry } from "../../domain/test-execution/history";
import type { ResolvedManifestInput } from "../../domain/test-execution/manifest";
import type { TestExecution } from "../../domain/test-execution/test-execution";
import type { ExecutionStatus } from "../../domain/test-execution/value-objects";
import type { ExecutionRequestContext } from "../context";

export type StoredTestExecution = Omit<TestExecution, "uncommittedEvents"> & {
  readonly uncommittedEvents: readonly [];
};

export type TestExecutionListQuery = {
  readonly status?: ExecutionStatus | readonly ExecutionStatus[];
  readonly assigneeId?: string;
  readonly reviewerId?: string;
  readonly ownerId?: string;
  readonly planId?: string;
  readonly specId?: string;
  readonly projectId?: string;
  readonly workspaceId?: string;
  readonly reviewQueue?: boolean;
  readonly limit?: number;
  readonly offset?: number;
};

export type TestExecutionRepository = {
  readonly portId: "TestExecutionRepository";
  create(execution: TestExecution): Promise<StoredTestExecution>;
  get(tenantId: string, id: string): Promise<StoredTestExecution | null>;
  getByNumber(tenantId: string, number: string): Promise<StoredTestExecution | null>;
  save(
    execution: TestExecution,
    expectedRevision: number,
  ): Promise<StoredTestExecution>;
  list(
    tenantId: string,
    query?: TestExecutionListQuery,
  ): Promise<readonly StoredTestExecution[]>;
  findByIngestionKey(
    tenantId: string,
    sourceSystemId: string,
    idempotencyKey: string,
  ): Promise<StoredTestExecution | null>;
};

export type ExecutionHistoryStore = {
  readonly portId: "ExecutionHistoryStore";
  append(
    tenantId: string,
    executionId: string,
    entries: readonly ExecutionHistoryEntry[],
  ): Promise<void>;
  list(
    tenantId: string,
    executionId: string,
  ): Promise<readonly ExecutionHistoryEntry[]>;
};

export type SourceResolutionRequest = {
  readonly tenantId: string;
  readonly sourceRefs: TestExecution["sourceRefs"];
};

export type SourceResolutionPort = {
  readonly portId: "SourceResolutionPort";
  resolveForSeal(request: SourceResolutionRequest): Promise<ResolvedManifestInput>;
};

export type PermissionPort = {
  readonly portId: "PermissionPort";
  assertAny(ctx: ExecutionRequestContext, requiredOneOf: readonly string[]): void;
  has(ctx: ExecutionRequestContext, permission: string): boolean;
};

export type ExecutionAuditEntry = {
  readonly id: string;
  readonly tenantId: string;
  readonly executionId: string;
  readonly action: string;
  readonly actorUserId: string;
  readonly correlationId: string;
  readonly priorStatus?: string;
  readonly resultingStatus?: string;
  readonly reason?: string;
  readonly details?: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
};

export type AuditPort = {
  readonly portId: "AuditPort";
  append(entry: ExecutionAuditEntry): Promise<void>;
};

export type EventOutboxPort = {
  readonly portId: "EventOutboxPort";
  enqueue(events: readonly ExecutionDomainEvent[]): Promise<void>;
};

export type SearchPublicationPort = {
  readonly portId: "SearchPublicationPort";
  publish(execution: StoredTestExecution): Promise<void>;
};

export type EvidenceAccessPort = {
  readonly portId: "EvidenceAccessPort";
  assertAccessible(ctx: ExecutionRequestContext, uri: string): Promise<void>;
};

export type ClockPort = {
  readonly portId: "ClockPort";
  now(): string;
};

export type IdPort = {
  readonly portId: "IdPort";
  nextId(prefix?: string): string;
};
