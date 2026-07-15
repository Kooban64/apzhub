/**
 * SearchPublicationErrorTranslator — maps failures to SearchDomainError (APZSEARCH-009).
 * Never exposes Meilisearch / provider details.
 */

import {
  SearchDomainError,
  isSearchDomainError,
  type SearchErrorClassification,
} from "@apzhub/search-contracts";

const SECRETISH = /(api[_-]?key|token|password|secret|authorization)/i;

export class SearchPublicationErrorTranslator {
  translate(
    error: unknown,
    fallback: SearchErrorClassification = "validation_failed",
  ): SearchDomainError {
    if (isSearchDomainError(error)) {
      return new SearchDomainError(
        error.classification,
        this.redact(error.message),
        this.redactDetails(error.details),
      );
    }

    if (error instanceof Error) {
      const message = this.redact(error.message);
      if (/lifecycle/i.test(message)) {
        return new SearchDomainError("conflict", message);
      }
      if (/not found/i.test(message)) {
        return new SearchDomainError("not_found", message);
      }
      if (/tenant/i.test(message)) {
        return new SearchDomainError("tenant_mismatch", message);
      }
      if (/organisation/i.test(message)) {
        return new SearchDomainError("organisation_mismatch", message);
      }
      return new SearchDomainError(fallback, message);
    }

    return new SearchDomainError(fallback, "Search publication failed");
  }

  private redact(message: string): string {
    return message
      .replace(
        /(api[_-]?key|token|password|secret|authorization)\s*[=:]\s*\S+/gi,
        "$1=[redacted]",
      )
      .replace(SECRETISH, "[redacted]");
  }

  private redactDetails(
    details?: Readonly<Record<string, unknown>>,
  ): Readonly<Record<string, unknown>> | undefined {
    if (!details) return undefined;
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(details)) {
      if (SECRETISH.test(key)) {
        out[key] = "[redacted]";
      } else if (typeof value === "string") {
        out[key] = this.redact(value);
      } else {
        out[key] = value;
      }
    }
    return out;
  }
}
