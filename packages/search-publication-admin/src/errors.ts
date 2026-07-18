export class SearchPublicationAdminError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.name = "SearchPublicationAdminError";
    this.code = code;
    this.status = status;
  }
}

export class SearchPublicationForbiddenError extends SearchPublicationAdminError {
  constructor(permission: string) {
    super(
      "SEARCH_PUBLICATION_FORBIDDEN",
      `Missing required permission: ${permission}`,
      403,
    );
    this.name = "SearchPublicationForbiddenError";
  }
}

export class SearchPublicationNotFoundError extends SearchPublicationAdminError {
  constructor(id: string) {
    super(
      "SEARCH_PUBLICATION_NOT_FOUND",
      `Publication journal entry not found: ${id}`,
      404,
    );
    this.name = "SearchPublicationNotFoundError";
  }
}
