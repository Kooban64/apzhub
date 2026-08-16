import type {
  ScmAuthCredentials,
  ScmBranchRef,
  ScmCommitRef,
  ScmProviderDescriptor,
  ScmProviderId,
  ScmPullRequestRef,
  ScmReleaseRef,
  ScmRepositoryRef,
  ScmTagRef,
} from "./repository";
import type { ScmWebhookDelivery, ScmWebhookRegistration } from "./webhook";
import type {
  ScmCommitFilesInput,
  ScmCreateBranchInput,
  ScmCreatePullRequestInput,
  ScmFileContent,
  ScmFileDiff,
  ScmTreeEntry,
} from "./content";

export interface ScmProviderContext {
  readonly tenantId: string;
  readonly correlationId: string;
  readonly credentials?: ScmAuthCredentials;
  readonly signal?: AbortSignal;
}

/**
 * SCM Provider Interface — all source-control engines implement this.
 * The SCM Engine depends only on this contract, never on GitHub.
 * Phase E content/write methods are optional — placeholders omit them.
 */
export interface ScmProvider {
  readonly descriptor: ScmProviderDescriptor;
  connect(
    context: ScmProviderContext,
  ): Promise<{ readonly ok: boolean; readonly detail?: string }>;
  health(
    context: ScmProviderContext,
  ): Promise<{ readonly ok: boolean; readonly detail?: string }>;
  listRepositories(context: ScmProviderContext): Promise<readonly ScmRepositoryRef[]>;
  getRepository(
    context: ScmProviderContext,
    fullName: string,
  ): Promise<ScmRepositoryRef | undefined>;
  listBranches(
    context: ScmProviderContext,
    fullName: string,
  ): Promise<readonly ScmBranchRef[]>;
  listCommits(
    context: ScmProviderContext,
    fullName: string,
    options?: { readonly branch?: string; readonly limit?: number },
  ): Promise<readonly ScmCommitRef[]>;
  listPullRequests(
    context: ScmProviderContext,
    fullName: string,
    options?: { readonly state?: "open" | "closed" | "all"; readonly limit?: number },
  ): Promise<readonly ScmPullRequestRef[]>;
  listTags?(
    context: ScmProviderContext,
    fullName: string,
  ): Promise<readonly ScmTagRef[]>;
  listReleases?(
    context: ScmProviderContext,
    fullName: string,
  ): Promise<readonly ScmReleaseRef[]>;
  registerWebhook?(
    context: ScmProviderContext,
    fullName: string,
    registration: ScmWebhookRegistration,
  ): Promise<{
    readonly ok: boolean;
    readonly externalWebhookId?: string;
    readonly detail?: string;
  }>;
  verifyWebhook(
    headers: Readonly<Record<string, string | undefined>>,
    rawBody: string,
    secret: string,
  ): { readonly ok: boolean; readonly reason?: string };
  normalizeWebhook(
    headers: Readonly<Record<string, string | undefined>>,
    payload: unknown,
  ): ScmWebhookDelivery | undefined;

  /** Phase E — repository tree (branch-scoped). */
  listTree?(
    context: ScmProviderContext,
    fullName: string,
    options?: { readonly branch?: string; readonly path?: string },
  ): Promise<readonly ScmTreeEntry[]>;
  /** Phase E — file blob content. */
  getFileContent?(
    context: ScmProviderContext,
    fullName: string,
    options: { readonly path: string; readonly branch?: string },
  ): Promise<ScmFileContent | undefined>;
  /** Phase E — unified diff for a path between two refs. */
  getFileDiff?(
    context: ScmProviderContext,
    fullName: string,
    options: {
      readonly path: string;
      readonly baseRef: string;
      readonly headRef: string;
    },
  ): Promise<ScmFileDiff | undefined>;
  /** Phase E — create branch from ref. */
  createBranch?(
    context: ScmProviderContext,
    fullName: string,
    input: ScmCreateBranchInput,
  ): Promise<ScmBranchRef>;
  /** Phase E — commit file changes to a branch (implies push on hosted providers). */
  commitFiles?(
    context: ScmProviderContext,
    fullName: string,
    input: ScmCommitFilesInput,
  ): Promise<ScmCommitRef>;
  /** Phase E — open a pull/merge request. */
  createPullRequest?(
    context: ScmProviderContext,
    fullName: string,
    input: ScmCreatePullRequestInput,
  ): Promise<ScmPullRequestRef>;
}

export type ScmProviderFactory = () => ScmProvider;

export function isActiveScmProvider(provider: ScmProvider): boolean {
  return provider.descriptor.status === "active";
}

export type { ScmProviderId };
