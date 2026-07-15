import type { ArtifactReference } from "@apzhub/testing-contracts";
import { asArtifactReferenceId } from "@apzhub/testing-contracts";

import type { GitHubArtifactRecord } from "../internal/github-actions-api-types";

/**
 * Map artifact metadata only — never download archive bodies.
 * `uriReference` stores the metadata URL, not a binary payload.
 */
export function mapGitHubArtifact(record: GitHubArtifactRecord): ArtifactReference {
  return {
    id: asArtifactReferenceId(`gart_${record.id}`),
    name: record.name,
    sizeBytes: record.size_in_bytes,
    type: "github_actions_artifact",
    checksum: record.digest ?? undefined,
    storageProvider: "github_actions",
    uriReference: record.url,
    createdAt: record.created_at,
    retentionUntil: record.expires_at ?? undefined,
  };
}
