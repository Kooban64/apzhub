/**
 * Flagship F14 — compose PM insight for a quality project.
 * Read-only aggregation; never certifies; never exposes PAT values.
 */

import {
  getCertificationByChange,
  type CertificationEvaluation,
} from "@/lib/qep/certification-runtime";
import { getDefectRuntime } from "@/lib/qep/defect-runtime";
import {
  getQualityProject,
  type QualityProject,
} from "@/lib/qep/quality-project-store";
import { resolveGithubPatFromEnv, getQepScmRuntime } from "@/lib/qep/scm-runtime";
import {
  listVerificationDispatches,
  type VerificationDispatchRecord,
} from "@/lib/qep/verification-dispatch-store";

export type TokenHealth = {
  readonly configured: boolean;
  /** Never the secret — ops signal only. */
  readonly source: "server_secrets" | "none";
};

export type RepoInsight = {
  readonly repositoryId: string;
  readonly fullName?: string;
  readonly healthOk?: boolean;
  readonly healthDetail?: string;
};

export type QualityProjectInsight = {
  readonly project: QualityProject;
  readonly tokenHealth: TokenHealth;
  readonly repositories: readonly RepoInsight[];
  readonly recentChangeCount: number;
  readonly recentChanges: readonly {
    readonly changeEventId: string;
    readonly repositoryId?: string;
    readonly kind: string;
    readonly summary: string;
    readonly occurredAt: string;
  }[];
  readonly recentDispatchCount: number;
  readonly latestDispatches: readonly {
    readonly dispatchId: string;
    readonly changeEventId: string;
    readonly pack?: string;
    readonly status: string;
    readonly detail?: string;
    readonly createdAt: string;
  }[];
  readonly defects: {
    readonly available: boolean;
    readonly openCount: number;
    readonly highOrCriticalCount: number;
  };
  readonly latestCertification?: {
    readonly changeEventId: string;
    readonly evaluationId: string;
    readonly readiness?: string;
    readonly score?: number;
    readonly humanDecision?: string;
  };
  readonly advisory: true;
  readonly autoCertified: false;
};

function tokenHealth(env: NodeJS.ProcessEnv = process.env): TokenHealth {
  const configured = Boolean(resolveGithubPatFromEnv(env));
  return {
    configured,
    source: configured ? "server_secrets" : "none",
  };
}

async function softDefectCounts(
  tenantId: string,
  projectId: string,
): Promise<QualityProjectInsight["defects"]> {
  try {
    const items = await getDefectRuntime().service.list(
      {
        userId: "system:f14-insight",
        tenantId,
        permissions: ["qep.defects.read", "qep.*"],
      },
      { projectId },
    );
    const open = items.filter((d) => {
      const state = String(
        (d as { lifecycleState?: string; state?: string }).lifecycleState ??
          (d as { state?: string }).state ??
          "",
      ).toLowerCase();
      return (
        state !== "closed" &&
        state !== "resolved" &&
        state !== "cancelled" &&
        state !== "rejected"
      );
    });
    const highOrCritical = open.filter((d) => {
      const sev = String((d as { severity?: string }).severity ?? "").toLowerCase();
      return sev === "critical" || sev === "high";
    });
    return {
      available: true,
      openCount: open.length,
      highOrCriticalCount: highOrCritical.length,
    };
  } catch {
    return { available: false, openCount: 0, highOrCriticalCount: 0 };
  }
}

function pickLatestCert(
  evaluations: readonly CertificationEvaluation[],
): CertificationEvaluation | undefined {
  if (evaluations.length === 0) return undefined;
  return [...evaluations].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

export async function composeQualityProjectInsight(input: {
  readonly tenantId: string;
  readonly projectId: string;
  readonly env?: NodeJS.ProcessEnv;
  readonly changeLimit?: number;
}): Promise<QualityProjectInsight> {
  const project = getQualityProject(input.tenantId, input.projectId);
  if (!project) {
    throw new Error("quality_project.not_found");
  }

  const scm = getQepScmRuntime();
  const repoInsights: RepoInsight[] = [];
  for (const repositoryId of project.repositoryIds) {
    try {
      const repo = await scm.getRepository(repositoryId);
      repoInsights.push({
        repositoryId,
        fullName: repo?.fullName,
        healthOk: repo?.health?.ok,
        healthDetail: repo?.health?.detail,
      });
    } catch {
      repoInsights.push({ repositoryId });
    }
  }

  const changeLimit = input.changeLimit ?? 20;
  const allChanges = await scm.listChangeEvents({
    tenantId: input.tenantId,
    limit: 200,
  });
  const repoSet = new Set(project.repositoryIds);
  const projectChanges = allChanges
    .filter((c) => c.repositoryId && repoSet.has(c.repositoryId))
    .slice(0, changeLimit);

  const dispatches: VerificationDispatchRecord[] = [];
  for (const change of projectChanges.slice(0, 30)) {
    const rows = listVerificationDispatches({
      tenantId: input.tenantId,
      changeEventId: change.changeEventId,
      limit: 10,
    });
    dispatches.push(...rows);
  }
  dispatches.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  let latestCertification: QualityProjectInsight["latestCertification"];
  for (const change of projectChanges.slice(0, 10)) {
    try {
      const cert = await getCertificationByChange(input.tenantId, change.changeEventId);
      const evaluation = pickLatestCert(cert.evaluations);
      if (evaluation) {
        latestCertification = {
          changeEventId: change.changeEventId,
          evaluationId: evaluation.evaluationId,
          readiness: evaluation.readiness,
          score: evaluation.score,
          humanDecision: evaluation.humanDecision?.outcome,
        };
        break;
      }
    } catch {
      // soft
    }
  }

  const defects = await softDefectCounts(input.tenantId, project.id);

  return {
    project,
    tokenHealth: tokenHealth(input.env),
    repositories: repoInsights,
    recentChangeCount: projectChanges.length,
    recentChanges: projectChanges.map((c) => ({
      changeEventId: c.changeEventId,
      repositoryId: c.repositoryId,
      kind: c.kind,
      summary: c.summary,
      occurredAt: c.occurredAt,
    })),
    recentDispatchCount: dispatches.length,
    latestDispatches: dispatches.slice(0, 15).map((d) => ({
      dispatchId: d.dispatchId,
      changeEventId: d.changeEventId,
      pack: d.pack,
      status: d.status,
      detail: d.detail,
      createdAt: d.createdAt,
    })),
    defects,
    latestCertification,
    advisory: true,
    autoCertified: false,
  };
}

export function getScmTokenHealth(env: NodeJS.ProcessEnv = process.env): TokenHealth {
  return tokenHealth(env);
}
