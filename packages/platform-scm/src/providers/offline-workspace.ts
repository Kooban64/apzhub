/**
 * Offline CE demo workspace — provider-neutral file maps for Source Phase E.
 * Used when live API mode is off; mutable for commit/branch/PR demos.
 */

import type {
  ScmBranchRef,
  ScmCommitRef,
  ScmPullRequestRef,
} from "../contracts/repository";
import type {
  ScmCommitFilesInput,
  ScmCreateBranchInput,
  ScmCreatePullRequestInput,
  ScmFileContent,
  ScmFileDiff,
  ScmTreeEntry,
} from "../contracts/content";

type BranchFiles = Map<string, string>;

const SEED_FILES: Readonly<Record<string, string>> = {
  "README.md":
    "# APZ repository\n\nShared Source Workspace offline demo content.\nProviders stay behind adapters.\n",
  "src/app.ts":
    "export function greet(name: string): string {\n  return `Hello, ${name}`;\n}\n",
  "docs/architecture.md":
    "# Architecture\n\nModule → Platform Service → Connector → Engine.\n",
};

function seedBranch(): BranchFiles {
  return new Map(Object.entries(SEED_FILES));
}

/** Deterministic content fingerprint — avoid node:crypto in jsdom vitest. */
function shaFor(content: string): string {
  let hash = 2166136261;
  for (let i = 0; i < content.length; i += 1) {
    hash ^= content.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function basename(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 1] ?? path;
}

export class OfflineSourceWorkspace {
  private readonly trees = new Map<string, BranchFiles>();
  private readonly branches = new Map<string, ScmBranchRef[]>();
  private readonly commits = new Map<string, ScmCommitRef[]>();
  private readonly pullRequests = new Map<string, ScmPullRequestRef[]>();

  private key(fullName: string, branch: string): string {
    return `${fullName}::${branch}`;
  }

  private ensureRepo(fullName: string, defaultBranch = "main"): void {
    if (!this.branches.has(fullName)) {
      this.branches.set(fullName, [
        { name: defaultBranch, sha: `offline-${defaultBranch}`, protected: true },
        { name: "develop", sha: "offline-develop", protected: false },
      ]);
      this.trees.set(this.key(fullName, defaultBranch), seedBranch());
      this.trees.set(this.key(fullName, "develop"), seedBranch());
      this.commits.set(fullName, [
        {
          sha: "offline-commit-1",
          message: "chore: offline seed commit",
          authorName: "APZHUB",
          authorEmail: "dev@apzhub.local",
          committedAt: new Date().toISOString(),
          branch: defaultBranch,
        },
      ]);
      this.pullRequests.set(fullName, []);
    }
  }

  listBranches(fullName: string): readonly ScmBranchRef[] {
    this.ensureRepo(fullName);
    return [...(this.branches.get(fullName) ?? [])];
  }

  listCommits(
    fullName: string,
    options?: { readonly branch?: string; readonly limit?: number },
  ): readonly ScmCommitRef[] {
    this.ensureRepo(fullName);
    const all = this.commits.get(fullName) ?? [];
    const filtered = options?.branch
      ? all.filter((c) => !c.branch || c.branch === options.branch)
      : all;
    return filtered.slice(0, options?.limit ?? 20);
  }

  listPullRequests(fullName: string): readonly ScmPullRequestRef[] {
    this.ensureRepo(fullName);
    return [...(this.pullRequests.get(fullName) ?? [])];
  }

  listTree(
    fullName: string,
    options?: { readonly branch?: string; readonly path?: string },
  ): readonly ScmTreeEntry[] {
    this.ensureRepo(fullName);
    const branch = options?.branch ?? "main";
    const files = this.trees.get(this.key(fullName, branch)) ?? new Map();
    const prefix = options?.path?.replace(/\/$/, "") ?? "";

    // No path → flat file list (workspace explorer MVP).
    if (!prefix) {
      return [...files.keys()]
        .sort((a, b) => a.localeCompare(b))
        .map((path) => ({
          path,
          name: path,
          type: "file" as const,
          sha: shaFor(files.get(path) ?? ""),
          size: (files.get(path) ?? "").length,
        }));
    }

    const entries = new Map<string, ScmTreeEntry>();

    for (const path of files.keys()) {
      if (path !== prefix && !path.startsWith(`${prefix}/`)) continue;
      const relative = path.slice(prefix.length + 1);
      if (!relative) continue;
      const slash = relative.indexOf("/");
      if (slash === -1) {
        entries.set(path, {
          path,
          name: basename(path),
          type: "file",
          sha: shaFor(files.get(path) ?? ""),
          size: (files.get(path) ?? "").length,
        });
      } else {
        const dirName = relative.slice(0, slash);
        const dirPath = `${prefix}/${dirName}`;
        if (!entries.has(dirPath)) {
          entries.set(dirPath, {
            path: dirPath,
            name: dirName,
            type: "dir",
          });
        }
      }
    }

    return [...entries.values()].sort((a, b) => {
      if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
      return a.path.localeCompare(b.path);
    });
  }

  getFileContent(
    fullName: string,
    options: { readonly path: string; readonly branch?: string },
  ): ScmFileContent | undefined {
    this.ensureRepo(fullName);
    const branch = options.branch ?? "main";
    const content = this.trees.get(this.key(fullName, branch))?.get(options.path);
    if (content === undefined) return undefined;
    return {
      path: options.path,
      branch,
      content,
      encoding: "utf-8",
      sha: shaFor(content),
    };
  }

  getFileDiff(
    fullName: string,
    options: {
      readonly path: string;
      readonly baseRef: string;
      readonly headRef: string;
    },
  ): ScmFileDiff | undefined {
    this.ensureRepo(fullName);
    const base = this.trees.get(this.key(fullName, options.baseRef))?.get(options.path);
    const head = this.trees.get(this.key(fullName, options.headRef))?.get(options.path);
    if (base === undefined && head === undefined) return undefined;
    let status: ScmFileDiff["status"] = "unchanged";
    if (base === undefined && head !== undefined) status = "added";
    else if (base !== undefined && head === undefined) status = "removed";
    else if (base !== head) status = "modified";
    const patch =
      status === "unchanged"
        ? ""
        : [
            `--- a/${options.path} (${options.baseRef})`,
            `+++ b/${options.path} (${options.headRef})`,
            `@@`,
            ...(base !== undefined ? base.split("\n").map((l) => `- ${l}`) : []),
            ...(head !== undefined ? head.split("\n").map((l) => `+ ${l}`) : []),
          ].join("\n");
    return {
      path: options.path,
      baseRef: options.baseRef,
      headRef: options.headRef,
      patch,
      status,
    };
  }

  createBranch(fullName: string, input: ScmCreateBranchInput): ScmBranchRef {
    this.ensureRepo(fullName);
    const branches = this.branches.get(fullName) ?? [];
    if (branches.some((b) => b.name === input.name)) {
      throw new Error(`Branch already exists: ${input.name}`);
    }
    const source = this.trees.get(this.key(fullName, input.fromRef)) ?? seedBranch();
    this.trees.set(this.key(fullName, input.name), new Map(source));
    const created: ScmBranchRef = {
      name: input.name,
      sha: `offline-${input.name}-${newId("br").slice(-8)}`,
      protected: false,
    };
    this.branches.set(fullName, [...branches, created]);
    return created;
  }

  commitFiles(fullName: string, input: ScmCommitFilesInput): ScmCommitRef {
    this.ensureRepo(fullName);
    const key = this.key(fullName, input.branch);
    const tree = this.trees.get(key);
    if (!tree) {
      throw new Error(`Unknown branch: ${input.branch}`);
    }
    const next = new Map(tree);
    for (const file of input.files) {
      if (file.operation === "delete") {
        next.delete(file.path);
      } else {
        next.set(file.path, file.content);
      }
    }
    this.trees.set(key, next);
    const commit: ScmCommitRef = {
      sha: newId("offline"),
      message: input.message,
      authorName: "APZHUB",
      authorEmail: "dev@apzhub.local",
      committedAt: new Date().toISOString(),
      branch: input.branch,
    };
    const existing = this.commits.get(fullName) ?? [];
    this.commits.set(fullName, [commit, ...existing]);
    const branches = this.branches.get(fullName) ?? [];
    this.branches.set(
      fullName,
      branches.map((b) => (b.name === input.branch ? { ...b, sha: commit.sha } : b)),
    );
    return commit;
  }

  createPullRequest(
    fullName: string,
    input: ScmCreatePullRequestInput,
  ): ScmPullRequestRef {
    this.ensureRepo(fullName);
    const existing = this.pullRequests.get(fullName) ?? [];
    const number = existing.length + 1;
    const pr: ScmPullRequestRef = {
      externalId: `offline-pr-${number}`,
      number,
      title: input.title,
      state: "open",
      sourceBranch: input.sourceBranch,
      targetBranch: input.targetBranch,
      authorLogin: "apzor-bot",
      updatedAt: new Date().toISOString(),
    };
    this.pullRequests.set(fullName, [pr, ...existing]);
    return pr;
  }
}
