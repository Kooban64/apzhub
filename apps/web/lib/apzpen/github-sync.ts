/**
 * Live GitHub PR sync into APZPEN PR security events.
 */

import {
  githubApiFetch,
  resolveGithubAccessToken,
  type GithubAuthMode,
} from "./github-app-auth";
import type { PrSecurityCheck, PrSecurityEvent } from "./github-pr-security";
import { pickRepositoryForEngagement, parseOwnerRepo } from "./source-scope";
import { newId } from "./store";
import type { Engagement } from "./types";

export type GithubPrSyncResult = {
  readonly mode: Exclude<GithubAuthMode, "none">;
  readonly repository: string;
  readonly imported: number;
  readonly events: readonly PrSecurityEvent[];
};

function pickRepository(engagement: Engagement): string | null {
  return pickRepositoryForEngagement(engagement);
}

type GhPull = {
  readonly number: number;
  readonly title: string;
  readonly html_url: string;
  readonly user?: { login?: string };
  readonly head?: { ref?: string };
  readonly base?: { ref?: string };
};

type GhFile = { readonly filename?: string };

type GhCheckRun = {
  readonly name?: string;
  readonly status?: string;
  readonly conclusion?: string | null;
};

function mapCheckRuns(runs: readonly GhCheckRun[]): PrSecurityCheck[] {
  const mapped = runs.slice(0, 20).map((r, i) => {
    const conclusion = (r.conclusion ?? "").toLowerCase();
    const statusRaw = (r.status ?? "").toLowerCase();
    let status: PrSecurityCheck["status"] = "pending";
    if (statusRaw === "completed") {
      if (
        conclusion === "success" ||
        conclusion === "neutral" ||
        conclusion === "skipped"
      ) {
        status = conclusion === "success" ? "success" : "neutral";
      } else if (
        conclusion === "failure" ||
        conclusion === "timed_out" ||
        conclusion === "action_required" ||
        conclusion === "cancelled"
      ) {
        status = "failure";
      } else {
        status = "neutral";
      }
    }
    const name = r.name ?? `check-${i}`;
    const required = /security|semgrep|trivy|codeql|sast|apzpen/i.test(name);
    return {
      id: `gh-${i}-${name}`.slice(0, 64),
      label: name,
      status,
      required,
    };
  });
  if (mapped.length === 0) {
    return [
      {
        id: "apzpen-security-review",
        label: "APZPEN security review",
        status: "pending",
        required: true,
      },
    ];
  }
  return mapped;
}

export async function syncGithubPullRequests(input: {
  readonly engagement: Engagement;
  readonly repository?: string;
  readonly limit?: number;
  readonly fetchFn?: typeof fetch;
}): Promise<GithubPrSyncResult> {
  const tokenResult = await resolveGithubAccessToken({
    fetchFn: input.fetchFn,
  });
  if (!tokenResult) {
    throw new Error(
      "No GitHub credentials — configure `.secrets/github-app` or `.secrets/git`.",
    );
  }

  const repoFull = input.repository ?? pickRepository(input.engagement) ?? undefined;
  if (!repoFull) {
    throw new Error(
      "No repository in engagement scope — add a repository scope target (owner/repo).",
    );
  }
  const parsed = parseOwnerRepo(repoFull);
  if (!parsed) {
    throw new Error(`Invalid repository identifier: ${repoFull}`);
  }

  const limit = input.limit ?? 10;
  const listRes = await githubApiFetch({
    path: `/repos/${parsed.owner}/${parsed.repo}/pulls?state=open&per_page=${limit}`,
    token: tokenResult.token,
    fetchFn: input.fetchFn,
  });
  if (!listRes.ok) {
    const text = await listRes.text();
    throw new Error(
      `GitHub list PRs failed (${listRes.status}): ${text.slice(0, 240)}`,
    );
  }
  const pulls = (await listRes.json()) as GhPull[];
  const events: PrSecurityEvent[] = [];

  for (const pr of pulls) {
    const filesRes = await githubApiFetch({
      path: `/repos/${parsed.owner}/${parsed.repo}/pulls/${pr.number}/files?per_page=100`,
      token: tokenResult.token,
      fetchFn: input.fetchFn,
    });
    const files = filesRes.ok ? ((await filesRes.json()) as GhFile[]) : [];
    const checksRes = await githubApiFetch({
      path: `/repos/${parsed.owner}/${parsed.repo}/commits/${encodeURIComponent(pr.head?.ref ?? "")}/check-runs`,
      token: tokenResult.token,
      fetchFn: input.fetchFn,
    });
    let checkRuns: GhCheckRun[] = [];
    if (checksRes.ok) {
      const payload = (await checksRes.json()) as {
        check_runs?: GhCheckRun[];
      };
      checkRuns = payload.check_runs ?? [];
    }

    events.push({
      eventId: newId("pr"),
      tenantId: input.engagement.tenantId,
      engagementId: input.engagement.engagementId,
      provider: "github",
      repository: parsed.full,
      prNumber: pr.number,
      title: pr.title,
      author: pr.user?.login ?? "unknown",
      branch: pr.head?.ref ?? "",
      baseBranch: pr.base?.ref ?? "main",
      url: pr.html_url,
      changedPaths: files.map((f) => f.filename).filter((x): x is string => Boolean(x)),
      checks: mapCheckRuns(checkRuns),
      receivedAt: new Date().toISOString(),
    });
  }

  return {
    mode: tokenResult.mode,
    repository: parsed.full,
    imported: events.length,
    events,
  };
}
