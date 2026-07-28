/** Integration id — engine branding hidden from users. */
export const GITLAB_CI_INTEGRATION_ID = "gitlab-ci";

export class GitLabCiVendorErrorMapper {
  translate(error: unknown): Error {
    if (error instanceof Error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 401 || status === 403) {
        return Object.assign(new Error("GitLab CI authentication failed"), {
          statusCode: status,
          vendorCode: "AUTH_FAILED",
        });
      }
      if (status === 404) {
        return Object.assign(new Error("GitLab CI resource not found"), {
          statusCode: 404,
          vendorCode: "NOT_FOUND",
        });
      }
      if (status === 429) {
        return Object.assign(new Error("GitLab CI rate limit exceeded"), {
          statusCode: 429,
          vendorCode: "RATE_LIMITED",
        });
      }
      return error;
    }
    return new Error(String(error));
  }
}

export function createGitLabCiVendorErrorMapper(): GitLabCiVendorErrorMapper {
  return new GitLabCiVendorErrorMapper();
}

export function mapGitLabCiUnknownError(error: unknown): Error {
  return createGitLabCiVendorErrorMapper().translate(error);
}
