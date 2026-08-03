import type { ScmProvider } from "../contracts/provider";
import type { ScmProviderId } from "../contracts/repository";

const PLACEHOLDER_IDS = [
  "gitlab",
  "azure_devops",
  "bitbucket",
  "gitea",
  "forgejo",
] as const satisfies readonly ScmProviderId[];

function createPlaceholder(providerId: ScmProviderId, name: string): ScmProvider {
  const refuse = async () => {
    throw new Error(
      `Provider ${providerId} is a placeholder and cannot execute in APZQEP-162`,
    );
  };

  return {
    descriptor: {
      providerId,
      name,
      version: "0.0.0",
      status: "placeholder",
      capabilities: ["registered", "not-implemented-apzqep-162"],
    },
    connect: refuse,
    health: async () => ({ ok: false, detail: "placeholder" }),
    listRepositories: refuse,
    getRepository: refuse,
    listBranches: refuse,
    listCommits: refuse,
    listPullRequests: refuse,
    verifyWebhook: () => ({ ok: false, reason: "placeholder provider" }),
    normalizeWebhook: () => undefined,
  };
}

export function createPlaceholderScmProviders(): readonly ScmProvider[] {
  return [
    createPlaceholder("gitlab", "GitLab Provider"),
    createPlaceholder("azure_devops", "Azure DevOps Provider"),
    createPlaceholder("bitbucket", "Bitbucket Provider"),
    createPlaceholder("gitea", "Gitea Provider"),
    createPlaceholder("forgejo", "Forgejo Provider"),
  ];
}

export { PLACEHOLDER_IDS };
