import { REFERENCE_PREFIXES, type ReferencePrefixKey } from "../constants";
import type { ReferenceSequenceProvider } from "./sequence-provider";
import { MockReferenceSequenceProvider } from "./sequence-provider";

export interface ReferenceGeneratorOptions {
  readonly year?: number;
  readonly sequenceWidth?: number;
  readonly sequenceProvider?: ReferenceSequenceProvider;
}

function padSequence(sequence: number, width: number): string {
  return String(sequence).padStart(width, "0");
}

/** Generates canonical `{PREFIX}-{YYYY}-{SEQ}` reference numbers. */
export class ReferenceNumberGenerator {
  private readonly sequenceProvider: ReferenceSequenceProvider;
  private readonly sequenceWidth: number;

  constructor(options: ReferenceGeneratorOptions = {}) {
    this.sequenceProvider =
      options.sequenceProvider ?? new MockReferenceSequenceProvider();
    this.sequenceWidth = options.sequenceWidth ?? 6;
  }

  next(prefixKey: ReferencePrefixKey, year = new Date().getFullYear()): string {
    const prefix = REFERENCE_PREFIXES[prefixKey];
    const sequence = this.sequenceProvider.nextSequence(prefix, year);
    return `${prefix}-${year}-${padSequence(sequence, this.sequenceWidth)}`;
  }

  nextClientReference(year?: number): string {
    return this.next("client", year);
  }

  nextMatterReference(year?: number): string {
    return this.next("matter", year);
  }

  nextInvoiceReference(year?: number): string {
    return this.next("invoice", year);
  }

  nextTrustAccountCode(year?: number): string {
    return this.next("trustAccount", year);
  }

  nextDocumentReference(year?: number): string {
    return this.next("document", year);
  }

  nextTaskReference(year?: number): string {
    return this.next("task", year);
  }

  nextTimeEntryReference(year?: number): string {
    return this.next("timeEntry", year);
  }

  nextCalendarEventReference(year?: number): string {
    return this.next("calendarEvent", year);
  }

  nextPaymentReference(year?: number): string {
    return this.next("payment", year);
  }

  nextTrustTransactionReference(year?: number): string {
    return this.next("trustTransaction", year);
  }
}
