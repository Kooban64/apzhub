/**
 * SearchPublicationLogger — structured, redacted logging (APZSEARCH-009).
 */

import type { SearchPublicationOperation } from "./result";

export type SearchPublicationLogLevel = "debug" | "info" | "warn" | "error";

export type SearchPublicationLogEntry = {
  readonly level: SearchPublicationLogLevel;
  readonly message: string;
  readonly correlationId?: string;
  readonly operation?: SearchPublicationOperation;
  readonly entityId?: string;
  readonly productId?: string;
  readonly at: string;
};

export type SearchPublicationLogSink = {
  write(entry: SearchPublicationLogEntry): void;
};

export class SearchPublicationLogger {
  private readonly entries: SearchPublicationLogEntry[] = [];

  constructor(private readonly sink?: SearchPublicationLogSink) {}

  log(
    level: SearchPublicationLogLevel,
    message: string,
    fields?: {
      readonly correlationId?: string;
      readonly operation?: SearchPublicationOperation;
      readonly entityId?: string;
      readonly productId?: string;
    },
  ): void {
    const entry: SearchPublicationLogEntry = {
      level,
      message,
      correlationId: fields?.correlationId,
      operation: fields?.operation,
      entityId: fields?.entityId,
      productId: fields?.productId,
      at: new Date().toISOString(),
    };
    this.entries.push(entry);
    this.sink?.write(entry);
  }

  recent(limit = 50): readonly SearchPublicationLogEntry[] {
    return this.entries.slice(-limit);
  }
}
