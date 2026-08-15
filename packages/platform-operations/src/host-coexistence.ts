/**
 * R12-OPS-03 — Host coexistence capacity controls.
 * Port reservation + capacity thresholds for shared-host ops (OPS-R-01).
 * No legacy stack remapping; no platform redesign.
 */

export type HostCapacityDomain =
  "compute" | "storage" | "database-connections" | "redis-memory" | "ports";

export interface HostPortReservation {
  readonly service: string;
  readonly hostPort: number;
  readonly owner: "apzhub";
  readonly notes: string;
}

export interface HostCapacityThreshold {
  readonly id: string;
  readonly domain: HostCapacityDomain;
  readonly metric: string;
  readonly warnAt: number;
  readonly criticalAt: number;
  readonly unit: string;
  readonly action: string;
}

export type HostCoexistenceAuditVerdict = "PASS" | "FAIL";

export interface HostCoexistenceAuditFinding {
  readonly id: string;
  readonly severity: "pass" | "fail" | "warn";
  readonly message: string;
}

export interface HostCoexistenceAuditEvidence {
  readonly schemaVersion: "1.0.0";
  readonly programmeId: "APZHUB-1.2-004";
  readonly backlogItemId: "R12-OPS-03";
  readonly riskId: "OPS-R-01";
  readonly executedAt: string;
  readonly environment: string;
  readonly findings: readonly HostCoexistenceAuditFinding[];
  readonly verdict: HostCoexistenceAuditVerdict;
  readonly reservedApzhubPorts: readonly number[];
  readonly forbiddenLegacyPorts: readonly number[];
  readonly composePorts: readonly number[];
  readonly notes: readonly string[];
  readonly artefactPaths: readonly string[];
}

/** APZHUB reserved host ports — must match ENVIRONMENT.md SPR-001 + LTS plan tables. */
export const APZHUB_RESERVED_HOST_PORTS: readonly HostPortReservation[] = [
  {
    service: "@apzhub/web",
    hostPort: 3300,
    owner: "apzhub",
    notes: "pnpm dev / production web",
  },
  {
    service: "storybook",
    hostPort: 6006,
    owner: "apzhub",
    notes: "pnpm storybook",
  },
  {
    service: "postgres",
    hostPort: 54334,
    owner: "apzhub",
    notes: "Docker; legacy apzpg uses 54333",
  },
  {
    service: "redis",
    hostPort: 6380,
    owner: "apzhub",
    notes: "Docker",
  },
  {
    service: "meilisearch",
    hostPort: 17700,
    owner: "apzhub",
    notes: "Docker apzhub-meilisearch — platform search index, not a business engine",
  },
  {
    service: "caddy-http",
    hostPort: 3080,
    owner: "apzhub",
    notes: "Optional local reverse proxy",
  },
  {
    service: "caddy-https",
    hostPort: 3443,
    owner: "apzhub",
    notes: "tls internal for local dev",
  },
  // SPR-OPS-LTS-001 — planned APZHUB-owned CE/LTS engines (outside hub process).
  // Do not bind until Owner authorises bring-up; never reuse legacy 18081–18088 / 15678.
  {
    service: "engine-zammad-lts",
    hostPort: 19081,
    owner: "apzhub",
    notes: "Planned Support CE/LTS — SPR-OPS-LTS-001",
  },
  {
    service: "engine-paperless-lts",
    hostPort: 19082,
    owner: "apzhub",
    notes:
      "Planned Documents DMS CE/LTS (requires ADR before adapter) — SPR-OPS-LTS-001",
  },
  {
    service: "engine-kimai-lts",
    hostPort: 19083,
    owner: "apzhub",
    notes: "Planned Time CE/LTS — SPR-OPS-LTS-001",
  },
  {
    service: "engine-metabase-lts",
    hostPort: 19084,
    owner: "apzhub",
    notes: "Planned Analytics CE/LTS — SPR-OPS-LTS-001",
  },
  {
    service: "engine-plane-lts",
    hostPort: 19085,
    owner: "apzhub",
    notes: "Planned Projects CE/LTS — SPR-OPS-LTS-001",
  },
  {
    service: "engine-n8n-lts",
    hostPort: 19678,
    owner: "apzhub",
    notes: "Planned Workflow CE/LTS — SPR-OPS-LTS-001",
  },
] as const;

/**
 * Legacy / host ports APZHUB compose must never bind.
 * Drawn from ENVIRONMENT.md listening summary + engine debug ports.
 */
