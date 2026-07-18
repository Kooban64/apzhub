import type { DeadLetterMarker, DeadLetterMarkerKind } from "../types";

export type PublicationAdminMarkerStore = {
  mark(input: {
    readonly publicationId: string;
    readonly kind: DeadLetterMarkerKind;
    readonly actorUserId: string;
    readonly reason?: string;
    readonly now?: string;
  }): Promise<DeadLetterMarker>;
  get(publicationId: string): Promise<DeadLetterMarker | null>;
  list(kind?: DeadLetterMarkerKind): Promise<readonly DeadLetterMarker[]>;
};
