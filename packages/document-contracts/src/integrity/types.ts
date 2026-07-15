/** Content integrity contracts (APZDOCS-002). */

import type { DocumentChecksumAlgorithm } from "../storage/types";

export type DocumentIntegrityResult = {
  readonly ok: boolean;
  readonly algorithm: DocumentChecksumAlgorithm;
  readonly expectedHex?: string;
  readonly actualHex: string;
  readonly expectedByteLength?: number;
  readonly actualByteLength: number;
  readonly providerEtagIgnored: true;
  readonly classification:
    | "valid"
    | "checksum_mismatch"
    | "size_mismatch"
    | "corrupt"
    | "incomplete";
};

export type DocumentIntegrityVerifyInput = {
  readonly bytes: Uint8Array;
  readonly expectedHex?: string;
  readonly expectedByteLength?: number;
  readonly algorithm?: DocumentChecksumAlgorithm;
};
