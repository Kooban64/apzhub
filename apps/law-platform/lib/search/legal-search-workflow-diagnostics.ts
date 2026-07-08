import type { LegalSearchFilters } from "./legal-search-filters";
import type { LegalSearchSurface } from "./legal-search-recent-searches";

export type LegalSearchWorkflowOperation = "execute" | "open" | "command" | "palette";

export type LegalSearchWorkflowStage =
  "knowledge" | "filter" | "command" | "event" | "notification" | "activity";

export interface LegalSearchWorkflowStageRecord {
  readonly operation: LegalSearchWorkflowOperation;
  readonly stage: LegalSearchWorkflowStage;
  readonly ok: boolean;
  readonly durationMs: number;
  readonly detail?: string;
}

export interface LegalSearchWorkflowRunRecord {
  readonly operation: LegalSearchWorkflowOperation;
  readonly startedAt: string;
  readonly durationMs: number;
  readonly ok: boolean;
  readonly commandId?: string;
  readonly eventId?: string;
  readonly query?: string;
  readonly resultCount?: number;
  readonly filters?: LegalSearchFilters;
  readonly surface?: LegalSearchSurface;
  readonly stages: readonly LegalSearchWorkflowStageRecord[];
}

/** Session-scoped workflow diagnostics for LAW-007-01 / LAW-007-02 validation. */
export class LegalSearchWorkflowDiagnostics {
  private readonly runs: LegalSearchWorkflowRunRecord[] = [];
  private lastQuery = "";
  private lastResultCount = 0;
  private lastProviderCount = 0;
  private lastFilters: LegalSearchFilters = {};
  private lastSurface: LegalSearchSurface = "page";
  private paletteQueryCount = 0;
  private filteredEventCount = 0;

  record(run: LegalSearchWorkflowRunRecord): void {
    this.runs.push(run);
    if (run.operation === "execute") {
      this.lastQuery = run.query ?? "";
      this.lastResultCount = run.resultCount ?? 0;
      this.lastFilters = run.filters ?? {};
      this.lastSurface = run.surface ?? "page";
      if (run.surface === "palette") {
        this.paletteQueryCount += 1;
      }
    }
  }

  setLastProviderCount(count: number): void {
    this.lastProviderCount = count;
  }

  setLastQuery(query: string): void {
    this.lastQuery = query;
  }

  setLastResultCount(count: number): void {
    this.lastResultCount = count;
  }

  setLastFilters(filters: LegalSearchFilters): void {
    this.lastFilters = filters;
  }

  setLastSurface(surface: LegalSearchSurface): void {
    this.lastSurface = surface;
  }

  incrementFilteredEventCount(): void {
    this.filteredEventCount += 1;
  }

  incrementPaletteQueryCount(): void {
    this.paletteQueryCount += 1;
  }

  getSummary() {
    return {
      totalRuns: this.runs.length,
      lastQuery: this.lastQuery,
      lastResultCount: this.lastResultCount,
      lastProviderCount: this.lastProviderCount,
      lastFilters: this.lastFilters,
      lastSurface: this.lastSurface,
      paletteQueryCount: this.paletteQueryCount,
      filteredEventCount: this.filteredEventCount,
      eventsRaised: this.runs.filter((run) => run.eventId).length,
      runs: [...this.runs],
    };
  }

  clear(): void {
    this.runs.length = 0;
    this.lastQuery = "";
    this.lastResultCount = 0;
    this.lastProviderCount = 0;
    this.lastFilters = {};
    this.lastSurface = "page";
    this.paletteQueryCount = 0;
    this.filteredEventCount = 0;
  }
}

let sharedDiagnostics: LegalSearchWorkflowDiagnostics | undefined;

export function getLegalSearchWorkflowDiagnostics(): LegalSearchWorkflowDiagnostics {
  sharedDiagnostics ??= new LegalSearchWorkflowDiagnostics();
  return sharedDiagnostics;
}

export function resetLegalSearchWorkflowDiagnostics(): void {
  sharedDiagnostics = undefined;
}
