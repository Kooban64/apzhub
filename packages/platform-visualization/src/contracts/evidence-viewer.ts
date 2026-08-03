/** Evidence viewer kinds — media owned by Evidence Platform. */
export type EvidenceViewerKind =
  | "screenshot"
  | "video"
  | "trace"
  | "execution_log"
  | "artifact_explorer"
  | "evidence_timeline"
  | "relationship"
  | "reference";

export interface EvidenceViewerDescriptor {
  readonly viewerId: string;
  readonly kind: EvidenceViewerKind;
  readonly title: string;
  /** Evidence Platform reference — never a direct object-store credential. */
  readonly evidenceRef: string;
  readonly mimeType?: string;
  readonly caption?: string;
  readonly a11yLabel: string;
}
