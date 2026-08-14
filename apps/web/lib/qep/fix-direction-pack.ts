/**
 * Flagship F15 — Fix Direction Pack for developers (QA-confirmed when present).
 * Same schema family as AI Fix Pack; purpose = qa_gate_fix_direction.
 * Never auto-certifies / never GO.
 */

import { createHash } from "node:crypto";

import {
  composeAiFixPack,
  getAiFixPack,
  renderAiFixPackMarkdown,
  type AiFixItem,
  type AiFixPack,
} from "@/lib/qep/ai-fix-pack";
import { getQaGateConfirmations } from "@/lib/qep/qa-gate-confirm-store";
import { getReportPack } from "@/lib/qep/report-pack";

export type FixDirectionPack = Omit<AiFixPack, "kind" | "purpose" | "usage"> & {
  readonly kind: "fix_direction_pack";
  readonly purpose: "qa_gate_fix_direction";
  readonly confirmedOnly: boolean;
  readonly confirmedFindingIds: readonly string[];
  readonly usage: {
    readonly forDev: string;
    readonly forAi: string;
    readonly notFor: string;
  };
};

export function composeFixDirectionPack(input: {
  readonly aiPack: AiFixPack;
  readonly confirmedFindingIds: readonly string[];
  readonly preferConfirmed: boolean;
}): FixDirectionPack {
  const confirmed = new Set(input.confirmedFindingIds);
  let items: readonly AiFixItem[] = input.aiPack.items;
  let confirmedOnly = false;

  if (input.preferConfirmed && confirmed.size > 0) {
    const filtered = input.aiPack.items.filter((item) =>
      item.relatedFindingIds.some((id) => confirmed.has(id)),
    );
    if (filtered.length > 0) {
      items = filtered;
      confirmedOnly = true;
    }
  }

  const digest = createHash("sha256")
    .update(
      `${input.aiPack.tenantId}|${input.aiPack.changeEventId}|fix|${items.length}|${confirmedOnly}`,
    )
    .digest("hex")
    .slice(0, 12);

  return {
    packId: `fix-dir-${digest}`,
    kind: "fix_direction_pack",
    schemaVersion: "1.0",
    changeEventId: input.aiPack.changeEventId,
    tenantId: input.aiPack.tenantId,
    generatedAt: input.aiPack.generatedAt,
    advisory: true,
    autoCertified: false,
    purpose: "qa_gate_fix_direction",
    assessmentBand: input.aiPack.assessmentBand,
    assessmentHeadline: input.aiPack.assessmentHeadline,
    severityRollup: input.aiPack.severityRollup,
    items,
    findings: input.aiPack.findings,
    confirmedOnly,
    confirmedFindingIds: [...confirmed],
    usage: {
      forDev:
        "QA-directed remediation. Prefer confirmed findings. Still not a release GO.",
      forAi:
        "Paste into Cursor as structured fix directions from QA Gate. P0/P1 first.",
      notFor: "Not certification GO/NO-GO. Not a substitute for human RC decision.",
    },
  };
}

export async function getFixDirectionPack(input: {
  readonly tenantId: string;
  readonly changeEventId: string;
  readonly preferConfirmed?: boolean;
}): Promise<FixDirectionPack> {
  const aiPack = await getAiFixPack({
    tenantId: input.tenantId,
    changeEventId: input.changeEventId,
  });
  const confirmations = getQaGateConfirmations(input.tenantId, input.changeEventId);
  return composeFixDirectionPack({
    aiPack,
    confirmedFindingIds: (confirmations?.findings ?? []).map((f) => f.findingId),
    preferConfirmed: input.preferConfirmed !== false,
  });
}

export function renderFixDirectionPackMarkdown(pack: FixDirectionPack): string {
  const base = renderAiFixPackMarkdown({
    ...pack,
    kind: "ai_fix_pack",
    purpose: "developer_early_check",
    usage: {
      forAi: pack.usage.forAi,
      notFor: pack.usage.notFor,
    },
  });
  return base
    .replace(
      "# AI Fix Pack (Early Check — advisory)",
      `# Fix Direction Pack (QA Gate — advisory)${pack.confirmedOnly ? " · confirmed findings" : ""}`,
    )
    .replace(
      "Schema 1.0.",
      `Schema ${pack.schemaVersion}. Confirmed: ${pack.confirmedFindingIds.length}. ${pack.usage.forDev}`,
    );
}

/** Test helper — compose without async deps. */
export function composeFixDirectionPackFromReport(input: {
  readonly tenantId: string;
  readonly changeEventId: string;
  readonly generatedAt: string;
  readonly preferConfirmed?: boolean;
  readonly confirmedFindingIds?: readonly string[];
  readonly report: Parameters<typeof composeAiFixPack>[0]["report"];
}): FixDirectionPack {
  const aiPack = composeAiFixPack({
    tenantId: input.tenantId,
    changeEventId: input.changeEventId,
    generatedAt: input.generatedAt,
    report: input.report,
  });
  return composeFixDirectionPack({
    aiPack,
    confirmedFindingIds: input.confirmedFindingIds ?? [],
    preferConfirmed: input.preferConfirmed !== false,
  });
}

export async function loadReportForTests(tenantId: string, changeEventId: string) {
  return getReportPack({ tenantId, changeEventId });
}
