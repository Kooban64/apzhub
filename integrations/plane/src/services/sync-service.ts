import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type {
  SyncCursor,
  SyncRunOptions,
  SyncRunResult,
  SyncStatus,
} from "@apzhub/platform-service-contracts";

import type {
  PlaneIssueRecord,
  PlanePaginatedResponse,
  PlaneProjectRecord,
} from "../internal/plane-api-types";
import type { PlaneServiceDeps } from "./plane-operation-runner";

interface ResumeTokenPayload {
  readonly mode: "full" | "incremental";
  readonly since?: string;
  readonly projectCursor?: string;
  readonly issueCursor?: string;
  readonly projectIndex?: number;
  readonly recordsProcessed?: number;
}

function asProjectArray(
  response: PlanePaginatedResponse<PlaneProjectRecord> | readonly PlaneProjectRecord[],
): PlanePaginatedResponse<PlaneProjectRecord> {
  if (Array.isArray(response)) {
    return {
      results: response,
      count: response.length,
      total_count: response.length,
      next_cursor: null,
      next_page_results: false,
    };
  }
  return response as PlanePaginatedResponse<PlaneProjectRecord>;
}

function asIssueArray(
  response: PlanePaginatedResponse<PlaneIssueRecord> | readonly PlaneIssueRecord[],
): PlanePaginatedResponse<PlaneIssueRecord> {
  if (Array.isArray(response)) {
    return {
      results: response,
      count: response.length,
      total_count: response.length,
      next_cursor: null,
      next_page_results: false,
    };
  }
  return response as PlanePaginatedResponse<PlaneIssueRecord>;
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

/**
 * Plane synchronisation APIs — no scheduler or background workers.
 * Maintains adapter-local sync cursor/state for safe restart and resume.
 */
export class PlaneSyncService {
  private status: SyncStatus = idleStatus();
  private retryCounts = 0;

  constructor(private readonly deps: PlaneServiceDeps) {}

  getSyncState(): SyncStatus {
    return { ...this.status, cursor: { ...this.status.cursor } };
  }

  getLastSyncTimestamp(): string | undefined {
    return this.status.lastSuccessfulSyncAt ?? this.status.cursor.lastSyncAt;
  }

  /**
   * Reset a stuck "running" status so sync can safely restart after process interruption.
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
        mode === "full" ? "plane.sync.full" : "plane.sync.incremental",
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
        ?.histogram("plane.sync.duration_ms", { mode })
        .observe(durationMs);
      this.deps.metricsProvider
        ?.counter("plane.sync.throughput", { mode, result: "success" })
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
            projectIndex: 0,
          }),
        },
      };

      this.deps.metricsProvider
        ?.counter("plane.sync.failures", { mode })
        .inc();
      this.deps.metricsProvider
        ?.counter("plane.sync.retries", { mode })
        .inc();
      this.deps.metricsProvider
        ?.histogram("plane.sync.duration_ms", { mode, result: "failure" })
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
    let projectCount = 0;
    let taskCount = 0;
    const resourceCursors: Record<string, string> = {};
    let recordsProcessed = resume?.recordsProcessed ?? 0;
    const probeStarted = this.deps.clock?.nowMs() ?? Date.now();

    let projectCursor: string | undefined = resume?.projectCursor;
    let projects: PlaneProjectRecord[] = [];

    do {
      const page = asProjectArray(
        await this.deps.client.listProjects(context, {
          per_page: 50,
          cursor: projectCursor,
          ...(mode === "incremental" && since ? { updated_at__gte: since } : {}),
        }),
      );
      projects = [...projects, ...page.results];
      projectCursor = page.next_cursor ?? undefined;
      if (projectCursor) {
        resourceCursors.projects = projectCursor;
      }
    } while (projectCursor && recordsProcessed + projects.length < maxRecords);

    for (const project of projects) {
      if (recordsProcessed >= maxRecords) break;
      projectCount += 1;
      recordsProcessed += 1;

      let issueCursor: string | undefined =
        resume?.projectIndex === projects.indexOf(project) ? resume.issueCursor : undefined;

      do {
        if (recordsProcessed >= maxRecords) break;
        const issuePage = asIssueArray(
          await this.deps.client.listIssues(context, project.id, {
            per_page: 50,
            cursor: issueCursor,
            ...(mode === "incremental" && since ? { updated_at__gte: since } : {}),
          }),
        );

        for (const _issue of issuePage.results) {
          if (recordsProcessed >= maxRecords) break;
          taskCount += 1;
          recordsProcessed += 1;
        }

        issueCursor = issuePage.next_cursor ?? undefined;
        if (issueCursor) {
          resourceCursors.issues = issueCursor;
        }
      } while (issueCursor);
    }

    const providerLatencyMs = (this.deps.clock?.nowMs() ?? Date.now()) - probeStarted;

    this.deps.metricsProvider
      ?.histogram("plane.provider.latency_ms", { operation: "sync" })
      .observe(providerLatencyMs);

    return {
      recordsProcessed,
      resources: {
        projects: projectCount,
        tasks: taskCount,
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