export const FORBIDDEN_LEGACY_HOST_PORTS: readonly number[] = [
  22, 80, 443, 8080, 54333, 15678, 18081, 18082, 18083, 18084, 18085, 18086, 18087,
  18088, 18090, 18091, 18092, 18443, 19443, 3001, 3100, 3200,
] as const;

export const HOST_CAPACITY_THRESHOLDS: readonly HostCapacityThreshold[] = [
  {
    id: "capacity.disk.used-percent",
    domain: "storage",
    metric: "host-disk-used-percent",
    warnAt: 80,
    criticalAt: 90,
    unit: "%",
    action: "Capacity Change + Owner gate before large image pulls / restores",
  },
  {
    id: "capacity.docker.volume-growth",
    domain: "storage",
    metric: "docker-volume-growth-signal",
    warnAt: 1,
    criticalAt: 2,
    unit: "signal",
    action: "Review unused volumes; do not prune APZHUB named volumes without Approval",
  },
  {
    id: "capacity.ports.conflict",
    domain: "ports",
    metric: "reserved-port-conflict-count",
    warnAt: 1,
    criticalAt: 1,
    unit: "count",
    action: "Stop conflicting bind; never remap legacy stack without Owner Approval",
  },
  {
    id: "capacity.postgres.connections",
    domain: "database-connections",
    metric: "platform-pg-connection-pressure",
    warnAt: 80,
    criticalAt: 95,
    unit: "%",
    action: "Investigate connection leaks; scale only with coexistence review",
  },
  {
    id: "capacity.redis.memory",
    domain: "redis-memory",
    metric: "apzhub-redis-memory-pressure",
    warnAt: 80,
    criticalAt: 95,
    unit: "%",
    action: "Session storm runbook; do not steal legacy redis ports",
  },
] as const;

export const HOST_COEXISTENCE_REQUIRED_ARTEFACTS = [
  "ENVIRONMENT.md",
  "docs/operations/CAPACITY-PLANNING.md",
  "docs/operations/HOST-COEXISTENCE-CONTROLS.md",
  "infrastructure/docker/docker-compose.dev.yml",
  "docs/operations/evidence/host-coexistence/README.md",
] as const;

export function listApzhubReservedPorts(): readonly number[] {
  return APZHUB_RESERVED_HOST_PORTS.map((entry) => entry.hostPort);
}

