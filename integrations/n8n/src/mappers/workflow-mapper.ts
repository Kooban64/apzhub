import type {
  N8nCredentialMetadataRecord,
  N8nExecutionMetadataRecord,
  N8nProjectRecord,
  N8nTagRecord,
  N8nUserRecord,
  N8nVariableMetadataRecord,
  N8nWorkflowRecord,
} from "../internal/n8n-api-types";
import type {
  CanonicalCredentialMetadata,
  CanonicalExecutionMetadata,
  CanonicalProjectMetadata,
  CanonicalTagMetadata,
  CanonicalUserMetadata,
  CanonicalVariableMetadata,
  CanonicalWorkflowMetadata,
  CanonicalWorkflowTemplateMetadata,
} from "../models/canonical";

function countConnections(connections: N8nWorkflowRecord["connections"]): number {
  if (!connections || typeof connections !== "object") return 0;
  let total = 0;
  for (const value of Object.values(connections)) {
    if (Array.isArray(value)) {
      total += value.length;
      continue;
    }
    if (value && typeof value === "object") {
      for (const nested of Object.values(value as Record<string, unknown>)) {
        if (Array.isArray(nested)) total += nested.length;
      }
    }
  }
  return total;
}

export function mapN8nWorkflowToCanonical(
  record: N8nWorkflowRecord,
): CanonicalWorkflowMetadata {
  return {
    id: String(record.id),
    name: record.name,
    active: Boolean(record.active),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    tagNames: (record.tags ?? [])
      .map((tag) => tag.name)
      .filter((name): name is string => Boolean(name)),
    nodeCount: record.nodes?.length ?? 0,
    connectionCount: countConnections(record.connections),
    versionHint: record.versionId,
    engine: "n8n",
  };
}

/** Templates are not a first-class Public API for all n8n editions — partial. */
export function mapN8nWorkflowAsTemplateMetadata(
  record: N8nWorkflowRecord,
): CanonicalWorkflowTemplateMetadata {
  return {
    id: String(record.id),
    name: record.name,
    description: undefined,
    tagNames: (record.tags ?? [])
      .map((tag) => tag.name)
      .filter((name): name is string => Boolean(name)),
    engine: "n8n",
    support: "partial",
  };
}

export function mapN8nCredentialMetadata(
  record: N8nCredentialMetadataRecord,
): CanonicalCredentialMetadata {
  return {
    id: String(record.id),
    name: record.name,
    type: record.type,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    engine: "n8n",
    secretsIncluded: false,
  };
}

export function mapN8nVariableMetadata(
  record: N8nVariableMetadataRecord,
): CanonicalVariableMetadata {
  return {
    id: String(record.id),
    key: record.key,
    type: record.type,
    engine: "n8n",
    valueIncluded: false,
  };
}

export function mapN8nExecutionMetadata(
  record: N8nExecutionMetadataRecord,
): CanonicalExecutionMetadata {
  return {
    id: String(record.id),
    workflowId: record.workflowId,
    status: record.status,
    mode: record.mode,
    startedAt: record.startedAt,
    stoppedAt: record.stoppedAt,
    finished: record.finished,
    engine: "n8n",
    payloadIncluded: false,
  };
}

export function mapN8nTagMetadata(record: N8nTagRecord): CanonicalTagMetadata {
  return {
    id: String(record.id),
    name: record.name,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    engine: "n8n",
  };
}

export function mapN8nUserMetadata(record: N8nUserRecord): CanonicalUserMetadata {
  const displayName = [record.firstName, record.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return {
    id: String(record.id),
    email: record.email,
    displayName: displayName || undefined,
    role: record.role,
    engine: "n8n",
  };
}

export function mapN8nProjectMetadata(
  record: N8nProjectRecord,
): CanonicalProjectMetadata {
  return {
    id: String(record.id),
    name: record.name,
    type: record.type,
    engine: "n8n",
    support: "partial",
  };
}
