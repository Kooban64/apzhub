import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type {
  SyncCursor,
  SyncRunOptions,
  SyncRunResult,
  SyncStatus,
} from "@apzhub/platform-service-contracts";

import { buildZammadListQuery } from "./list-helpers";
import type { ZammadServiceDeps } from "./zammad-operation-runner";

interface ResumeTokenPayload {
  readonly mode: "full" | "incremental";
  readonly since?: string;
  readonly ticketPage?: number;
  readonly organizationPage?: number;
  readonly groupPage?: number;
  readonly userPage?: number;
  readonly recordsProcessed?: number;
}

function encodeResumeToken(payload: ResumeTokenPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeResumeToken(token: string | undefined): ResumeTokenPayload | undefined {
  if (!token) return undefined;
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const parsed = JSON.parse(raw) as ResumeTokenPayload;
    if (parsed.mode !== "full" && parsed.mode !== "incremental") {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

function idleStatus(cursor: SyncCursor = {}): SyncStatus {
  return {
    mode: "none",
    status: "idle",
    recordsProcessed: 0,
    cursor,
    errors: [],
  };
}

function matchesSince(
  updatedAt: string | undefined,
  since: string | undefined,
): boolean {
  if (!since) return true;
  if (!updatedAt) return true;
  return updatedAt >= since;
}

/**
 * Zammad synchronisation APIs — no scheduler, workers, or persistence.
 * Maintains adapter-local sync cursor/state for safe restart and resume.
 * Exposed as `adapter.core.synchronisation` (Reference Adapter naming).
 */
export class ZammadSyncService {
  private status: SyncStatus = idleStatus();
  private retryCounts = 0;

  constructor(private readonly deps: ZammadServiceDeps) {}

  getSyncState(): SyncStatus {
    return { ...this.status, cursor: { ...this.status.cursor } };
  }

  getLastSyncTimestamp(): string | undefined {
    return this.status.lastSuccessfulSyncAt ?? this.status.cursor.lastSyncAt;
  }

  /**
   * Reset a stuck "running" status so sync can safely restart after interruption.
   */
  safeRestart(): SyncStatus {
    if (this.status.status === "running") {
      this.status = {
        ...this.status,
        status: "idle",
        errors: [...this.status.errors, "safe_restart_cleared_running_state"],
      };
    }
    return this.getSyncState();
  }

  async runFullSync(
    context: IntegrationRequestContext,
    options: SyncRunOptions = {},
  ): Promise<SyncRunResult> {
    return this.runSync(context, "full", options);
  }

  async runIncrementalSync(
    context: IntegrationRequestContext,
    options: SyncRunOptions = {},
  ): Promise<SyncRunResult> {
    return this.runSync(context, "incremental", options);
  }

  private async runSync(
    context: IntegrationRequestContext,
    mode: "full" | "incremental",
    options: SyncRunOptions,
  ): Promise<SyncRunResult> {
    if (this.status.status === "running") {
      this.safeRestart();
    }

    const startedAt = this.deps.clock?.nowMs() ?? Date.now();
    const startedIso = new Date(startedAt).toISOString();
    const resume = decodeResumeToken(options.resumeToken ?? this.status.cursor.resumeToken);
    const since =
      mode === "incremental"
        ? (options.since ?? resume?.since ?? this.getLastSyncTimestamp())
        : undefined;

    this.status = {
      ...this.status,
      mode,
      status: "running",
      lastStartedAt: startedIso,
      errors: [],
      recordsProcessed: resume?.recordsProcessed ?? 0,
      cursor: {
        lastSyncAt: this.status.cursor.lastSyncAt,
        resumeToken: options.resumeToken ?? this.status.cursor.resumeToken,
        resourceCursors: this.status.cursor.resourceCursors,
      },
    };

    try {
      const result = await this.deps.runner.run(
        context,
        mode === "full" ? "zammad.sync.full" : "zammad.sync.incremental",
        async () => this.executeSync(context, mode, since, options, resume),
      );

      const durationMs = (this.deps.clock?.nowMs() ?? Date.now()) - startedAt;
      const completedAt = new Date(this.deps.clock?.nowMs() ?? Date.now()).toISOString();

      this.status = {
        mode,
        status: "succeeded",
        lastSuccessfulSyncAt: completedAt,
        lastFailedSyncAt: this.status.lastFailedSyncAt,
        lastStartedAt: startedIso,
        lastCompletedAt: completedAt,
        recordsProcessed: result.recordsProcessed,
        durationMs,
        providerVersion: result.providerVersion,
        providerLatencyMs: result.providerLatencyMs,
        cursor: {
          lastSyncAt: completedAt,
          resumeToken: undefined,
          resourceCursors: result.resourceCursors,
        },
        errors: [],
      };

      this.deps.metricsProvider
        ?.histogram("zammad.sync.duration_ms", { mode })
        .observe(durationMs);
      this.deps.metricsProvider
        ?.counter("zammad.sync.throughput", { mode, result: "success" })
        .inc(result.recordsProcessed);

      return {
        status: this.getSyncState(),
        recordsProcessed: result.recordsProcessed,
        durationMs,
        resources: result.resources,
      };
    } catch (error) {
      const durationMs = (this.deps.clock?.nowMs() ?? Date.now()) - startedAt;
      const failedAt = new Date(this.deps.clock?.nowMs() ?? Date.now()).toISOString();
      this.retryCounts += 1;
      const message = error instanceof Error ? error.message : "sync_failed";

      this.status = {
        ...this.status,
        mode,
        status: "failed",
        lastFailedSyncAt: failedAt,
        lastCompletedAt: failedAt,
        durationMs,
        errors: [message],
        cursor: {
          ...this.status.cursor,
          resumeToken: encodeResumeToken({
            mode,
            since,
            recordsProcessed: this.status.recordsProcessed,
            ticketPage: 1,
          }),
        },
      };

      this.deps.metricsProvider?.counter("zammad.sync.failures", { mode }).inc();
      this.deps.metricsProvider?.counter("zammad.sync.retries", { mode }).inc();
      this.deps.metricsProvider
        ?.histogram("zammad.sync.duration_ms", { mode, result: "failure" })
        .observe(durationMs);

      throw error;
    }
  }

  private async executeSync(
    context: IntegrationRequestContext,
    mode: "full" | "incremental",
    since: string | undefined,
    options: SyncRunOptions,
    resume: ResumeTokenPayload | undefined,
  ): Promise<{
    readonly recordsProcessed: number;
    readonly resources: Record<string, number>;
    readonly resourceCursors: Record<string, string>;
    readonly providerVersion?: string;
    readonly providerLatencyMs?: number;
  }> {
    const maxRecords = options.maxRecords ?? Number.POSITIVE_INFINITY;
    let recordsProcessed = resume?.recordsProcessed ?? 0;
    let ticketCount = 0;
    let organizationCount = 0;
    let groupCount = 0;
    let userCount = 0;
    const resourceCursors: Record<string, string> = {};
    const probeStarted = this.deps.clock?.nowMs() ?? Date.now();

    const ticketPage = resume?.ticketPage ?? 1;
    const tickets = await this.deps.client.listTickets(
      context,
      buildZammadListQuery({ page: ticketPage, perPage: 50 }),
    );
    for (const ticket of tickets.items) {
      if (recordsProcessed >= maxRecords) break;
      if (mode === "incremental" && !matchesSince(ticket.updated_at, since)) continue;
      ticketCount += 1;
      recordsProcessed += 1;
    }
    resourceCursors.tickets = String(ticketPage);

    if (recordsProcessed < maxRecords) {
      const organizations = await this.deps.client.listOrganizations(
        context,
        buildZammadListQuery({ page: resume?.organizationPage ?? 1, perPage: 50 }),
      );
      for (const organization of organizations.items) {
        if (recordsProcessed >= maxRecords) break;
        if (mode === "incremental" && !matchesSince(organization.updated_at, since)) continue;
        organizationCount += 1;
        recordsProcessed += 1;
      }
      resourceCursors.organizations = String(resume?.organizationPage ?? 1);
    }

    if (recordsProcessed < maxRecords) {
      const groups = await this.deps.client.listGroups(
        context,
        buildZammadListQuery({ page: resume?.groupPage ?? 1, perPage: 50 }),
      );
      for (const group of groups.items) {
        if (recordsProcessed >= maxRecords) break;
        if (mode === "incremental" && !matchesSince(group.updated_at, since)) continue;
        groupCount += 1;
        recordsProcessed += 1;
      }
      resourceCursors.groups = String(resume?.groupPage ?? 1);
    }

    if (recordsProcessed < maxRecords) {
      const users = await this.deps.client.listUsers(
        context,
        buildZammadListQuery({ page: resume?.userPage ?? 1, perPage: 50 }),
      );
      for (const user of users.items) {
        if (recordsProcessed >= maxRecords) break;
        if (mode === "incremental" && !matchesSince(user.updated_at, since)) continue;
        userCount += 1;
        recordsProcessed += 1;
      }
      resourceCursors.users = String(resume?.userPage ?? 1);
    }

    const providerLatencyMs = (this.deps.clock?.nowMs() ?? Date.now()) - probeStarted;
    this.deps.metricsProvider
      ?.histogram("zammad.provider.latency_ms", { operation: "sync" })
      .observe(providerLatencyMs);

    return {
      recordsProcessed,
      resources: {
        support_requests: ticketCount,
        organizations: organizationCount,
        groups: groupCount,
        users: userCount,
      },
      resourceCursors,
      providerLatencyMs,
    };
  }

  getDiagnostics() {
    return {
      syncCapability: true,
      syncHealth:
        this.status.status === "failed"
          ? ("unhealthy" as const)
          : this.status.status === "running"
            ? ("degraded" as const)
            : ("healthy" as const),
      lastSuccessfulSyncAt: this.status.lastSuccessfulSyncAt,
      lastFailedSyncAt: this.status.lastFailedSyncAt,
      retryCounts: this.retryCounts,
      supportsIncremental: true,
      supportsResumeTokens: true,
      supportsSafeRestart: true,
    };
  }
}
