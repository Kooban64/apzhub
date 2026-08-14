/**
 * Flagship F15 — QA Gate confirmation ledger (human-confirmed findings).
 * File-backed outside tests. Does not certify GO/NO-GO.
 */

import {
  isQepLedgerPersistEnabled,
  listJsonLedgerFiles,
  readJsonLedgerFile,
  resolveQepDataRoot,
  writeJsonLedgerFile,
} from "@/lib/qep/qep-ledger-fs";

export type QaConfirmedFinding = {
  readonly findingId: string;
  readonly confirmedAt: string;
  readonly confirmedBy: string;
  readonly notes?: string;
  readonly defectId?: string;
  readonly createDefectAttempted?: boolean;
  readonly createDefectError?: string;
};

export type QaGateConfirmationRecord = {
  readonly changeEventId: string;
  readonly tenantId: string;
  readonly findings: readonly QaConfirmedFinding[];
  readonly updatedAt: string;
};

const byChange = new Map<string, QaGateConfirmationRecord>();
let hydrated = false;

function dataDir(): string {
  return resolveQepDataRoot("qep-qa-gate-confirmations");
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!isQepLedgerPersistEnabled()) return;
  for (const file of listJsonLedgerFiles(dataDir())) {
    const id = file.replace(/\.json$/, "");
    const row = readJsonLedgerFile<QaGateConfirmationRecord>(dataDir(), id);
    if (row?.changeEventId) {
      byChange.set(row.changeEventId, row);
    }
  }
}

function persist(record: QaGateConfirmationRecord): void {
  if (!isQepLedgerPersistEnabled()) return;
  writeJsonLedgerFile(dataDir(), record.changeEventId, record);
}

export function resetQaGateConfirmStoreForTests(): void {
  byChange.clear();
  hydrated = false;
}

export function getQaGateConfirmations(
  tenantId: string,
  changeEventId: string,
): QaGateConfirmationRecord | undefined {
  hydrate();
  const row = byChange.get(changeEventId);
  if (!row || row.tenantId !== tenantId) return undefined;
  return row;
}

export function confirmQaGateFindings(input: {
  readonly tenantId: string;
  readonly changeEventId: string;
  readonly confirmedBy: string;
  readonly findingIds: readonly string[];
  readonly notes?: string;
  readonly defectIdsByFinding?: Readonly<Record<string, string>>;
  readonly defectsMeta?: Readonly<
    Record<string, { attempted?: boolean; error?: string; defectId?: string }>
  >;
  readonly now?: () => Date;
}): QaGateConfirmationRecord {
  hydrate();
  const changeEventId = input.changeEventId.trim();
  if (!changeEventId) {
    throw new Error("qa_gate.change_id_required");
  }
  const ids = Array.from(
    new Set(input.findingIds.map((id) => id.trim()).filter(Boolean)),
  );
  if (ids.length === 0) {
    throw new Error("qa_gate.finding_ids_required");
  }

  const now = (input.now ?? (() => new Date()))().toISOString();
  const existing = getQaGateConfirmations(input.tenantId, changeEventId);
  const prior = new Map(
    (existing?.findings ?? []).map((f) => [f.findingId, f] as const),
  );

  for (const findingId of ids) {
    const meta = input.defectsMeta?.[findingId];
    const defectId =
      meta?.defectId ??
      input.defectIdsByFinding?.[findingId] ??
      prior.get(findingId)?.defectId;
    prior.set(findingId, {
      findingId,
      confirmedAt: now,
      confirmedBy: input.confirmedBy,
      notes: input.notes?.trim() || prior.get(findingId)?.notes,
      defectId,
      createDefectAttempted:
        meta?.attempted ?? prior.get(findingId)?.createDefectAttempted,
      createDefectError: meta?.error ?? prior.get(findingId)?.createDefectError,
    });
  }

  const record: QaGateConfirmationRecord = {
    changeEventId,
    tenantId: input.tenantId,
    findings: Array.from(prior.values()),
    updatedAt: now,
  };
  byChange.set(changeEventId, record);
  persist(record);
  return record;
}
