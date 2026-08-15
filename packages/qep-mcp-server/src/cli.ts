#!/usr/bin/env node
/**
 * Stdio entry — newline-delimited JSON-RPC MCP messages on stdin/stdout.
 */

import { createInterface } from "node:readline";

import { handleMcpJsonRpc, type JsonRpcRequest } from "./index.js";

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });

rl.on("line", (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    const message = JSON.parse(trimmed) as JsonRpcRequest;
    const response = handleMcpJsonRpc(message);
    // notifications may omit id — still write result for local harness clarity
    if (message.method?.startsWith("notifications/") && message.id === undefined) {
      return;
    }
    process.stdout.write(`${JSON.stringify(response)}\n`);
  } catch (error) {
    process.stdout.write(
      `${JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32700,
          message: error instanceof Error ? error.message : "parse error",
        },
      })}\n`,
    );
  }
});
