/**
 * Structural workflow graph validation (APZWORKFLOW-001).
 * Metadata structure only — no runtime execution checks.
 */

import type {
  WorkflowGraphSnapshot,
  WorkflowValidationIssue,
} from "@apzhub/workflow-contracts";
import { WORKFLOW_NODE_KINDS } from "@apzhub/workflow-contracts";

function isConfigValue(value: unknown): boolean {
  return (
    typeof value === "string" || typeof value === "number" || typeof value === "boolean"
  );
}

export function validateWorkflowStructural(
  graph: WorkflowGraphSnapshot | undefined,
): readonly WorkflowValidationIssue[] {
  const issues: WorkflowValidationIssue[] = [];
  if (!graph) {
    issues.push({
      code: "structural",
      message: "Workflow graph is required",
      path: "graph",
      severity: "error",
    });
    return issues;
  }

  if (!Array.isArray(graph.nodes) || graph.nodes.length === 0) {
    issues.push({
      code: "structural",
      message: "Workflow graph must contain at least one node",
      path: "graph.nodes",
      severity: "error",
    });
  }

  if (!Array.isArray(graph.connections)) {
    issues.push({
      code: "structural",
      message: "Workflow graph connections must be an array",
      path: "graph.connections",
      severity: "error",
    });
    return issues;
  }

  const nodeIds = new Set<string>();
  for (const [index, node] of (graph.nodes ?? []).entries()) {
    if (!node?.id || typeof node.id !== "string") {
      issues.push({
        code: "structural",
        message: "Graph node id is required",
        path: `graph.nodes[${index}].id`,
        severity: "error",
      });
      continue;
    }
    if (nodeIds.has(node.id)) {
      issues.push({
        code: "structural",
        message: `Duplicate graph node id: ${node.id}`,
        path: `graph.nodes[${index}].id`,
        severity: "error",
      });
    }
    nodeIds.add(node.id);

    if (!(WORKFLOW_NODE_KINDS as readonly string[]).includes(node.nodeKind)) {
      issues.push({
        code: "structural",
        message: `Invalid nodeKind: ${String(node.nodeKind)}`,
        path: `graph.nodes[${index}].nodeKind`,
        severity: "error",
      });
    }
    if (!node.kind || typeof node.kind !== "string") {
      issues.push({
        code: "structural",
        message: "Graph node kind string is required",
        path: `graph.nodes[${index}].kind`,
        severity: "error",
      });
    }
    if (node.config == null || typeof node.config !== "object") {
      issues.push({
        code: "structural",
        message: "Graph node config object is required",
        path: `graph.nodes[${index}].config`,
        severity: "error",
      });
    } else {
      for (const [key, value] of Object.entries(node.config)) {
        if (!isConfigValue(value)) {
          issues.push({
            code: "structural",
            message: `Config value for ${key} must be string, number, or boolean`,
            path: `graph.nodes[${index}].config.${key}`,
            severity: "error",
          });
        }
      }
    }
  }

  for (const [index, connection] of graph.connections.entries()) {
    if (!connection?.id) {
      issues.push({
        code: "structural",
        message: "Connection id is required",
        path: `graph.connections[${index}].id`,
        severity: "error",
      });
    }
    if (!connection?.sourceNodeId || !nodeIds.has(connection.sourceNodeId)) {
      issues.push({
        code: "structural",
        message: `Connection sourceNodeId not found in graph: ${String(connection?.sourceNodeId)}`,
        path: `graph.connections[${index}].sourceNodeId`,
        severity: "error",
      });
    }
    if (!connection?.targetNodeId || !nodeIds.has(connection.targetNodeId)) {
      issues.push({
        code: "structural",
        message: `Connection targetNodeId not found in graph: ${String(connection?.targetNodeId)}`,
        path: `graph.connections[${index}].targetNodeId`,
        severity: "error",
      });
    }
    if (connection?.config) {
      for (const [key, value] of Object.entries(connection.config)) {
        if (!isConfigValue(value)) {
          issues.push({
            code: "structural",
            message: `Connection config value for ${key} must be string, number, or boolean`,
            path: `graph.connections[${index}].config.${key}`,
            severity: "error",
          });
        }
      }
    }
  }

  const hasTrigger = (graph.nodes ?? []).some((n) => n.nodeKind === "trigger");
  if ((graph.nodes ?? []).length > 0 && !hasTrigger) {
    issues.push({
      code: "structural",
      message: "Workflow graph should include at least one trigger node",
      path: "graph.nodes",
      severity: "warning",
    });
  }

  return issues;
}