/** Parse host ports from a docker-compose YAML fragment (best-effort). */
export function extractComposeHostPorts(composeYaml: string): readonly number[] {
  const ports = new Set<number>();
  const patterns = [
    /^\s*-\s*["']?(\d{2,5}):\d{2,5}["']?\s*$/gm,
    /^\s*-\s*["']?127\.0\.0\.1:(\d{2,5}):\d{2,5}["']?\s*$/gm,
    /^\s*-\s*["']?0\.0\.0\.0:(\d{2,5}):\d{2,5}["']?\s*$/gm,
  ];
  for (const pattern of patterns) {
    for (const match of composeYaml.matchAll(pattern)) {
      const port = Number(match[1]);
      if (Number.isInteger(port) && port > 0 && port < 65536) {
        ports.add(port);
      }
    }
  }
  return [...ports].sort((a, b) => a - b);
}

export function auditHostCoexistence(input: {
  readonly composeYaml: string;
  readonly artefactsPresent: {
    readonly environmentDoc: boolean;
    readonly capacityPlanningDoc: boolean;
    readonly coexistenceControlsDoc: boolean;
    readonly composeFile: boolean;
    readonly evidenceDirectory: boolean;
  };
  readonly liveConflicts?: readonly {
    readonly port: number;
    readonly occupant: string;
  }[];
  readonly environment?: string;
  readonly executedAt?: string;
}): HostCoexistenceAuditEvidence {
  const findings: HostCoexistenceAuditFinding[] = [];
  const reserved = listApzhubReservedPorts();
  const composePorts = extractComposeHostPorts(input.composeYaml);

  const artefactsOk =
    input.artefactsPresent.environmentDoc &&
    input.artefactsPresent.capacityPlanningDoc &&
    input.artefactsPresent.coexistenceControlsDoc &&
    input.artefactsPresent.composeFile &&
    input.artefactsPresent.evidenceDirectory;

  findings.push({
    id: "artefacts.present",
    severity: artefactsOk ? "pass" : "fail",
    message: artefactsOk
      ? "Required host-coexistence artefacts are present."
      : "One or more required host-coexistence artefacts are missing.",
  });

  for (const port of composePorts) {
    if (FORBIDDEN_LEGACY_HOST_PORTS.includes(port)) {
      findings.push({
        id: `compose.forbidden.${port}`,
        severity: "fail",
        message: `Compose binds forbidden legacy port ${port}.`,
      });
    } else if (!reserved.includes(port)) {
      findings.push({
        id: `compose.unreserved.${port}`,
        severity: "fail",
        message: `Compose binds port ${port} not in APZHUB reserved catalogue — update ENVIRONMENT.md + catalogue together.`,
      });
    } else {
      findings.push({
        id: `compose.reserved.${port}`,
        severity: "pass",
        message: `Compose port ${port} is APZHUB-reserved.`,
      });
    }
  }

  for (const expected of ["54334", "6380", "3080", "3443"]) {
    const port = Number(expected);
    if (!composePorts.includes(port)) {
      findings.push({
        id: `compose.missing.${port}`,
        severity: "fail",
        message: `Expected APZHUB compose host port ${port} not found.`,
      });
    }
  }

  for (const threshold of HOST_CAPACITY_THRESHOLDS) {
    if (threshold.warnAt > threshold.criticalAt) {
      findings.push({
        id: `threshold.invalid.${threshold.id}`,
        severity: "fail",
        message: `${threshold.id} has warnAt > criticalAt.`,
      });
    } else {
      findings.push({
        id: `threshold.valid.${threshold.id}`,
        severity: "pass",
        message: `${threshold.id} threshold defined.`,
      });
    }
  }

  for (const conflict of input.liveConflicts ?? []) {
    findings.push({
      id: `live.conflict.${conflict.port}`,
      severity: "fail",
      message: `Reserved port ${conflict.port} occupied by ${conflict.occupant}.`,
    });
  }

  if ((input.liveConflicts ?? []).length === 0) {
    findings.push({
      id: "live.conflicts.none",
      severity: "pass",
      message: "No live reserved-port conflicts reported to audit.",
    });
  }

  const verdict: HostCoexistenceAuditVerdict = findings.some(
    (f) => f.severity === "fail",
  )
    ? "FAIL"
    : "PASS";

  return {
    schemaVersion: "1.0.0",
    programmeId: "APZHUB-1.2-004",
    backlogItemId: "R12-OPS-03",
    riskId: "OPS-R-01",
    executedAt: input.executedAt ?? new Date().toISOString(),
    environment: input.environment ?? "dev",
    findings,
    verdict,
    reservedApzhubPorts: reserved,
    forbiddenLegacyPorts: FORBIDDEN_LEGACY_HOST_PORTS,
    composePorts,
    notes: [
      "Controls are coexistence guards — they do not remap legacy apz-stack ports.",
      "Host Changes that disrupt legacy stack require Owner Approval.",
    ],
    artefactPaths: [...HOST_COEXISTENCE_REQUIRED_ARTEFACTS],
  };
}

export function validateHostCoexistenceAuditEvidence(
  value: unknown,
):
  | { readonly ok: true; readonly evidence: HostCoexistenceAuditEvidence }
  | { readonly ok: false; readonly errors: readonly string[] } {
  const errors: string[] = [];
  if (value === null || typeof value !== "object") {
    return { ok: false, errors: ["evidence must be an object"] };
  }
  const raw = value as Record<string, unknown>;
  if (raw.schemaVersion !== "1.0.0") errors.push("schemaVersion must be 1.0.0");
  if (raw.programmeId !== "APZHUB-1.2-004")
    errors.push("programmeId must be APZHUB-1.2-004");
  if (raw.backlogItemId !== "R12-OPS-03")
    errors.push("backlogItemId must be R12-OPS-03");
  if (raw.riskId !== "OPS-R-01") errors.push("riskId must be OPS-R-01");
  if (raw.verdict !== "PASS" && raw.verdict !== "FAIL") errors.push("verdict invalid");
  if (!Array.isArray(raw.findings) || raw.findings.length === 0) {
    errors.push("findings required");
  }
  if (!Array.isArray(raw.composePorts)) errors.push("composePorts required");
  if (typeof raw.executedAt !== "string" || raw.executedAt.length === 0) {
    errors.push("executedAt required");
  }
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, evidence: value as HostCoexistenceAuditEvidence };
}
