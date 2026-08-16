/**
 * Provider-neutral Source content / write contracts (Phase E).
 * External APIs must never expose GitHub-specific types.
 */

export type ScmTreeEntryType = "file" | "dir";

export interface ScmTreeEntry {
  readonly path: string;
  readonly name: string;
  readonly type: ScmTreeEntryType;
  readonly sha?: string;
  readonly size?: number;
}

export interface ScmFileContent {
  readonly path: string;
  readonly branch: string;
  readonly content: string;
  readonly encoding: "utf-8";
  readonly sha?: string;
  readonly truncated?: boolean;
}

export type ScmDiffStatus = "added" | "modified" | "removed" | "renamed" | "unchanged";

export interface ScmFileDiff {
  readonly path: string;
  readonly baseRef: string;
  readonly headRef: string;
  readonly patch: string;
  readonly status: ScmDiffStatus;
}

export interface ScmCreateBranchInput {
  readonly name: string;
  readonly fromRef: string;
}

export interface ScmCommitFileChange {
  readonly path: string;
  readonly content: string;
  readonly operation?: "upsert" | "delete";
}

export interface ScmCommitFilesInput {
  readonly branch: string;
  readonly message: string;
  readonly files: readonly ScmCommitFileChange[];
}

export interface ScmCreatePullRequestInput {
  readonly title: string;
  readonly body?: string;
  readonly sourceBranch: string;
  readonly targetBranch: string;
}
